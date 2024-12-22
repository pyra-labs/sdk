import type { AddressLookupTableAccount, Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getDriftSignerPublicKey, getDriftSpotMarketPublicKey, getDriftStatePublicKey, getDriftUserPublicKey, getDriftUserStatsPublicKey, getVaultPublicKey, getVaultSplPublicKey, toRemainingAccount } from "./utils/helpers.js";
import { BN, DRIFT_PROGRAM_ID, type QuoteResponse } from "@drift-labs/sdk";
import type { Quartz } from "./types/idl/quartz.js";
import type { Program } from "@coral-xyz/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { DRIFT_ORACLE_2, DRIFT_SPOT_MARKET_SOL, DRIFT_SPOT_MARKET_USDC } from "./config/constants.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token.js";
import { SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY } from "@solana/web3.js";
import { DRIFT_ORACLE_1 } from "./config/constants.js";
import { SwapMode } from "@jup-ag/api";
import { getJupiterSwapIx } from "./utils/jupiter.js";

export class QuartzUserLight {
    public readonly pubkey: PublicKey;
    public readonly vaultPubkey: PublicKey;

    protected connection: Connection;
    protected program: Program<Quartz>;
    protected quartzLookupTable: AddressLookupTableAccount;
    protected oracles: Map<string, PublicKey>;
    protected driftSigner: PublicKey;

    private driftUserPubkey: PublicKey;
    private driftUserStatsPubkey: PublicKey;

    constructor(
        pubkey: PublicKey,
        connection: Connection,
        program: Program<Quartz>,
        quartzLookupTable: AddressLookupTableAccount,
        oracles: Map<string, PublicKey>
    ) {
        this.pubkey = pubkey;
        this.connection = connection;
        this.program = program;
        this.quartzLookupTable = quartzLookupTable;
        this.oracles = oracles;

        this.driftSigner = getDriftSignerPublicKey();
        this.vaultPubkey = getVaultPublicKey(pubkey);
        this.driftUserPubkey = getDriftUserPublicKey(this.vaultPubkey);
        this.driftUserStatsPubkey = getDriftUserStatsPublicKey(this.vaultPubkey);
    }

