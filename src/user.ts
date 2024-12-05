import { AddressLookupTableAccount, PublicKey, SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY, TransactionInstruction } from "@solana/web3.js";
import { DriftUser } from "./model/driftUser";
import { BN, DRIFT_PROGRAM_ID, DriftClient, getSpotMarketPublicKey, QuoteResponse, UserAccount } from "@drift-labs/sdk";
import { getDriftSpotMarketPublicKey, getDriftStatePublicKey, getVaultPublicKey, getVaultSplPublicKey, toRemainingAccount } from "./utils/helpers";
import { Connection } from "@solana/web3.js";
import { DRIFT_MARKET_INDEX_SOL, DRIFT_MARKET_INDEX_USDC, QUARTZ_HEALTH_BUFFER, USDC_MINT, WSOL_MINT } from "./config/constants";
import { Quartz } from "./types/quartz";
import { Program } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SwapMode } from "@jup-ag/api";
import { getJupiterSwapIx } from "./utils/jupiter";

export class QuartzUser {
    private pubkey: PublicKey;
    private vaultPubkey: PublicKey;

    private connection: Connection;
    private program: Program<Quartz>;
    private quartzLookupTable: AddressLookupTableAccount;
    private oracles: Map<string, PublicKey>;

    private driftClient: DriftClient;
    private driftUser: DriftUser;

    constructor(
        pubkey: PublicKey,
        connection: Connection,
        program: Program<Quartz>,
        quartzLookupTable: AddressLookupTableAccount,
        oracles: Map<string, PublicKey>,
        driftClient: DriftClient,
        driftUserAccount?: UserAccount
    ) {
        this.pubkey = pubkey;
        this.vaultPubkey = getVaultPublicKey(pubkey);
        this.connection = connection;
        this.program = program;
        this.quartzLookupTable = quartzLookupTable;
        this.oracles = oracles;
        this.driftClient = driftClient;
        this.driftUser = new DriftUser(this.vaultPubkey, connection, driftClient, driftUserAccount);
    }

    private convertToQuartzHealth(protocolHealth: number): number {
        if (protocolHealth <= 0) return 0;
        if (protocolHealth >= 100) return 100;

        return Math.floor(
            Math.min(
                100,
                Math.max(
                    0,
                    (protocolHealth - QUARTZ_HEALTH_BUFFER) / (1 - QUARTZ_HEALTH_BUFFER)
                )
            )
        );
    }

    public getHealth(): number {
        const driftHealth = this.driftUser.getHealth();
        return this.convertToQuartzHealth(driftHealth);
    }

    public getRepayAmountForTargetHealth(
        targetHealth: number,
        repayCollateralWeight: number
    ): number {
        // New Quartz health after repayment is given as:
        // 
        //                                           loanValue - repayAmount                     
        //                  1 - ----------------------------------------------------------------- - quartzHealthBuffer
        //                      currentWeightedCollateral - (repayAmount * repayCollateralWeight)
        //   targetHealth = -------------------------------------------------------------------------------------------
        //                                                    1 - quartzHealthBuffer                                  
        //
        // The following is an algebraicly simplified expression of the above formula, in terms of repayAmount

        if (targetHealth <= 0 || targetHealth >= 100) throw Error(`Target health must be between 0 and 100`);
        if (targetHealth <= this.getHealth()) throw Error(`Target health must be greater than current health`);

        const currentWeightedCollateral = this.getTotalWeightedCollateral();
        const loanValue = this.getMaintenanceMarginRequirement();

        return Math.round(
            (
                loanValue - currentWeightedCollateral * (1 - QUARTZ_HEALTH_BUFFER) * (1 - targetHealth)
            ) / (
                1 - repayCollateralWeight * (1 - QUARTZ_HEALTH_BUFFER) * (1 - targetHealth)
            )
        );
    }

    public getTotalWeightedCollateral(): number {
        return this.driftUser.getTotalCollateral('Maintenance').toNumber();
    }

    public getMaintenanceMarginRequirement(): number {
        return this.driftUser.getMaintenanceMarginRequirement().toNumber();
    }

