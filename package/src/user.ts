import { DriftUser } from "./types/classes/driftUser.class.js";
import type { DriftClient, UserAccount } from "@drift-labs/sdk";
import type { Connection, AddressLookupTableAccount, TransactionInstruction, } from "@solana/web3.js";
import { DRIFT_PROGRAM_ID, MARKET_INDEX_USDC, MESSAGE_TRANSMITTER_PROGRAM_ID, QUARTZ_HEALTH_BUFFER, TOKEN_MESSAGE_MINTER_PROGRAM_ID, } from "./config/constants.js";
import type { Quartz } from "./types/idl/quartz.js";
import type { Program } from "@coral-xyz/anchor";
import type { PublicKey, } from "@solana/web3.js";
import { getDriftSpotMarketVaultPublicKey, getDriftStatePublicKey, getPythOracle, getDriftSignerPublicKey, getVaultPublicKey, getVaultSplPublicKey, getCollateralRepayLedgerPublicKey, getBridgeRentPayerPublicKey, getLocalToken, getTokenMinter, getRemoteTokenMessenger, getTokenMessenger, getSenderAuthority, getMessageTransmitter, getEventAuthority, getInitRentPayerPublicKey } from "./utils/accounts.js";
import { baseUnitToDecimal, getTokenProgram } from "./utils/helpers.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, } from "@solana/spl-token";
import { SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import BN from "bn.js";
import { TOKENS, type MarketIndex } from "./config/tokens.js";
import { Keypair } from "@solana/web3.js";

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

    public getRepayValueForTargetHealth(
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
        // Where quartzHealthBuffer, and repayCollateralWeight are both between 0 and 1.
        // The following is an algebraicly simplified expression of the above formula, in terms of repayValue.
        // TODO: Note this does not take liability weight into account, so the formula is imprecise for some token pairs.

        if (targetHealth <= 0 || targetHealth >= 100) throw Error("Target health must be between 0 and 100");
        if (repayCollateralWeight <= 0 || repayCollateralWeight >= 100) throw Error("Repay collateral weight must be between 0 and 100");
        if (targetHealth <= this.getHealth()) throw Error("Target health must be greater than current health");

        const currentWeightedCollateral = this.getTotalWeightedCollateralValue();
        const loanValue = this.getMaintenanceMarginRequirement();
        const targetHealthDecimal = targetHealth / 100;
        const healthBufferDecimal = QUARTZ_HEALTH_BUFFER / 100;
        const repayCollateralWeightDecimal = repayCollateralWeight / 100;

        const repayValueUsdcBaseUnits = Math.round(
            (
                loanValue - currentWeightedCollateral * (healthBufferDecimal - 1) * (targetHealthDecimal - 1) // Any issues try swapping this to 1 - targetHealthDecimal
            ) / (
                1 - repayCollateralWeightDecimal * (healthBufferDecimal - 1) * (targetHealthDecimal - 1)
            )
        );

        const USDC_INDEX = 0;
        if (TOKENS[USDC_INDEX].name !== "USDC") throw Error("USDC not found");
        const repayValue = baseUnitToDecimal(repayValueUsdcBaseUnits, USDC_INDEX);

        return repayValue;
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
        const adjustForAutoRepayLimit = (this.getHealth() !== 100); // TODO: Calculations for adjusting could be made more precise
        return this.driftUser.getWithdrawalLimit(spotMarketIndex, false, adjustForAutoRepayLimit).toNumber();
    }
    
    public async getMultipleWithdrawalLimits(spotMarketIndices: MarketIndex[]): Promise<Record<MarketIndex, number>> {
        const limitsArray = await Promise.all(
            spotMarketIndices.map(async index => ({
                index,
                limit: await this.getWithdrawalLimit(index)
            }))
        );

        const limits = limitsArray.reduce((acc, { index, limit }) => 
            Object.assign(acc, { [index]: limit }
        ), {} as Record<MarketIndex, number>);

        return limits;
    }


    // --- Instructions ---

    public async getLookupTables(): Promise<AddressLookupTableAccount[]> {
        return [this.quartzLookupTable];
    }

    /**
     * Creates instructions to close a Quartz user account. This cannot be undone.
     * @returns {Promise<{
     *     ixs: TransactionInstruction[],
     *     lookupTables: AddressLookupTableAccount[],
     *     signers: Keypair[]
     * }>} Object containing:
     * - ixs: Array of instructions to close the Quartz user account.
     * - lookupTables: Array of lookup tables for building VersionedTransaction.
     * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
     * @throw Error if the RPC connection fails. The transaction will fail if the account has any balance or loans, or is less than 13 days old.
     */
    public async makeCloseAccountIxs(): Promise<{
        ixs: TransactionInstruction[],
        lookupTables: AddressLookupTableAccount[],
        signers: Keypair[]
    }> {
        const ix_closeVault = await this.program.methods
            .closeUser()
            .accounts({
                vault: this.vaultPubkey,
                owner: this.pubkey,
                initRentPayer: getInitRentPayerPublicKey(),
                driftUser: this.driftUser.pubkey,
                driftUserStats: this.driftUser.statsPubkey,
                driftState: getDriftStatePublicKey(),
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId
            })
            .instruction();

        return {
            ixs: [ix_closeVault],
            lookupTables: [this.quartzLookupTable],
            signers: []
        };
    }

    /**
     * Creates instructions to upgrade a Quartz user account.
     * @param spendLimitPerTransaction - The card spend limit per transaction.
     * @param spendLimitPerTimeframe - The card spend limit per timeframe.
     * @param timeframeInSlots - The timeframe in slots (eg: 216,000 for ~1 day).
     * @returns {Promise<{
     *     ixs: TransactionInstruction[],
     *     lookupTables: AddressLookupTableAccount[],
     *     signers: Keypair[]
     * }>} Object containing:
     * - ixs: Array of instructions to upgrade the Quartz user account.
     * - lookupTables: Array of lookup tables for building VersionedTransaction.
     * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
     * @throw Error if the RPC connection fails. The transaction will fail if the account does not require an upgrade.
     */
    public async makeUpgradeAccountIxs(
        spendLimitPerTransaction: BN,
        spendLimitPerTimeframe: BN,
        timeframeInSlots: BN
    ): Promise<{
        ixs: TransactionInstruction[],
        lookupTables: AddressLookupTableAccount[],
        signers: Keypair[]
    }> {
        const ix_upgradeAccount = await this.program.methods
            .upgradeVault(
                spendLimitPerTransaction,
                spendLimitPerTimeframe,
                timeframeInSlots
            )
            .accounts({
                vault: this.vaultPubkey,
                owner: this.pubkey,
                initRentPayer: getInitRentPayerPublicKey(),
                systemProgram: SystemProgram.programId
            })
            .instruction();

        return {
            ixs: [ix_upgradeAccount],
            lookupTables: [this.quartzLookupTable],
            signers: []
        };
    }

    /**
     * Creates instructions to deposit a token into the Quartz user account.
     * @param amountBaseUnits - The amount of tokens to deposit.
     * @param marketIndex - The market index of the token to deposit.
     * @param reduceOnly - True means amount will be capped so a negative balance (loan) cannot become a positive balance (collateral).
     * @returns {Promise<{
     *     ixs: TransactionInstruction[],
     *     lookupTables: AddressLookupTableAccount[],
     *     signers: Keypair[]
     * }>} Object containing:
     * - ixs: Array of instructions to deposit the token into the Quartz user account.
     * - lookupTables: Array of lookup tables for building VersionedTransaction.
     * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
     * @throw Error if the RPC connection fails. The transaction will fail if the owner does not have enough tokens.
     */
    public async makeDepositIx(
        amountBaseUnits: number,
        marketIndex: MarketIndex,
        reduceOnly: boolean
    ): Promise<{
        ixs: TransactionInstruction[],
        lookupTables: AddressLookupTableAccount[],
        signers: Keypair[]
    }> {
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

        return {
            ixs: [ix],
            lookupTables: [this.quartzLookupTable],
            signers: []
        };
    }

    /**
     * Creates instructions to withdraw a token from the Quartz user account.
     * @param amountBaseUnits - The amount of tokens to withdraw.
     * @param marketIndex - The market index of the token to withdraw.
     * @param reduceOnly - True means amount will be capped so a positive balance (collateral) cannot become a negative balance (loan).
     * @returns {Promise<{
     *     ixs: TransactionInstruction[],
     *     lookupTables: AddressLookupTableAccount[],
     *     signers: Keypair[]
     * }>} Object containing:
     * - ixs: Array of instructions to withdraw the token from the Quartz user account.
     * - lookupTables: Array of lookup tables for building VersionedTransaction.
     * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
     * @throw Error if the RPC connection fails. The transaction will fail if the account does not have enough tokens or, (when taking out a loan) the account health is not high enough for a loan.
     */
    public async makeWithdrawIx(
        amountBaseUnits: number,
        marketIndex: MarketIndex,
        reduceOnly: boolean
    ): Promise<{
        ixs: TransactionInstruction[],
        lookupTables: AddressLookupTableAccount[],
        signers: Keypair[]
    }> {
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

        return {
            ixs: [ix],
            lookupTables: [this.quartzLookupTable],
            signers: []
        };
    }

    /**
     * Creates instructions to repay a loan using collateral.
     * @param caller - The public key of the caller, this can be the owner or someone else if account health is 0%.
     * @param depositMarketIndex - The market index of the loan token to deposit.
     * @param withdrawMarketIndex - The market index of the collateral token to withdraw.
     * @param swapInstruction - The swap instruction to use. Deposit and withdrawn amounts are calculated by the balance change after this instruction.
     * @returns {Promise<{
     *     ixs: TransactionInstruction[],
     *     lookupTables: AddressLookupTableAccount[],
     *     signers: Keypair[]
     * }>} Object containing:
     * - ixs: Array of instructions to repay the loan using collateral.
     * - lookupTables: Array of lookup tables for building VersionedTransaction.
     * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
     * @throw Error if the RPC connection fails. The transaction will fail if:
     * - the caller does not have enough tokens.
     * - the account health is above 0% and the caller is not the owner.
     * - the account health is 0% and the caller is not the owner, but the health has not increased above 0% after the repay.
     */
    public async makeCollateralRepayIxs(
        caller: PublicKey,
        depositMarketIndex: MarketIndex,
        withdrawMarketIndex: MarketIndex,
        swapInstruction: TransactionInstruction
    ): Promise<{
        ixs: TransactionInstruction[],
        lookupTables: AddressLookupTableAccount[],
        signers: Keypair[]
    }> {
        const depositMint = TOKENS[depositMarketIndex].mint;
        const withdrawMint = TOKENS[withdrawMarketIndex].mint;

        const [
            depositTokenProgram,
            withdrawTokenProgram
        ] = await Promise.all([
            getTokenProgram(this.connection, depositMint),
            getTokenProgram(this.connection, withdrawMint)
        ]);
        
        const [
            callerDepositSpl,
            callerWithdrawSpl
        ] = await Promise.all([
            getAssociatedTokenAddress(depositMint, caller, false, depositTokenProgram),
            getAssociatedTokenAddress(withdrawMint, caller, false, withdrawTokenProgram)
        ]);

        const driftState = getDriftStatePublicKey();
        const collateralRepayLedger = getCollateralRepayLedgerPublicKey(this.pubkey);

        const startCollateralRepayPromise = this.program.methods
            .startCollateralRepay()
            .accounts({
                caller: caller,
                callerDepositSpl: callerDepositSpl,
                callerWithdrawSpl: callerWithdrawSpl,
                owner: this.pubkey,
                vault: this.vaultPubkey,
                mintDeposit: depositMint,
                mintWithdraw: withdrawMint,
                tokenProgramDeposit: depositTokenProgram,
                tokenProgramWithdraw: withdrawTokenProgram,
                systemProgram: SystemProgram.programId,
                instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
                ledger: collateralRepayLedger
            })
            .instruction();

        const depositCollateralRepayPromise = this.program.methods
            .depositCollateralRepay(depositMarketIndex)
            .accounts({
                caller: caller,
                callerSpl: callerDepositSpl,
                owner: this.pubkey,
                vault: this.vaultPubkey,
                vaultSpl: getVaultSplPublicKey(this.pubkey, depositMint),
                splMint: depositMint,
                driftUser: this.driftUser.pubkey,
                driftUserStats: this.driftUser.statsPubkey,
                driftState: driftState,
                spotMarketVault: getDriftSpotMarketVaultPublicKey(depositMarketIndex),
                tokenProgram: depositTokenProgram,
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
                ledger: collateralRepayLedger
            })
            .remainingAccounts(
                this.driftUser.getRemainingAccounts(depositMarketIndex)
            )
            .instruction();

        const withdrawCollateralRepayPromise = this.program.methods
            .withdrawCollateralRepay(withdrawMarketIndex)
            .accounts({
                caller: caller,
                callerSpl: callerWithdrawSpl,
                owner: this.pubkey,
                vault: this.vaultPubkey,
                vaultSpl: getVaultSplPublicKey(this.pubkey, withdrawMint),
                splMint: withdrawMint,
                driftUser: this.driftUser.pubkey,
                driftUserStats: this.driftUser.statsPubkey,
                driftState: driftState,
                spotMarketVault: getDriftSpotMarketVaultPublicKey(withdrawMarketIndex),
                driftSigner: this.driftSigner,
                tokenProgram: withdrawTokenProgram,
                driftProgram: DRIFT_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                depositPriceUpdate: getPythOracle(depositMarketIndex),
                withdrawPriceUpdate: getPythOracle(withdrawMarketIndex),
                instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
                ledger: collateralRepayLedger
            })
            .remainingAccounts(
                this.driftUser.getRemainingAccounts(withdrawMarketIndex)
            )
            .instruction();

        const [
            ix_startCollateralRepay,
            ix_depositCollateralRepay,
            ix_withdrawCollateralRepay
        ] = await Promise.all([
            startCollateralRepayPromise,
            depositCollateralRepayPromise,
            withdrawCollateralRepayPromise
        ]);

        return {
            ixs: [
                ix_startCollateralRepay,
                swapInstruction,
                ix_depositCollateralRepay,
                ix_withdrawCollateralRepay
            ],
            lookupTables: [this.quartzLookupTable],
            signers: []
        };
    }

    /**
     * Creates instructions to top up the card.
     * @param amountUsdcBaseUnits - The amount of USDC base tokens to top up the card with.
     * @returns {Promise<{
     *     ixs: TransactionInstruction[],
     *     lookupTables: AddressLookupTableAccount[],
     *     signerKeypair: Keypair
     * }>} Object containing:
     * - ixs: Array of instructions to top up the card.
     * - lookupTables: Array of lookup tables for building VersionedTransaction.
     * - signerKeypair: Keypair that must sign the transaction the instructions are added to.
     * @throw Error if the RPC connection fails. The transaction will fail if the owner does not have enough tokens or, (when taking out a loan) the account health is not high enough for a loan.
     */
    public async makeTopUpCardIxs(
        amountUsdcBaseUnits: number
    ): Promise<{
        ixs: TransactionInstruction[],
        lookupTables: AddressLookupTableAccount[],
        signerKeypair: Keypair
    }> {
        const messageSentEventData = Keypair.generate();
        const ownerUsdc = await getAssociatedTokenAddress(TOKENS[MARKET_INDEX_USDC].mint, this.pubkey);

        const ix_topUpCard = await this.program.methods
            .topUpCard(new BN(amountUsdcBaseUnits))
            .accounts({
                vault: this.vaultPubkey,
                ownerUsdc: ownerUsdc,
                owner: this.pubkey,
                usdcMint: TOKENS[MARKET_INDEX_USDC].mint,
                bridgeRentPayer: getBridgeRentPayerPublicKey(),
                senderAuthorityPda: getSenderAuthority(),
                messageTransmitter: getMessageTransmitter(),
                tokenMessenger: getTokenMessenger(),
                remoteTokenMessenger: getRemoteTokenMessenger(),
                tokenMinter: getTokenMinter(),
                localToken: getLocalToken(),
                messageSentEventData: messageSentEventData.publicKey,
                eventAuthority: getEventAuthority(),
                messageTransmitterProgram: MESSAGE_TRANSMITTER_PROGRAM_ID,
                tokenMessengerMinterProgram: TOKEN_MESSAGE_MINTER_PROGRAM_ID,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId
            })
            .remainingAccounts(
                this.driftUser.getRemainingAccounts(MARKET_INDEX_USDC)
            )
            .instruction();

        return {
            ixs: [ix_topUpCard],
            lookupTables: [this.quartzLookupTable],
            signerKeypair: messageSentEventData
        }
    }
}