    public async makeCloseAccountIxs() {
        const ix_closeDriftAccount = await this.program.methods
            .closeDriftAccount()
            .accounts({
                vault: this.vaultPubkey,
                owner: this.pubkey,
                driftUser: this.driftUserPubkey,
                driftUserStats: this.driftUserStatsPubkey,
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
        mint: PublicKey,
        marketIndex: number,
        reduceOnly: boolean
    ) {
        const ownerSpl = await getAssociatedTokenAddress(mint, this.pubkey);
        
        const ix = await this.program.methods
            .deposit(new BN(amountBaseUnits), marketIndex, reduceOnly)
            .accounts({
                vault: this.vaultPubkey,
                vaultSpl: getVaultSplPublicKey(this.pubkey, mint),
                owner: this.pubkey,
                ownerSpl: ownerSpl,
                splMint: mint,
                driftUser: this.driftUserPubkey,
                driftUserStats: this.driftUserStatsPubkey,
                driftState: getDriftStatePublicKey(),
                spotMarketVault: getDriftSpotMarketPublicKey(marketIndex),
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId
            })
            .remainingAccounts([
                toRemainingAccount(DRIFT_ORACLE_1, false, false),
                toRemainingAccount(DRIFT_ORACLE_2, false, false),
                toRemainingAccount(DRIFT_SPOT_MARKET_SOL, false, true),
                toRemainingAccount(DRIFT_SPOT_MARKET_USDC, false, true),
            ])
            .instruction();

        return ix;
    }

    public async makeWithdrawIx(
        amountBaseUnits: number,
        mint: PublicKey,
        marketIndex: number,
        reduceOnly: boolean
    ) {
        const ownerSpl = await getAssociatedTokenAddress(mint, this.pubkey);
        
        const ix = await this.program.methods
            .withdraw(new BN(amountBaseUnits), marketIndex, reduceOnly)
            .accounts({
                vault: this.vaultPubkey,
                vaultSpl: getVaultSplPublicKey(this.pubkey, mint),
                owner: this.pubkey,
                ownerSpl: ownerSpl,
                splMint: mint,
                driftUser: this.driftUserPubkey,
                driftUserStats: this.driftUserStatsPubkey,
                driftState: getDriftStatePublicKey(),
                spotMarketVault: getDriftSpotMarketPublicKey(marketIndex),
                driftSigner: this.driftSigner,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId
            })
            .remainingAccounts([
                toRemainingAccount(DRIFT_ORACLE_1, false, false),
                toRemainingAccount(DRIFT_ORACLE_2, false, false),
                toRemainingAccount(DRIFT_SPOT_MARKET_SOL, false, true),
                toRemainingAccount(DRIFT_SPOT_MARKET_USDC, false, true),
            ])
            .instruction();

        return ix;
    }

    public async makeCollateralRepayIxs(
        caller: PublicKey,
        callerDepositSpl: PublicKey,
        depositMint: PublicKey,
        depositMarketIndex: number,
        callerWithdrawSpl: PublicKey,
        withdrawMint: PublicKey,
        withdrawMarketIndex: number,
        callerWithdrawSplStartBalance: number,
        jupiterExactOutRouteQuote: QuoteResponse
    ): Promise<{
        ixs: TransactionInstruction[]
        lookupTables: AddressLookupTableAccount[],
    }> {
        if (jupiterExactOutRouteQuote.swapMode !== SwapMode.ExactOut) throw Error("Jupiter quote must be ExactOutRoute");

        if (jupiterExactOutRouteQuote.swapMode !== SwapMode.ExactOut) throw Error("Jupiter quote must be ExactOutRoute");
        if (jupiterExactOutRouteQuote.inputMint !== withdrawMint.toBase58()) throw Error("Jupiter quote inputMint does not match withdrawMint");
        if (jupiterExactOutRouteQuote.outputMint !== depositMint.toBase58()) throw Error("Jupiter quote outputMint does not match depositMint");

        const driftState = getDriftStatePublicKey();
        const driftSpotMarketDeposit = getDriftSpotMarketPublicKey(depositMarketIndex);
        const driftSpotMarketWithdraw = getDriftSpotMarketPublicKey(withdrawMarketIndex);

        const collateralRepayStartPromise = this.program.methods
            .collateralRepayStart(new BN(callerWithdrawSplStartBalance))
            .accounts({
                caller: caller,
                callerWithdrawSpl: callerWithdrawSpl,
                withdrawMint: withdrawMint,
                vault: this.vaultPubkey,
                vaultWithdrawSpl: getVaultSplPublicKey(this.pubkey, withdrawMint),
                owner: this.pubkey,
                tokenProgram: TOKEN_PROGRAM_ID,
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
                driftUser: this.driftUserPubkey,
                driftUserStats: this.driftUserStatsPubkey,
                driftState: driftState,
                spotMarketVault: driftSpotMarketDeposit,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
            })
            .remainingAccounts([
                toRemainingAccount(DRIFT_ORACLE_1, false, false),
                toRemainingAccount(DRIFT_ORACLE_2, false, false),
                toRemainingAccount(DRIFT_SPOT_MARKET_SOL, false, true),
                toRemainingAccount(DRIFT_SPOT_MARKET_USDC, false, true),
            ])
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
                driftUser: this.driftUserPubkey,
                driftUserStats: this.driftUserStatsPubkey,
                driftState: driftState,
                spotMarketVault: driftSpotMarketWithdraw,
                driftSigner: this.driftSigner,
                tokenProgram: TOKEN_PROGRAM_ID,
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                depositPriceUpdate: this.oracles.get("USDC/USD"),
                withdrawPriceUpdate: this.oracles.get("SOL/USD"),
                instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
            })
            .remainingAccounts([
                toRemainingAccount(DRIFT_ORACLE_1, false, false),
                toRemainingAccount(DRIFT_ORACLE_2, false, false),
                toRemainingAccount(DRIFT_SPOT_MARKET_SOL, false, true),
                toRemainingAccount(DRIFT_SPOT_MARKET_USDC, false, true),
            ])
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
