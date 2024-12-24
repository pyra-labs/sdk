import type { AddressLookupTableAccount, Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getDriftSignerPublicKey, getDriftSpotMarketVaultPublicKey, getDriftStatePublicKey, getDriftUserPublicKey, getDriftUserStatsPublicKey, getRemainingDriftAccounts, getVaultPublicKey, getVaultSplPublicKey, toRemainingAccount } from "./utils/helpers.js";
import type { Quartz } from "./types/idl/quartz.js";
import type { Program } from "@coral-xyz/anchor";
import { DRIFT_PROGRAM_ID } from "./config/constants.js";
import { getAssociatedTokenAddress, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY } from "@solana/web3.js";
import { SwapMode, type QuoteResponse } from "@jup-ag/api";
import { getJupiterSwapIx } from "./utils/jupiter.js";
import { BN } from "bn.js";
import { getPythOracle } from "./index.browser.js";

export class QuartzUserLight {
    public readonly pubkey: PublicKey;
    public readonly vaultPubkey: PublicKey;

    protected connection: Connection;
    protected program: Program<Quartz>;
    protected quartzLookupTable: AddressLookupTableAccount;
    
    private driftUserPubkey: PublicKey;
    private driftUserStatsPubkey: PublicKey;
    protected driftSigner: PublicKey;

    constructor(
        pubkey: PublicKey,
        connection: Connection,
        program: Program<Quartz>,
        quartzLookupTable: AddressLookupTableAccount
    ) {
        this.pubkey = pubkey;
        this.connection = connection;
        this.program = program;
        this.quartzLookupTable = quartzLookupTable;

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
        
        const remainingAccounts = await getRemainingDriftAccounts(marketIndex);

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
                spotMarketVault: getDriftSpotMarketVaultPublicKey(marketIndex),
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId
            })
            .remainingAccounts(remainingAccounts)
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

        const remainingAccounts = await getRemainingDriftAccounts(marketIndex);
        
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
                spotMarketVault: getDriftSpotMarketVaultPublicKey(marketIndex),
                driftSigner: this.driftSigner,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId
            })
            .remainingAccounts(remainingAccounts)
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
            .remainingAccounts(
                getRemainingDriftAccounts(depositMarketIndex)
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
                driftUser: this.driftUserPubkey,
                driftUserStats: this.driftUserStatsPubkey,
                driftState: driftState,
                spotMarketVault: driftSpotMarketWithdraw,
                driftSigner: this.driftSigner,
                tokenProgram: TOKEN_PROGRAM_ID,
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                depositPriceUpdate: getPythOracle(depositMarketIndex),
                withdrawPriceUpdate: getPythOracle(withdrawMarketIndex),
                instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
            })
            .remainingAccounts(
                getRemainingDriftAccounts(withdrawMarketIndex)
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
