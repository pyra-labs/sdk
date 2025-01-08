import { DriftUser } from "./types/classes/driftUser.class.js";
import type { DriftClient, QuoteResponse, UserAccount } from "@drift-labs/sdk";
import type { Connection, AddressLookupTableAccount, TransactionInstruction, } from "@solana/web3.js";
import { DRIFT_PROGRAM_ID, QUARTZ_HEALTH_BUFFER, } from "./config/constants.js";
import type { Quartz } from "./types/idl/quartz.js";
import type { Program } from "@coral-xyz/anchor";
import type { PublicKey, } from "@solana/web3.js";
import { getDriftSpotMarketVaultPublicKey, getDriftStatePublicKey, getPythOracle, getTokenProgram, getVaultPublicKey, getVaultSplPublicKey } from "./utils/helpers.js";
import { getDriftSignerPublicKey } from "./utils/helpers.js";
import { getAssociatedTokenAddress, } from "@solana/spl-token";
import { SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import BN from "bn.js";
import { getJupiterSwapIx } from "./utils/jupiter.js";
import { SwapMode } from "@jup-ag/api";
import { TOKENS, type MarketIndex } from "./config/tokens.js";

export class QuartzUser {
    public readonly pubkey: PublicKey;
    public readonly vaultPubkey: PublicKey;

    private connection: Connection;
    private program: Program<Quartz>;
    private quartzLookupTable: AddressLookupTableAccount;

    private driftUser: DriftUser;
    private driftSigner: PublicKey;

    constructor(
        pubkey: PublicKey,
        connection: Connection,
        program: Program<Quartz>,
        quartzLookupTable: AddressLookupTableAccount,
        driftClient: DriftClient,
        driftUserAccount: UserAccount
    ) {
        this.pubkey = pubkey;
        this.connection = connection;
        this.program = program;
        this.quartzLookupTable = quartzLookupTable;
        
        this.vaultPubkey = getVaultPublicKey(pubkey);
        this.driftSigner = getDriftSignerPublicKey();

        this.driftUser = new DriftUser(
            this.vaultPubkey,
            driftClient, 
            driftUserAccount
        );
    }

    private convertToQuartzHealth(protocolHealth: number): number {
        if (protocolHealth <= 0) return 0;
        if (protocolHealth >= 100) return 100;

        return Math.floor(
            Math.min(
                100,
                Math.max(
                    0,
                    ((protocolHealth - QUARTZ_HEALTH_BUFFER) / (100 - QUARTZ_HEALTH_BUFFER)) * 100
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
        //                                           loanValue - repayValue                     
        //                  1 - ---------------------------------------------------------------- - quartzHealthBuffer
        //                      currentWeightedCollateral - (repayValue * repayCollateralWeight)
        //   targetHealth = -----------------------------------------------------------------------------------------
        //                                                   1 - quartzHealthBuffer                                  
        //
        // The following is an algebraicly simplified expression of the above formula, in terms of repayValue

        if (targetHealth <= 0 || targetHealth >= 100) throw Error("Target health must be between 0 and 100");
        if (targetHealth <= this.getHealth()) throw Error("Target health must be greater than current health");

        const currentWeightedCollateral = this.getTotalWeightedCollateralValue();
        const loanValue = this.getMaintenanceMarginRequirement();
        const targetHealthDecimal = targetHealth / 100;
        const healthBufferDecimal = QUARTZ_HEALTH_BUFFER / 100;

        return Math.round(
            (
                loanValue - currentWeightedCollateral * (1 - healthBufferDecimal) * (1 - targetHealthDecimal)
            ) / (
                1 - repayCollateralWeight * (1 - healthBufferDecimal) * (1 - targetHealthDecimal)
            )
        );
    }

    public getTotalCollateralValue(): number {
        return this.driftUser.getTotalCollateralValue(undefined).toNumber();
    }

    public getTotalWeightedCollateralValue(): number {
        return this.driftUser.getTotalCollateralValue('Maintenance').toNumber();
    }

    public getMaintenanceMarginRequirement(): number {
        return this.driftUser.getMaintenanceMarginRequirement().toNumber();
    }

    public async getTokenBalance(spotMarketIndex: number): Promise<BN> {
        return this.driftUser.getTokenAmount(spotMarketIndex);
    }

    public async getMultipleTokenBalances(marketIndices: MarketIndex[]): Promise<Record<MarketIndex, BN>> {
        const balancesArray = await Promise.all(
            marketIndices.map(async index => ({
                index,
                balance: await this.getTokenBalance(index)
            }))
        );
    
        const balances = balancesArray.reduce((acc, { index, balance }) => 
            Object.assign(acc, { [index]: balance }
        ), {} as Record<MarketIndex, BN>);
    
        return balances;
    }

    public async getWithdrawalLimit(spotMarketIndex: number): Promise<number> {
        return this.driftUser.getWithdrawalLimit(spotMarketIndex, false, true).toNumber();
    }


    // --- Instructions ---

    public async makeCloseAccountIxs() {
        const ix_closeDriftAccount = await this.program.methods
            .closeDriftAccount()
            .accounts({
                vault: this.vaultPubkey,
                owner: this.pubkey,
                driftUser: this.driftUser.pubkey,
                driftUserStats: this.driftUser.statsPubkey,
                driftState: getDriftStatePublicKey(),
                driftProgram: DRIFT_PROGRAM_ID
            })
            .instruction();

        const ix_closeVault = await this.program.methods
            .closeUser()
            .accounts({
                vault: this.vaultPubkey,
                owner: this.pubkey
            })
            .instruction();

        return [ix_closeDriftAccount, ix_closeVault];
    }

    public async makeDepositIx(
        amountBaseUnits: number,
        marketIndex: MarketIndex,
        reduceOnly: boolean
    ) {
        const mint = TOKENS[marketIndex].mint;
        const tokenProgram = await getTokenProgram(this.connection, mint);
        const ownerSpl = await getAssociatedTokenAddress(mint, this.pubkey, false, tokenProgram);

        const ix = await this.program.methods
            .deposit(new BN(amountBaseUnits), marketIndex, reduceOnly)
            .accounts({
                vault: this.vaultPubkey,
                vaultSpl: getVaultSplPublicKey(this.pubkey, mint),
                owner: this.pubkey,
                ownerSpl: ownerSpl,
                splMint: mint,
                driftUser: this.driftUser.pubkey,
                driftUserStats: this.driftUser.statsPubkey,
                driftState: getDriftStatePublicKey(),
                spotMarketVault: getDriftSpotMarketVaultPublicKey(marketIndex),
                tokenProgram: tokenProgram,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId
            })
            .remainingAccounts(
                this.driftUser.getRemainingAccounts(marketIndex)
            )
            .instruction();

        return ix;
    }

    public async makeWithdrawIx(
        amountBaseUnits: number,
        marketIndex: MarketIndex,
        reduceOnly: boolean
    ) {
        const mint = TOKENS[marketIndex].mint;
        const tokenProgram = await getTokenProgram(this.connection, mint);
        const ownerSpl = await getAssociatedTokenAddress(mint, this.pubkey, false, tokenProgram);
        
        const ix = await this.program.methods
            .withdraw(new BN(amountBaseUnits), marketIndex, reduceOnly)
            .accounts({
                vault: this.vaultPubkey,
                vaultSpl: getVaultSplPublicKey(this.pubkey, mint),
                owner: this.pubkey,
                ownerSpl: ownerSpl,
                splMint: mint,
                driftUser: this.driftUser.pubkey,
                driftUserStats: this.driftUser.statsPubkey,
                driftState: getDriftStatePublicKey(),
                spotMarketVault: getDriftSpotMarketVaultPublicKey(marketIndex),
                driftSigner: this.driftSigner,
                tokenProgram: tokenProgram,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId
            })
            .remainingAccounts(
                this.driftUser.getRemainingAccounts(marketIndex)
            )
            .instruction();

        return ix;
    }

    public async makeCollateralRepayIxs(
        caller: PublicKey,
        depositMarketIndex: MarketIndex,
        withdrawMarketIndex: MarketIndex,
        callerWithdrawSplStartBalance: number,
        jupiterExactOutRouteQuote: QuoteResponse
    ): Promise<{
        ixs: TransactionInstruction[]
        lookupTables: AddressLookupTableAccount[],
    }> {
        const depositMint = TOKENS[depositMarketIndex].mint;
        const withdrawMint = TOKENS[withdrawMarketIndex].mint;

        if (jupiterExactOutRouteQuote.swapMode !== SwapMode.ExactOut) throw Error("Jupiter quote must be ExactOutRoute");
        if (jupiterExactOutRouteQuote.inputMint !== withdrawMint.toBase58()) throw Error("Jupiter quote inputMint does not match withdrawMint");
        if (jupiterExactOutRouteQuote.outputMint !== depositMint.toBase58()) throw Error("Jupiter quote outputMint does not match depositMint");

        const depositTokenProgram = await getTokenProgram(this.connection, depositMint);
        const callerDepositSpl = await getAssociatedTokenAddress(depositMint, caller, false, depositTokenProgram);
        
        const withdrawTokenProgram = await getTokenProgram(this.connection, withdrawMint);
        const callerWithdrawSpl = await getAssociatedTokenAddress(withdrawMint, caller, false, withdrawTokenProgram);

        const driftState = getDriftStatePublicKey();
        const driftSpotMarketDeposit = getDriftSpotMarketVaultPublicKey(depositMarketIndex);
        const driftSpotMarketWithdraw = getDriftSpotMarketVaultPublicKey(withdrawMarketIndex);

        const collateralRepayStartPromise = this.program.methods
            .collateralRepayStart(new BN(callerWithdrawSplStartBalance))
            .accounts({
                caller: caller,
                callerWithdrawSpl: callerWithdrawSpl,
                withdrawMint: withdrawMint,
                vault: this.vaultPubkey,
                vaultWithdrawSpl: getVaultSplPublicKey(this.pubkey, withdrawMint),
                owner: this.pubkey,
                tokenProgram: withdrawTokenProgram,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
            })
            .instruction();

        const jupiterSwapPromise = getJupiterSwapIx(caller, this.connection, jupiterExactOutRouteQuote);

        const collateralRepayDepositPromise = this.program.methods
            .collateralRepayDeposit(depositMarketIndex)
            .accounts({
                vault: this.vaultPubkey,
                vaultSpl: getVaultSplPublicKey(this.pubkey, depositMint),
                owner: this.pubkey,
                caller: caller,
                callerSpl: callerDepositSpl,
                splMint: depositMint,
                driftUser: this.driftUser.pubkey,
                driftUserStats: this.driftUser.statsPubkey,
                driftState: driftState,
                spotMarketVault: driftSpotMarketDeposit,
                tokenProgram: depositTokenProgram,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
            })
            .remainingAccounts(
                this.driftUser.getRemainingAccounts(depositMarketIndex)
            )
            .instruction();

        const collateralRepayWithdrawPromise = this.program.methods
            .collateralRepayWithdraw(withdrawMarketIndex)
            .accounts({
                vault: this.vaultPubkey,
                vaultSpl: getVaultSplPublicKey(this.pubkey, withdrawMint),
                owner: this.pubkey,
                caller: caller,
                callerSpl: callerWithdrawSpl,
                splMint: withdrawMint,
                driftUser: this.driftUser.pubkey,
                driftUserStats: this.driftUser.statsPubkey,
                driftState: driftState,
                spotMarketVault: driftSpotMarketWithdraw,
                driftSigner: this.driftSigner,
                tokenProgram: withdrawTokenProgram,
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                depositPriceUpdate: getPythOracle(depositMarketIndex),
                withdrawPriceUpdate: getPythOracle(withdrawMarketIndex),
                instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
            })
            .remainingAccounts(
                this.driftUser.getRemainingAccounts(withdrawMarketIndex)
            )
            .instruction();

        const [
            ix_collateralRepayStart,
            { ix_jupiterSwap, jupiterLookupTables },
            ix_collateralRepayDeposit,
            ix_collateralRepayWithdraw
        ] = await Promise.all([
            collateralRepayStartPromise,
            jupiterSwapPromise,
            collateralRepayDepositPromise,
            collateralRepayWithdrawPromise
        ]);

        return {
            ixs: [
                ix_collateralRepayStart,
                ix_jupiterSwap,
                ix_collateralRepayDeposit,
                ix_collateralRepayWithdraw
            ],
            lookupTables: [
                this.quartzLookupTable,
                ...jupiterLookupTables
            ],
        };
    }
}
