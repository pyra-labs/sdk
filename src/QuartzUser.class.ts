import type { DriftClient, UserAccount } from "@drift-labs/sdk";
import type {
	AddressLookupTableAccount,
	TransactionInstruction,
} from "@solana/web3.js";
import {
	DEPOSIT_ADDRESS_DATA_SIZE,
	MARKET_INDEX_SOL,
	MARKET_INDEX_USDC,
	QUARTZ_PROGRAM_ID,
	SPEND_FEE_DESTINATION,
	SPEND_SETTLEMENT_ACCOUNT,
	ZERO,
} from "./config/constants.js";
import type { Pyra } from "./types/idl/pyra.js";
import type { Program } from "@coral-xyz/anchor";
import type { PublicKey } from "@solana/web3.js";
import {
	getDriftSpotMarketVaultPublicKey,
	getDriftStatePublicKey,
	getPythOracle,
	getDriftSignerPublicKey,
	getVaultPublicKey,
	getDepositAddressPublicKey,
	getDepositAddressAtaPublicKey,
} from "./utils/accounts.js";
import {
	calculateWithdrawOrderBalances,
	getTokenAccountBalance,
	getTokenProgram,
} from "./utils/helpers.js";
import {
	getAssociatedTokenAddressSync,
	TOKEN_2022_PROGRAM_ID,
	TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import BN from "bn.js";
import {
	getMarketIndicesRecord,
	MarketIndex,
	TOKENS,
} from "./config/tokens.js";
import { Keypair } from "@solana/web3.js";
import type { QuartzClient } from "./QuartzClient.class.js";
import type { WithdrawOrder } from "./index.browser.js";
import { DriftUser } from "./types/classes/DriftUser.class.js";
import type { Connection } from "@solana/web3.js";
import type { Signer } from "@solana/web3.js";

export class QuartzUser {
	public readonly pubkey: PublicKey;
	public readonly vaultPubkey: PublicKey;
	public readonly depositAddress: PublicKey;

	public readonly spendLimitPerTransaction: BN;
	public readonly spendLimitPerTimeframe: BN;
	public readonly remainingSpendLimitPerTimeframe: BN;
	public readonly nextTimeframeResetTimestamp: BN;
	public readonly timeframeInSeconds: BN;

	private connection: Connection;
	private program: Program<Pyra>;
	private quartzLookupTable: AddressLookupTableAccount;
	private client: QuartzClient;

	private driftUser: DriftUser;
	private driftSigner: PublicKey;

	constructor(
		pubkey: PublicKey,
		connection: Connection,
		client: QuartzClient,
		program: Program<Pyra>,
		quartzLookupTable: AddressLookupTableAccount,
		driftClient: DriftClient,
		driftUserAccount: UserAccount,
		spendLimitPerTransaction: BN,
		spendLimitPerTimeframe: BN,
		remainingSpendLimitPerTimeframe: BN,
		nextTimeframeResetTimeframe: BN,
		timeframeInSeconds: BN,
	) {
		this.pubkey = pubkey;
		this.connection = connection;
		this.client = client;
		this.program = program;
		this.quartzLookupTable = quartzLookupTable;

		this.vaultPubkey = getVaultPublicKey(pubkey);
		this.depositAddress = getDepositAddressPublicKey(pubkey);
		this.driftSigner = getDriftSignerPublicKey();

		this.spendLimitPerTransaction = spendLimitPerTransaction;
		this.spendLimitPerTimeframe = spendLimitPerTimeframe;
		this.remainingSpendLimitPerTimeframe = remainingSpendLimitPerTimeframe;
		this.nextTimeframeResetTimestamp = nextTimeframeResetTimeframe;
		this.timeframeInSeconds = timeframeInSeconds;

		this.driftUser = new DriftUser(
			this.vaultPubkey,
			driftClient,
			driftUserAccount,
		);
	}

	public getHealth(): number {
		return this.driftUser.getHealth();
	}

	public async getRepayUsdcValueForTargetHealth(
		targetHealth: number,
		repayAssetWeight: number,
		repayLiabilityWeight: number,
	): Promise<number> {
		// New Quartz health after repayment is given as:
		//
		//                         marginRequirement - (repayValue * repayLiabilityWeight)
		//   targetHealth =  1 - -----------------------------------------------------------
		//                       currentWeightedCollateral - (repayValue * repayAssetWeight)
		//
		// Where repayAssetWeight and repayLiabilityWeight are between 0 and 1.
		// The following is an algebraicly simplified expression of the above formula, in terms of repayValue.

		if (targetHealth < 0 || targetHealth > 100)
			throw Error("Target health must be between 0 and 100 inclusive");
		if (!Number.isInteger(targetHealth))
			throw new Error("Target health must be a whole number");

		if (repayAssetWeight < 0 || repayAssetWeight > 100)
			throw Error(
				"Repay collateral weight must be between 0 and 100 inclusive",
			);
		if (!Number.isInteger(repayAssetWeight))
			throw new Error("Repay collateral weight must be a whole number");

		if (repayLiabilityWeight < 100)
			throw Error("Repay liability weight must be greater or equal to 100");
		if (!Number.isInteger(repayLiabilityWeight))
			throw new Error("Repay liability weight must be a whole number");

		if (targetHealth <= this.getHealth())
			throw Error("Target health must be greater than current health");

		const openOrders: WithdrawOrder[] = []; // Ignore orders for liquidation
		const currentWeightedCollateral =
			await this.getTotalWeightedCollateralValue(openOrders);
		const marginRequirement = await this.getMarginRequirement(openOrders);
		const targetHealthDecimal = targetHealth / 100;
		const repayAssetWeightDecimal = repayAssetWeight / 100;
		const repayLiabilityWeightDecimal = repayLiabilityWeight / 100;

		const repayValueUsdcBaseUnits = Math.round(
			(currentWeightedCollateral * (targetHealthDecimal - 1) +
				marginRequirement) /
				(repayAssetWeightDecimal * (targetHealthDecimal - 1) +
					repayLiabilityWeightDecimal),
		);

		return repayValueUsdcBaseUnits;
	}

	public async getTotalCollateralValue(
		openWithdrawOrders?: WithdrawOrder[],
	): Promise<number> {
		openWithdrawOrders =
			await this.validateOpenWithdrawOrders(openWithdrawOrders);
		const openOrderBalances =
			calculateWithdrawOrderBalances(openWithdrawOrders);

		return this.driftUser
			.getTotalCollateralValue(undefined, false, true, openOrderBalances)
			.toNumber();
	}

	public async getTotalSpotLiabilityValue(
		openWithdrawOrders?: WithdrawOrder[],
	): Promise<number> {
		openWithdrawOrders =
			await this.validateOpenWithdrawOrders(openWithdrawOrders);
		const openOrderBalances =
			calculateWithdrawOrderBalances(openWithdrawOrders);

		return this.driftUser
			.getTotalSpotLiabilityValue(undefined, false, true, openOrderBalances)
			.toNumber();
	}

	public async getTotalWeightedCollateralValue(
		openWithdrawOrders?: WithdrawOrder[],
	): Promise<number> {
		openWithdrawOrders =
			await this.validateOpenWithdrawOrders(openWithdrawOrders);
		const openOrderBalances =
			calculateWithdrawOrderBalances(openWithdrawOrders);

		return this.driftUser
			.getTotalCollateralValue("Initial", false, true, openOrderBalances)
			.toNumber();
	}

	public async getMarginRequirement(
		openWithdrawOrders?: WithdrawOrder[],
	): Promise<number> {
		openWithdrawOrders =
			await this.validateOpenWithdrawOrders(openWithdrawOrders);
		const openOrderBalances =
			calculateWithdrawOrderBalances(openWithdrawOrders);

		return this.driftUser
			.getInitialMarginRequirement(openOrderBalances)
			.toNumber();
	}

	public async getAvailableCreditUsdcBaseUnits(
		openWithdrawOrders?: WithdrawOrder[],
	): Promise<BN> {
		return await this.getWithdrawalLimit(
			MARKET_INDEX_USDC,
			false,
			openWithdrawOrders,
		);
	}

	private async validateOpenWithdrawOrders(
		openWithdrawOrders?: WithdrawOrder[],
	): Promise<WithdrawOrder[]> {
		if (openWithdrawOrders === undefined) {
			const accounts = await this.client.getOpenWithdrawOrders(this.pubkey);
			return accounts.map((account) => account.account);
		}

		return openWithdrawOrders.filter((order) =>
			order.timeLock.owner.equals(this.pubkey),
		);
	}

	public async getDepositAddressBalance(marketIndex: MarketIndex): Promise<BN> {
		const depositAddressAta = await getDepositAddressAtaPublicKey(
			this.connection,
			this.pubkey,
			marketIndex,
		);
		const depositAddressAtaBalance = await getTokenAccountBalance(
			this.connection,
			depositAddressAta,
		);

		if (marketIndex === MARKET_INDEX_SOL) {
			const rent = await this.connection.getMinimumBalanceForRentExemption(
				DEPOSIT_ADDRESS_DATA_SIZE,
			);
			const balance = await this.connection.getBalance(this.depositAddress);
			const availableBalance = balance - rent;
			return new BN(Math.max(availableBalance, 0) + depositAddressAtaBalance);
		}

		return new BN(depositAddressAtaBalance);
	}

	public async getAllDepositAddressBalances(): Promise<
		Record<MarketIndex, BN>
	> {
		const depositBalances: Record<MarketIndex, BN> =
			getMarketIndicesRecord(ZERO);

		depositBalances[MARKET_INDEX_SOL] =
			await this.getDepositAddressBalance(MARKET_INDEX_SOL);
		const splIndices = MarketIndex.filter(
			(index) => index !== MARKET_INDEX_SOL,
		);

		const [standardTokenAccounts, token2022Accounts] = await Promise.all([
			this.connection.getParsedTokenAccountsByOwner(this.depositAddress, {
				programId: TOKEN_PROGRAM_ID,
			}),
			this.connection.getParsedTokenAccountsByOwner(this.depositAddress, {
				programId: TOKEN_2022_PROGRAM_ID,
			}),
		]);

		const mintToMarketIndex: Record<string, MarketIndex> = {};
		for (const index of splIndices) {
			mintToMarketIndex[TOKENS[index].mint.toBase58()] = index;
		}

		const allTokenAccounts = [
			...standardTokenAccounts.value,
			...token2022Accounts.value,
		];
		for (const account of allTokenAccounts) {
			const parsedInfo = account.account.data.parsed.info;
			const mintAddress = parsedInfo.mint;
			const amount = parsedInfo.tokenAmount.amount;

			const marketIndex = mintToMarketIndex[mintAddress];
			if (marketIndex !== undefined) {
				depositBalances[marketIndex] = new BN(amount);
			}
		}

		return depositBalances;
	}

	public async getTokenBalance(
		marketIndex: MarketIndex,
		openWithdrawOrders?: WithdrawOrder[],
	): Promise<BN> {
		openWithdrawOrders =
			await this.validateOpenWithdrawOrders(openWithdrawOrders);
		const openOrderBalances =
			calculateWithdrawOrderBalances(openWithdrawOrders);
		const driftDeposit = this.driftUser.getTokenAmount(
			marketIndex,
			openOrderBalances,
		);

		const depositAddressBalance =
			await this.getDepositAddressBalance(marketIndex);
		return driftDeposit.add(depositAddressBalance);
	}

	public async getMultipleTokenBalances(
		marketIndices: MarketIndex[],
		openWithdrawOrders?: WithdrawOrder[],
	): Promise<Record<MarketIndex, BN>> {
		openWithdrawOrders =
			await this.validateOpenWithdrawOrders(openWithdrawOrders);
		const openOrderBalances =
			calculateWithdrawOrderBalances(openWithdrawOrders);

		const driftBalances = marketIndices.reduce(
			(acc, index) => {
				acc[index] = this.driftUser.getTokenAmount(index, openOrderBalances);
				return acc;
			},
			{} as Record<MarketIndex, BN>,
		);

		const depositBalances = await this.getAllDepositAddressBalances();

		return marketIndices.reduce(
			(acc, index) => {
				const driftDeposit = driftBalances[index] || ZERO;
				const addressDeposit = depositBalances[index] || ZERO;
				acc[index] = driftDeposit.add(addressDeposit);
				return acc;
			},
			{} as Record<MarketIndex, BN>,
		);
	}

	public async getWithdrawalLimit(
		marketIndex: MarketIndex,
		reduceOnly = false,
		openWithdrawOrders?: WithdrawOrder[],
	): Promise<BN> {
		openWithdrawOrders =
			await this.validateOpenWithdrawOrders(openWithdrawOrders);
		const openOrderBalances =
			calculateWithdrawOrderBalances(openWithdrawOrders);

		const driftLimit = this.driftUser.getWithdrawalLimit(
			marketIndex,
			reduceOnly,
			openOrderBalances,
		);

		const depositAddressBalance =
			await this.getDepositAddressBalance(marketIndex);
		return driftLimit.add(depositAddressBalance);
	}

	public async getMultipleWithdrawalLimits(
		marketIndices: MarketIndex[],
		reduceOnly = false,
		openWithdrawOrders?: WithdrawOrder[],
	): Promise<Record<MarketIndex, BN>> {
		openWithdrawOrders =
			await this.validateOpenWithdrawOrders(openWithdrawOrders);
		const openOrderBalances =
			calculateWithdrawOrderBalances(openWithdrawOrders);

		const driftLimits = marketIndices.reduce(
			(acc, index) => {
				acc[index] = this.driftUser.getWithdrawalLimit(
					index,
					reduceOnly,
					openOrderBalances,
				);
				return acc;
			},
			{} as Record<MarketIndex, BN>,
		);

		const depositAddressBalances = await this.getAllDepositAddressBalances();

		return marketIndices.reduce(
			(acc, index) => {
				const driftLimit = driftLimits[index] || ZERO;
				const addressBalance = depositAddressBalances[index] || ZERO;
				acc[index] = driftLimit.add(addressBalance);
				return acc;
			},
			{} as Record<MarketIndex, BN>,
		);
	}

	// --- Instructions ---

	public getLookupTables(): AddressLookupTableAccount[] {
		return [this.quartzLookupTable];
	}

	/**
	 * Creates instructions to send tokens from the legacy deposit address to the owner.
	 * @param mint - The mint of the token to withdraw.
	 * @returns {Promise<{
	 *     ixs: TransactionInstruction[],
	 *     lookupTables: AddressLookupTableAccount[],
	 *     signers: Keypair[]
	 * }>} Object containing:
	 * - ixs: Array of instructions to clear the legacy deposit address.
	 * - lookupTables: Array of lookup tables for building VersionedTransaction.
	 * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
	 * @throw Error if the RPC connection fails, if the mint's ATA does not exist, or has 0 balance.
	 */
	public async makeClearLegacyDepositAddressIxs(mint: PublicKey): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const tokenProgram = await getTokenProgram(this.connection, mint);

		let ownerSpl: PublicKey | null = null;
		if (mint !== TOKENS[MARKET_INDEX_SOL].mint) {
			ownerSpl = getAssociatedTokenAddressSync(
				mint,
				this.pubkey,
				true,
				tokenProgram,
			);
		}

		let depositAddressSpl: PublicKey | null = null;
		if (mint !== TOKENS[MARKET_INDEX_SOL].mint) {
			depositAddressSpl = getAssociatedTokenAddressSync(
				mint,
				this.depositAddress,
				true,
				tokenProgram,
			);
		}

		const ix = await this.program.methods
			.clearLegacyDepositAddress()
			.accountsPartial({
				owner: this.pubkey,
				ownerSpl: ownerSpl,
				depositAddressSpl: depositAddressSpl,
				mint: mint !== TOKENS[MARKET_INDEX_SOL].mint ? mint : null,
				tokenProgram: tokenProgram,
			})
			.instruction();

		return {
			ixs: [ix],
			lookupTables: this.getLookupTables(),
			signers: [],
		};
	}

	/**
	 * Creates instructions to iniate and order to adjust the spend limits of a Quartz user account.
	 * @param spendLimitPerTransaction - The new spend limit per transaction.
	 * @param spendLimitPerTimeframe - The new spend limit per timeframe.
	 * @param timeframeInSeconds - The new timeframe in seconds.
	 * @param nextTimeframeResetTimestamp - The new next timeframe reset timestamp.
	 * @returns {Promise<{
	 *     ixs: TransactionInstruction[],
	 *     lookupTables: AddressLookupTableAccount[],
	 *     signers: Keypair[]
	 * }>} Object containing:
	 * - ixs: Array of instructions to adjust the spend limits.
	 * - lookupTables: Array of lookup tables for building VersionedTransaction.
	 * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
	 * @throw Error if the RPC connection fails. Or if the spend limits are invalid.
	 */
	public async makeInitiateUpdateSpendLimitsIxs(
		payer: PublicKey,
		spendLimitPerTransaction: BN,
		spendLimitPerTimeframe: BN,
		nextTimeframeResetTimestamp: BN,
		timeframeInSeconds: BN,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const orderAccount = Keypair.generate();

		const ix = await this.program.methods
			.initiateUpdateSpendLimits(
				spendLimitPerTransaction,
				spendLimitPerTimeframe,
				nextTimeframeResetTimestamp,
				timeframeInSeconds,
			)
			.accounts({
				owner: this.pubkey,
				spendLimitsOrder: orderAccount.publicKey,
				payer: payer,
			})
			.instruction();

		return {
			ixs: [ix],
			lookupTables: this.getLookupTables(),
			signers: [orderAccount],
		};
	}

	/**
	 * Creates instructions to update the card spend limits of a Quartz user account. Time lock can be skipped if admin is a signer.
	 * @param orderAccount - The public key of the spend limits order, which must be created with the initiateSpendLimits instruction.
	 * @returns {Promise<{
	 *     ixs: TransactionInstruction[],
	 *     lookupTables: AddressLookupTableAccount[],
	 *     signers: Keypair[]
	 * }>} Object containing:
	 * - ixs: Array of instructions to fulfil the spend limits order.
	 * - lookupTables: Array of lookup tables for building VersionedTransaction.
	 * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
	 * @throw Error if the RPC connection fails.
	 */
	public async makeFulfilUpdateSpendLimitsIxs(
		orderAccount: PublicKey,
		admin?: PublicKey,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const order =
			await this.program.account.spendLimitsOrder.fetch(orderAccount);

		const ix_fulfilUpdateSpendLimits = await this.program.methods
			.fulfilUpdateSpendLimits()
			.accounts({
				spendLimitsOrder: orderAccount,
				vault: this.vaultPubkey,
				orderPayer: order.timeLock.payer,
				admin: admin ?? QUARTZ_PROGRAM_ID,
			})
			.instruction();

		return {
			ixs: [ix_fulfilUpdateSpendLimits],
			lookupTables: this.getLookupTables(),
			signers: [],
		};
	}

	public async makeUpdateSpendLimitsWithAdminIxs(
		payer: PublicKey,
		admin: PublicKey,
		spendLimitPerTransaction: BN,
		spendLimitPerTimeframe: BN,
		nextTimeframeResetTimestamp: BN,
		timeframeInSeconds: BN,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const orderAccount = Keypair.generate();

		const ix_initiateUpdate = await this.program.methods
			.initiateUpdateSpendLimits(
				spendLimitPerTransaction,
				spendLimitPerTimeframe,
				nextTimeframeResetTimestamp,
				timeframeInSeconds,
			)
			.accounts({
				owner: this.pubkey,
				spendLimitsOrder: orderAccount.publicKey,
				payer: payer,
			})
			.instruction();

		const ix_fulfilUpdate = await this.program.methods
			.fulfilUpdateSpendLimits()
			.accounts({
				spendLimitsOrder: orderAccount.publicKey,
				vault: this.vaultPubkey,
				orderPayer: payer,
				admin: admin,
			})
			.instruction();

		return {
			ixs: [ix_initiateUpdate, ix_fulfilUpdate],
			lookupTables: this.getLookupTables(),
			signers: [orderAccount],
		};
	}

	/**
	 * Creates instructions to update the card spend limits order of a Quartz user account.
	 * @param orderAccount - The public key of the spend limits order, which must be created with the initiateSpendLimits instruction.
	 * @returns {Promise<{
	 *     ixs: TransactionInstruction[],
	 *     lookupTables: AddressLookupTableAccount[],
	 *     signers: Keypair[]
	 * }>} Object containing:
	 * - ixs: Array of instructions to cancel the spend limits order.
	 * - lookupTables: Array of lookup tables for building VersionedTransaction.
	 * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
	 * @throw Error if the RPC connection fails.
	 */
	public async makeCancelUpdateSpendLimitsIxs(
		orderAccount: PublicKey,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const order =
			await this.program.account.spendLimitsOrder.fetch(orderAccount);

		const ix_cancelUpdateSpendLimits = await this.program.methods
			.cancelUpdateSpendLimits()
			.accounts({
				spendLimitsOrder: orderAccount,
				owner: this.pubkey,
				orderPayer: order.timeLock.payer,
			})
			.instruction();

		return {
			ixs: [ix_cancelUpdateSpendLimits],
			lookupTables: this.getLookupTables(),
			signers: [],
		};
	}

	/**
	 * Creates instructions to deposit tokens from the legacy deposit address into Drift.
	 * @param marketIndex - The market index of the token to deposit.
	 * @param payer - The public key of the payer.
	 * @returns {Promise<{
	 *     ixs: TransactionInstruction[],
	 *     lookupTables: AddressLookupTableAccount[],
	 *     signers: Keypair[]
	 * }>} Object containing:
	 * - ixs: Array of instructions to initiate a withdraw order.
	 * - lookupTables: Array of lookup tables for building VersionedTransaction.
	 * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
	 * @throw Error if the RPC connection fails, if the mint's ATA does not exist, or has 0 balance.
	 */
	public async makeDepositIxs(
		marketIndex: MarketIndex,
		payer: PublicKey,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const mint = TOKENS[marketIndex].mint;
		const tokenProgram = await getTokenProgram(this.connection, mint);
		const depositAddress = getDepositAddressPublicKey(this.pubkey);

		let depositAddressSpl: PublicKey | null = null;
		if (marketIndex !== MARKET_INDEX_SOL) {
			depositAddressSpl = getAssociatedTokenAddressSync(
				mint,
				depositAddress,
				true,
				tokenProgram,
			);
		}

		const ix = await this.program.methods
			.depositDrift(marketIndex)
			.accountsPartial({
				vault: this.vaultPubkey,
				mint: mint,
				payer: payer,
				driftUser: this.driftUser.pubkey,
				driftUserStats: this.driftUser.statsPubkey,
				driftState: getDriftStatePublicKey(),
				driftSpotMarketVault: getDriftSpotMarketVaultPublicKey(marketIndex),
				tokenProgram: tokenProgram,
				depositAddressSpl: depositAddressSpl,
			})
			.remainingAccounts(this.driftUser.getRemainingAccounts([marketIndex]))
			.instruction();

		return {
			ixs: [ix],
			lookupTables: this.getLookupTables(),
			signers: [],
		};
	}

	/**
	 * Creates instructions to iniaite a withdraw order from the Quartz user account, which will be fulfilled after the time lock.
	 * @param amountBaseUnits - The amount of tokens to withdraw.
	 * @param marketIndex - The market index of the token to withdraw.
	 * @param reduceOnly - True means amount will be capped so a positive balance (collateral) cannot become a negative balance (loan).
	 * @returns {Promise<{
	 *     ixs: TransactionInstruction[],
	 *     lookupTables: AddressLookupTableAccount[],
	 *     signers: Keypair[]
	 * }>} Object containing:
	 * - ixs: Array of instructions to initiate a withdraw order.
	 * - lookupTables: Array of lookup tables for building VersionedTransaction.
	 * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
	 * @throw Error if the RPC connection fails.
	 */
	public async makeInitiateWithdrawIxs(
		amountBaseUnits: number,
		marketIndex: MarketIndex,
		reduceOnly: boolean,
		payer: PublicKey,
		destinationAddress = this.pubkey,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const orderAccount = Keypair.generate();

		const ix_initiateWithdrawDrift = await this.program.methods
			.initiateWithdrawDrift(new BN(amountBaseUnits), marketIndex, reduceOnly)
			.accounts({
				owner: this.pubkey,
				withdrawOrder: orderAccount.publicKey,
				payer: payer,
				destination: destinationAddress,
			})
			.instruction();

		return {
			ixs: [ix_initiateWithdrawDrift],
			lookupTables: this.getLookupTables(),
			signers: [orderAccount],
		};
	}

	/**
	 * Creates instructions to fulfil a withdraw order from the Quartz user account. Can be skipped if admin is a signer.
	 * @param orderAccount - The public key of the withdraw order, which must be created with the initiateWithdraw instruction.
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
	public async makeFulfilWithdrawIxs(
		orderAccount: PublicKey,
		payer: PublicKey,
		admin?: PublicKey,
		amountBaseUnits?: BN,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const order = await this.program.account.withdrawOrder.fetch(orderAccount);

		const marketIndex = order.driftMarketIndex as MarketIndex;

		const mint = TOKENS[marketIndex].mint;
		const tokenProgram = await getTokenProgram(this.connection, mint);

		let destinationSpl: PublicKey | null = null;
		if (marketIndex !== MARKET_INDEX_SOL) {
			destinationSpl = getAssociatedTokenAddressSync(
				mint,
				order.destination,
				true,
				tokenProgram,
			);
		}

		const ix_fulfilWithdrawDrift = await this.program.methods
			.fulfilWithdrawDrift(amountBaseUnits ?? order.amountBaseUnits)
			.accountsPartial({
				withdrawOrder: orderAccount,
				vault: this.vaultPubkey,
				orderPayer: order.timeLock.payer,
				admin: admin ?? QUARTZ_PROGRAM_ID,
				payer: payer,
				destination: order.destination,
				destinationSpl: destinationSpl,
				mint: mint,
				driftUser: this.driftUser.pubkey,
				driftUserStats: this.driftUser.statsPubkey,
				driftState: getDriftStatePublicKey(),
				driftSpotMarketVault: getDriftSpotMarketVaultPublicKey(marketIndex),
				driftSigner: this.driftSigner,
				tokenProgram: tokenProgram,
			})
			.remainingAccounts(this.driftUser.getRemainingAccounts([marketIndex]))
			.instruction();

		return {
			ixs: [ix_fulfilWithdrawDrift],
			lookupTables: this.getLookupTables(),
			signers: [],
		};
	}

	public async makeFeePaymentIxs(
		admin: PublicKey,
		amountBaseUnits: number,
		marketIndex: MarketIndex,
		reduceOnly: boolean,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Signer[];
	}> {
		const orderAccount = Keypair.generate();
		const mint = TOKENS[marketIndex].mint;
		const tokenProgram = await getTokenProgram(this.connection, mint);

		const ix_initiateWithdrawDrift = await this.program.methods
			.initiateWithdrawDrift(new BN(amountBaseUnits), marketIndex, reduceOnly)
			.accounts({
				owner: this.pubkey,
				withdrawOrder: orderAccount.publicKey,
				payer: admin,
				destination: admin,
			})
			.instruction();

		const ix_fulfilWithdrawDrift = await this.program.methods
			.fulfilWithdrawDrift(new BN(amountBaseUnits))
			.accounts({
				withdrawOrder: orderAccount.publicKey,
				vault: this.vaultPubkey,
				orderPayer: admin,
				admin: admin,
				payer: admin,
				destination: admin,
				mint: mint,
				driftUser: this.driftUser.pubkey,
				driftUserStats: this.driftUser.statsPubkey,
				driftState: getDriftStatePublicKey(),
				driftSpotMarketVault: getDriftSpotMarketVaultPublicKey(marketIndex),
				driftSigner: this.driftSigner,
				tokenProgram: tokenProgram,
			})
			.remainingAccounts(this.driftUser.getRemainingAccounts([marketIndex]))
			.instruction();

		return {
			ixs: [ix_initiateWithdrawDrift, ix_fulfilWithdrawDrift],
			lookupTables: this.getLookupTables(),
			signers: [orderAccount],
		};
	}

	/**
	 * Creates instructions to withdraw a token from the Quartz user account.
	 * @param orderAccount - The public key of the withdraw order, which must be created with the initiateWithdraw instruction.
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
	public async makeCancelWithdrawIxs(orderAccount: PublicKey): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const order = await this.program.account.withdrawOrder.fetch(orderAccount);

		const ix_fulfilWithdraw = await this.program.methods
			.cancelWithdrawDrift()
			.accounts({
				withdrawOrder: orderAccount,
				owner: this.pubkey,
				orderPayer: order.timeLock.payer,
			})
			.instruction();

		return {
			ixs: [ix_fulfilWithdraw],
			lookupTables: this.getLookupTables(),
			signers: [],
		};
	}

	/**
	 * Creates instructions to spend using the Quartz card.
	 * @param amountSpendBaseUnits - The amount of tokens to spend.
	 * @param amountFeeBaseUnits - The amount of tokens to send to the spend fee address.
	 * @param marketIndex - The market index of the token to spend.
	 * @param admin - The public key of the admin.
	 * @returns {Promise<{
	 *     ixs: TransactionInstruction[],
	 *     lookupTables: AddressLookupTableAccount[],
	 *     signers: Keypair[]
	 * }>} Object containing:
	 * - ixs: Array of instructions to repay the loan using collateral.
	 * - lookupTables: Array of lookup tables for building VersionedTransaction.
	 * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
	 * @throw Error if the RPC connection fails. The transaction will fail if:
	 * - the user does not have enough available tokens.
	 * - the user's spend limit is exceeded.
	 */
	public async makeSpendIxs(
		amountSpendBaseUnits: number,
		amountSpendSettleBaseUnits: number,
		amountFeeBaseUnits: number,
		marketIndex: MarketIndex,
		admin: PublicKey,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const mint = TOKENS[marketIndex].mint;
		const tokenProgram = await getTokenProgram(this.connection, mint);

		const ix_spendDrift = await this.program.methods
			.spendDrift(
				marketIndex,
				new BN(amountSpendBaseUnits),
				new BN(amountFeeBaseUnits),
			)
			.accounts({
				vault: this.vaultPubkey,
				admin: admin,
				spendFeeDestination: SPEND_FEE_DESTINATION,
				mint: mint,
				driftUser: this.driftUser.pubkey,
				driftUserStats: this.driftUser.statsPubkey,
				driftState: getDriftStatePublicKey(),
				driftSpotMarketVault: getDriftSpotMarketVaultPublicKey(marketIndex),
				driftSigner: this.driftSigner,
				tokenProgram: tokenProgram,
			})
			.remainingAccounts(this.driftUser.getRemainingAccounts([marketIndex]))
			.instruction();

		const instructions: TransactionInstruction[] = [ix_spendDrift];

		if (amountSpendSettleBaseUnits > 0) {
			instructions.push(
				await this.program.methods
					.settleSpend(new BN(amountSpendSettleBaseUnits))
					.accounts({
						admin: admin,
						spendSettlementAccount: SPEND_SETTLEMENT_ACCOUNT,
						mint: mint,
						tokenProgram: tokenProgram,
					})
					.instruction(),
			);
		}

		return {
			ixs: instructions,
			lookupTables: this.getLookupTables(),
			signers: [],
		};
	}

	public async makeRefundSpendIxs(
		amountBaseUnits: number,
		marketIndex: MarketIndex,
		admin: PublicKey,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const mint = TOKENS[marketIndex].mint;
		const tokenProgram = await getTokenProgram(this.connection, mint);

		const ix_refundSpend = await this.program.methods
			.refundSpend(new BN(amountBaseUnits))
			.accounts({
				admin,
				owner: this.pubkey,
				mint,
				tokenProgram,
			})
			.instruction();

		return {
			ixs: [ix_refundSpend],
			lookupTables: this.getLookupTables(),
			signers: [],
		};
	}

	/**
	 * Creates instructions to swap two assets, both for swapping collateral and for selling collateral to repay a loan.
	 * @param caller - The public key of the caller. This is the account that acually makes the swap in swapInstructions
	 * @param payer - The public key of the payer.
	 * @param marketIndexFrom - The market index of the asset to swap from.
	 * @param marketIndexTo - The market index of the asset to swap to.
	 * @param swapInstructions - The swap instructions to use, can be anything (eg: Jupiter, Titan, OKX DEX)
	 * @returns {Promise<{
	 *     ixs: TransactionInstruction[],
	 *     lookupTables: AddressLookupTableAccount[],
	 *     signers: Keypair[]
	 * }>} Object containing:
	 * - ixs: Array of instructions to swap assets.
	 * - lookupTables: Array of lookup tables for building VersionedTransaction.
	 * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
	 */
	public async makeSwapIxs(
		caller: PublicKey,
		payer: PublicKey,
		marketIndexFrom: MarketIndex,
		marketIndexTo: MarketIndex,
		swapInstructions: TransactionInstruction[],
		isOwnerSigner: boolean,
		isLiquidationAttempt: boolean,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const mintFrom = TOKENS[marketIndexFrom].mint;
		const mintTo = TOKENS[marketIndexTo].mint;
		const tokenProgramFrom = await getTokenProgram(this.connection, mintFrom);
		const tokenProgramTo = await getTokenProgram(this.connection, mintTo);

		const ix_startSwapDrift = await this.program.methods
			.startSwapDrift()
			.accounts({
				vault: this.vaultPubkey,
				caller: caller,
				mintFrom: mintFrom,
				mintTo: mintTo,
				tokenProgramFrom: tokenProgramFrom,
				tokenProgramTo: tokenProgramTo,
				payer,
			})
			.instruction();

		const ix_executeSwapDrift = await this.program.methods
			.executeSwapDrift(marketIndexFrom, marketIndexTo, isLiquidationAttempt)
			.accounts({
				owner: this.pubkey,
				caller: caller,
				mintFrom: mintFrom,
				mintTo: mintTo,
				tokenProgramFrom: tokenProgramFrom,
				tokenProgramTo: tokenProgramTo,
				payer: payer,
				driftUser: this.driftUser.pubkey,
				driftUserStats: this.driftUser.statsPubkey,
				driftState: getDriftStatePublicKey(),
				driftSpotMarketVaultFrom:
					getDriftSpotMarketVaultPublicKey(marketIndexFrom),
				driftSpotMarketVaultTo: getDriftSpotMarketVaultPublicKey(marketIndexTo),
				driftSigner: this.driftSigner,
				priceUpdateFrom: getPythOracle(marketIndexFrom),
				priceUpdateTo: getPythOracle(marketIndexTo),
			})
			.remainingAccounts(
				this.driftUser.getRemainingAccounts([marketIndexFrom, marketIndexTo]),
			)
			.instruction();

		const ownerAccountMeta = ix_executeSwapDrift.keys.find((key) =>
			key.pubkey.equals(this.pubkey),
		);
		if (ownerAccountMeta) {
			ownerAccountMeta.isSigner = isOwnerSigner; // Manually set signer requirement so TS client doesn't complain
		}

		return {
			ixs: [ix_startSwapDrift, ...swapInstructions, ix_executeSwapDrift],
			lookupTables: this.getLookupTables(),
			signers: [],
		};
	}

	/**
	 * Build instructions for a V2 collateral swap on Drift.
	 * V2 uses USDC as substitute collateral so the flash loan is always in USDC.
	 *
	 * @param {PublicKey} caller - The caller/liquidator public key executing the swap.
	 * @param {PublicKey} payer - The payer for transaction fees and rent.
	 * @param {MarketIndex} marketIndexFrom - Market index of the asset being sold.
	 * @param {MarketIndex} marketIndexTo - Market index of the asset being bought.
	 * @param {number} substituteAmountBaseUnits - Amount of USDC substitute collateral in base units.
	 * @param {number} amountFromBaseUnits - Amount of the "from" asset to withdraw in base units.
	 * @param {TransactionInstruction[]} swapInstructions - Jupiter swap instructions to execute between start and end.
	 * @param {boolean} isOwnerSigner - Whether the owner is signing this transaction (true for user swaps, false for liquidations).
	 * @returns {Promise<{
	 *     ixs: TransactionInstruction[],
	 *     lookupTables: AddressLookupTableAccount[],
	 *     signers: Keypair[]
	 * }>} Object containing:
	 * - ixs: Array of instructions [startSwapDriftV2, ...swapInstructions, endSwapDriftV2].
	 * - lookupTables: Array of lookup tables for building VersionedTransaction.
	 * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
	 */
	public async makeSwapV2Ixs(
		caller: PublicKey,
		payer: PublicKey,
		marketIndexFrom: MarketIndex,
		marketIndexTo: MarketIndex,
		substituteAmountBaseUnits: number,
		amountFromBaseUnits: number,
		swapInstructions: TransactionInstruction[],
		isOwnerSigner: boolean,
		reduceOnly: boolean,
		isLiquidationAttempt: boolean,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const mintSubstitute = TOKENS[MARKET_INDEX_USDC].mint;
		const mintFrom = TOKENS[marketIndexFrom].mint;
		const mintTo = TOKENS[marketIndexTo].mint;
		const tokenProgramSubstitute = await getTokenProgram(
			this.connection,
			mintSubstitute,
		);
		const tokenProgramFrom = await getTokenProgram(this.connection, mintFrom);
		const tokenProgramTo = await getTokenProgram(this.connection, mintTo);

		const ix_startSwapDriftV2 = await this.program.methods
			.startSwapDriftV2(
				MARKET_INDEX_USDC,
				new BN(substituteAmountBaseUnits),
				marketIndexFrom,
				new BN(amountFromBaseUnits),
				marketIndexTo,
				reduceOnly,
			)
			.accounts({
				vault: this.vaultPubkey,
				caller: caller,
				callerSplTo: getAssociatedTokenAddressSync(
					mintTo,
					caller,
					true,
					tokenProgramTo,
				),
				mintSubstitute: mintSubstitute,
				mintFrom: mintFrom,
				driftUser: this.driftUser.pubkey,
				driftUserStats: this.driftUser.statsPubkey,
				driftState: getDriftStatePublicKey(),
				driftSpotMarketVaultSubstitute:
					getDriftSpotMarketVaultPublicKey(MARKET_INDEX_USDC),
				driftSpotMarketVaultFrom:
					getDriftSpotMarketVaultPublicKey(marketIndexFrom),
				driftSigner: this.driftSigner,
				tokenProgramSubstitute: tokenProgramSubstitute,
				tokenProgramFrom: tokenProgramFrom,
				payer: payer,
			})
			.remainingAccounts(
				this.driftUser.getRemainingAccounts([
					MARKET_INDEX_USDC,
					marketIndexFrom,
					marketIndexTo,
				]),
			)
			.instruction();

		const ix_endSwapDriftV2 = await this.program.methods
			.endSwapDriftV2(
				MARKET_INDEX_USDC,
				marketIndexFrom,
				marketIndexTo,
				isLiquidationAttempt,
			)
			.accounts({
				owner: this.pubkey,
				caller: caller,
				mintFrom: mintFrom,
				mintTo: mintTo,
				mintSubstitute: mintSubstitute,
				tokenProgramTo: tokenProgramTo,
				tokenProgramSubstitute: tokenProgramSubstitute,
				payer: payer,
				driftUser: this.driftUser.pubkey,
				driftUserStats: this.driftUser.statsPubkey,
				driftState: getDriftStatePublicKey(),
				driftSpotMarketVaultTo: getDriftSpotMarketVaultPublicKey(marketIndexTo),
				driftSpotMarketVaultSubstitute:
					getDriftSpotMarketVaultPublicKey(MARKET_INDEX_USDC),
				driftSigner: this.driftSigner,
				priceUpdateFrom: getPythOracle(marketIndexFrom),
				priceUpdateTo: getPythOracle(marketIndexTo),
			})
			.remainingAccounts(
				this.driftUser.getRemainingAccounts([
					MARKET_INDEX_USDC,
					marketIndexFrom,
					marketIndexTo,
				]),
			)
			.instruction();

		const ownerAccountMeta = ix_endSwapDriftV2.keys.find((key) =>
			key.pubkey.equals(this.pubkey),
		);
		if (ownerAccountMeta) {
			ownerAccountMeta.isSigner = isOwnerSigner;
		}

		return {
			ixs: [ix_startSwapDriftV2, ...swapInstructions, ix_endSwapDriftV2],
			lookupTables: this.getLookupTables(),
			signers: [],
		};
	}
}