    public async makeCollateralRepayIxs(
        caller: PublicKey,
        callerDepositSpl: PublicKey,
        callerWithdrawSpl: PublicKey,
        callerStartingDepositBalance: number,
        jupiterExactOutRouteQuote: QuoteResponse
    ): Promise<{
        ixs: TransactionInstruction[]
        lookupTables: AddressLookupTableAccount[],
    }> {
        const depositMint = USDC_MINT;
        const depositMarketIndex = DRIFT_MARKET_INDEX_USDC;
        const withdrawMint = WSOL_MINT;
        const withdrawMarketIndex = DRIFT_MARKET_INDEX_SOL;

        if (jupiterExactOutRouteQuote.swapMode !== SwapMode.ExactOut) throw Error("Jupiter quote must be ExactOutRoute");
        if (jupiterExactOutRouteQuote.inputMint !== withdrawMint.toBase58()) throw Error("Jupiter quote inputMint does not match withdrawMint");
        if (jupiterExactOutRouteQuote.outputMint !== depositMint.toBase58()) throw Error("Jupiter quote outputMint does not match depositMint");

        const driftState = getDriftStatePublicKey();
        const driftSpotMarketDeposit = getDriftSpotMarketPublicKey(depositMarketIndex);
        const driftSpotMarketWithdraw = getDriftSpotMarketPublicKey(withdrawMarketIndex);

        const autoRepayStartPromise = this.program.methods
            .autoRepayStart(new BN(callerStartingDepositBalance))
            .accounts({
                caller: caller,
                callerWithdrawSpl: callerWithdrawSpl,
                withdrawMint: withdrawMint,
                vault: this.vaultPubkey,
                vaultWithdrawSpl: getVaultSplPublicKey(this.vaultPubkey, withdrawMint),
                owner: this.pubkey,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
            })
            .instruction();

        const jupiterSwapPromise = getJupiterSwapIx(caller, this.connection, jupiterExactOutRouteQuote);

        const autoRepayDepositPromise = this.program.methods
            .autoRepayDeposit(depositMarketIndex)
            .accounts({
                vault: this.vaultPubkey,
                vaultSpl: getVaultSplPublicKey(this.vaultPubkey, depositMint),
                owner: this.pubkey,
                caller: caller,
                callerSpl: callerDepositSpl,
                splMint: depositMint,
                driftUser: this.driftUser.pubkey,
                driftUserStats: this.driftUser.statsPubkey,
                driftState: driftState,
                spotMarketVault: driftSpotMarketDeposit,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                driftProgram: new PublicKey(DRIFT_PROGRAM_ID),
                systemProgram: SystemProgram.programId,
                instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
            })
            .remainingAccounts(
                this.driftClient.getRemainingAccounts({
                    userAccounts: [this.driftUser.getDriftUserAccount()],
                    useMarketLastSlotCache: true,
                    writableSpotMarketIndexes: [depositMarketIndex],
                })
            )
            .instruction();

        const autoRepayWithdrawPromise = this.program.methods
            .autoRepayWithdraw(withdrawMarketIndex)
            .accounts({
                vault: this.vaultPubkey,
                vaultSpl: getVaultSplPublicKey(this.vaultPubkey, withdrawMint),
                owner: this.pubkey,
                caller: caller,
                callerSpl: callerWithdrawSpl,
                splMint: withdrawMint,
                driftUser: this.driftUser.pubkey,
                driftUserStats: this.driftUser.statsPubkey,
                driftState: driftState,
                spotMarketVault: driftSpotMarketWithdraw,
                driftSigner: this.driftClient.getSignerPublicKey(),
                tokenProgram: TOKEN_PROGRAM_ID,
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                depositPriceUpdate: this.oracles.get("USDC/USD"),
                withdrawPriceUpdate: this.oracles.get("SOL/USD"),
                instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
            })
            .remainingAccounts(
                this.driftClient.getRemainingAccounts({
                    userAccounts: [this.driftUser.getDriftUserAccount()],
                    useMarketLastSlotCache: true,
                    writableSpotMarketIndexes: [withdrawMarketIndex],
                    readableSpotMarketIndexes: [DRIFT_MARKET_INDEX_USDC], // Quote is in USDC
                })
            )
            .instruction();

        const [
            ix_autoRepayStart,
            { ix_jupiterSwap, jupiterLookupTables },
            ix_autoRepayDeposit,
            ix_autoRepayWithdraw
        ] = await Promise.all([
            autoRepayStartPromise,
            jupiterSwapPromise,
            autoRepayDepositPromise,
            autoRepayWithdrawPromise
        ]);

        return {
            ixs: [
                ix_autoRepayStart,
                ix_jupiterSwap,
                ix_autoRepayDeposit,
                ix_autoRepayWithdraw
            ],
            lookupTables: [
                this.quartzLookupTable,
                ...jupiterLookupTables
            ],
        };
    }
}
