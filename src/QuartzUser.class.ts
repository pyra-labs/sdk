import type { DriftClient, UserAccount } from "@drift-labs/sdk";
import type {
	AddressLookupTableAccount,
	TransactionInstruction,
} from "@solana/web3.js";
import {
	DEPOSIT_ADDRESS_DATA_SIZE,
	DRIFT_PROGRAM_ID,
	MARKET_INDEX_SOL,
	MARKET_INDEX_USDC,
	MESSAGE_TRANSMITTER_PROGRAM_ID,
	QUARTZ_PROGRAM_ID,
	SPEND_FEE_DESTINATION,
	TOKEN_MESSAGE_MINTER_PROGRAM_ID,
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
	getCollateralRepayLedgerPublicKey,
	getBridgeRentPayerPublicKey,
	getLocalToken,
	getTokenMinter,
	getRemoteTokenMessenger,
	getTokenMessenger,
	getSenderAuthority,
	getMessageTransmitter,
	getEventAuthority,
	getInitRentPayerPublicKey,
	getSpendMulePublicKey,
	getTimeLockRentPayerPublicKey,
	getWithdrawMulePublicKey,
	getDepositAddressPublicKey,
	getDepositMulePublicKey,
	getCollateralRepayMulePublicKey,
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
import { SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
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
		if (marketIndex === MARKET_INDEX_SOL) {
			const rent = await this.connection.getMinimumBalanceForRentExemption(
				DEPOSIT_ADDRESS_DATA_SIZE,
			);
			const balance = await this.connection.getBalance(this.depositAddress);
			const availableBalance = balance - rent;
			return new BN(Math.max(availableBalance, 0));
		}

		const depositAddressAta = await getDepositAddressAtaPublicKey(
			this.connection,
			this.pubkey,
			marketIndex,
		);
		const depositAddressAtaBalance = await getTokenAccountBalance(
			this.connection,
			depositAddressAta,
		);
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
		timeframeInSeconds: BN,
		nextTimeframeResetTimestamp: BN,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const ix_upgradeAccount = await this.program.methods
			.upgradeVault(
				spendLimitPerTransaction,
				spendLimitPerTimeframe,
				timeframeInSeconds,
				nextTimeframeResetTimestamp,
			)
			.accounts({
				vault: this.vaultPubkey,
				owner: this.pubkey,
				initRentPayer: getInitRentPayerPublicKey(),
				systemProgram: SystemProgram.programId,
			})
			.instruction();

		return {
			ixs: [ix_upgradeAccount],
			lookupTables: this.getLookupTables(),
			signers: [],
		};
	}

	public async makeFulfilDepositIxs(
		marketIndex: MarketIndex,
		caller: PublicKey,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const mint = TOKENS[marketIndex].mint;
		const tokenProgram = await getTokenProgram(this.connection, mint);
		const depositAddress = getDepositAddressPublicKey(this.pubkey);

		let depositAddressAta: PublicKey | null = null;
		if (marketIndex !== MARKET_INDEX_SOL) {
			depositAddressAta = getAssociatedTokenAddressSync(
				mint,
				depositAddress,
				true,
				tokenProgram,
			);
		}

		const ix = await this.program.methods
			.fulfilDeposit(marketIndex)
			.accounts({
				vault: this.vaultPubkey,
				depositAddress: depositAddress,
				depositAddressSpl: depositAddressAta,
				owner: this.pubkey,
				mule: getDepositMulePublicKey(this.pubkey, mint),
				caller: caller,
				mint: mint,
				driftUser: this.driftUser.pubkey,
				driftUserStats: this.driftUser.statsPubkey,
				driftState: getDriftStatePublicKey(),
				spotMarketVault: getDriftSpotMarketVaultPublicKey(marketIndex),
				tokenProgram: tokenProgram,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				driftProgram: DRIFT_PROGRAM_ID,
				systemProgram: SystemProgram.programId,
			})
			.remainingAccounts(this.driftUser.getRemainingAccounts(marketIndex))
			.instruction();

		return {
			ixs: [ix],
			lookupTables: this.getLookupTables(),
			signers: [],
		};
	}

	/**
	 * Creates instructions to rescue unsupported tokens from a Quartz rescue token.
	 * @param mint - The mint of the token to rescue.
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
	public async makeRescueDepositIxs(
		destination: PublicKey,
		mint: PublicKey,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const tokenProgram = await getTokenProgram(this.connection, mint);
		const depositAddress = getDepositAddressPublicKey(this.pubkey);
		const depositAddressAta = getAssociatedTokenAddressSync(
			mint,
			depositAddress,
			true,
			tokenProgram,
		);

		const ix = await this.program.methods
			.rescueDeposit()
			.accounts({
				vault: this.vaultPubkey,
				owner: this.pubkey,
				destination: destination,
				destinationSpl: getAssociatedTokenAddressSync(
					mint,
					destination,
					true,
					tokenProgram,
				),
				depositAddress: depositAddress,
				depositAddressSpl: depositAddressAta,
				mint: mint,
				tokenProgram: tokenProgram,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				systemProgram: SystemProgram.programId,
			})
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
		paidByUser = false,
		destinationAddress = this.pubkey,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const orderAccount = Keypair.generate();
		const timeLockRentPayer = paidByUser
			? this.pubkey
			: getTimeLockRentPayerPublicKey();

		const ix = await this.program.methods
			.initiateWithdraw(new BN(amountBaseUnits), marketIndex, reduceOnly)
			.accounts({
				vault: this.vaultPubkey,
				owner: this.pubkey,
				withdrawOrder: orderAccount.publicKey,
				timeLockRentPayer: timeLockRentPayer,
				systemProgram: SystemProgram.programId,
				destination: destinationAddress,
			})
			.instruction();

		return {
			ixs: [ix],
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
	public async makeFulfilWithdrawIxs(
		orderAccount: PublicKey,
		caller: PublicKey,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const order = await this.program.account.withdrawOrder.fetch(orderAccount);

		const marketIndex = order.driftMarketIndex as MarketIndex;
		const timeLockRentPayer = order.timeLock.isOwnerPayer
			? this.pubkey
			: getTimeLockRentPayerPublicKey();

		const mint = TOKENS[marketIndex].mint;
		const tokenProgram = await getTokenProgram(this.connection, mint);

		const destination = order.destination;
		const destinationSpl = getAssociatedTokenAddressSync(
			mint,
			destination,
			true,
			tokenProgram,
		);

		const depositAddress = getDepositAddressPublicKey(this.pubkey);
		const depositAddressAta = getAssociatedTokenAddressSync(
			mint,
			depositAddress,
			true,
			tokenProgram,
		);

		const destinationSplValue =
			marketIndex === MARKET_INDEX_SOL // TODO: Remove once validation fixed in program
				? QUARTZ_PROGRAM_ID
				: destinationSpl;

		const ix_fulfilWithdraw = await this.program.methods
			.fulfilWithdraw()
			.accounts({
				withdrawOrder: orderAccount,
				timeLockRentPayer: timeLockRentPayer,
				caller: caller,
				vault: this.vaultPubkey,
				mule: getWithdrawMulePublicKey(this.pubkey, mint),
				owner: this.pubkey,
				mint: mint,
				driftUser: this.driftUser.pubkey,
				driftUserStats: this.driftUser.statsPubkey,
				driftState: getDriftStatePublicKey(),
				spotMarketVault: getDriftSpotMarketVaultPublicKey(marketIndex),
				driftSigner: this.driftSigner,
				tokenProgram: tokenProgram,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				driftProgram: DRIFT_PROGRAM_ID,
				systemProgram: SystemProgram.programId,
				destination: destination,
				destinationSpl: destinationSplValue,
				depositAddress: depositAddress,
				depositAddressSpl: depositAddressAta,
				admin: this.program.programId,
			})
			.remainingAccounts(this.driftUser.getRemainingAccounts(marketIndex))
			.instruction();

		return {
			ixs: [ix_fulfilWithdraw],
			lookupTables: this.getLookupTables(),
			signers: [],
		};
	}

	public async makeFeePaymentIxs(
		amountBaseUnits: number,
		marketIndex: MarketIndex,
		admin: Signer,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Signer[];
	}> {
		const timeLockRentPayer = getTimeLockRentPayerPublicKey();
		const orderAccount = Keypair.generate();

		const ix_initiateWithdraw = await this.program.methods
			.initiateWithdraw(new BN(amountBaseUnits), marketIndex, false)
			.accounts({
				vault: this.vaultPubkey,
				owner: this.pubkey,
				withdrawOrder: orderAccount.publicKey,
				timeLockRentPayer: timeLockRentPayer,
				systemProgram: SystemProgram.programId,
				destination: admin.publicKey,
			})
			.instruction();

		// Get destination
		const mint = TOKENS[marketIndex].mint;
		const tokenProgram = await getTokenProgram(this.connection, mint);
		const destinationSpl = getAssociatedTokenAddressSync(
			mint,
			admin.publicKey,
			true,
			tokenProgram,
		);

		// Get deposit address (in case any funds are there)
		const depositAddress = getDepositAddressPublicKey(this.pubkey);
		const depositAddressAta = getAssociatedTokenAddressSync(
			mint,
			depositAddress,
			true,
			tokenProgram,
		);
		const destinationSplValue =
			marketIndex === MARKET_INDEX_SOL // TODO: Remove once validation fixed in program
				? QUARTZ_PROGRAM_ID
				: destinationSpl;

		const ix_fulfilWithdraw = await this.program.methods
			.fulfilWithdraw()
			.accounts({
				withdrawOrder: orderAccount.publicKey,
				timeLockRentPayer: timeLockRentPayer,
				caller: admin.publicKey,
				vault: this.vaultPubkey,
				mule: getWithdrawMulePublicKey(this.pubkey, mint),
				owner: this.pubkey,
				mint: mint,
				driftUser: this.driftUser.pubkey,
				driftUserStats: this.driftUser.statsPubkey,
				driftState: getDriftStatePublicKey(),
				spotMarketVault: getDriftSpotMarketVaultPublicKey(marketIndex),
				driftSigner: this.driftSigner,
				tokenProgram: tokenProgram,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				driftProgram: DRIFT_PROGRAM_ID,
				systemProgram: SystemProgram.programId,
				destination: admin.publicKey,
				destinationSpl: destinationSplValue,
				depositAddress: depositAddress,
				depositAddressSpl: depositAddressAta,
				admin: admin.publicKey,
			})
			.remainingAccounts(this.driftUser.getRemainingAccounts(marketIndex))
			.instruction();

		return {
			ixs: [ix_initiateWithdraw, ix_fulfilWithdraw],
			lookupTables: this.getLookupTables(),
			signers: [admin],
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
		const timeLockRentPayer = order.timeLock.isOwnerPayer
			? this.pubkey
			: getTimeLockRentPayerPublicKey();

		const ix_fulfilWithdraw = await this.program.methods
			.cancelWithdraw()
			.accounts({
				withdrawOrder: orderAccount,
				owner: this.pubkey,
				timeLockRentPayer: timeLockRentPayer,
				systemProgram: SystemProgram.programId,
			})
			.instruction();

		return {
			ixs: [ix_fulfilWithdraw],
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
	public async makeInitiateSpendLimitsIxs(
		spendLimitPerTransaction: BN,
		spendLimitPerTimeframe: BN,
		timeframeInSeconds: BN,
		nextTimeframeResetTimestamp: BN,
		paidByUser = false,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const orderAccount = Keypair.generate();
		const timeLockRentPayer = paidByUser
			? this.pubkey
			: getTimeLockRentPayerPublicKey();

		const ix = await this.program.methods
			.initiateSpendLimits(
				spendLimitPerTransaction,
				spendLimitPerTimeframe,
				timeframeInSeconds,
				nextTimeframeResetTimestamp,
			)
			.accounts({
				vault: this.vaultPubkey,
				owner: this.pubkey,
				spendLimitsOrder: orderAccount.publicKey,
				timeLockRentPayer: timeLockRentPayer,
				systemProgram: SystemProgram.programId,
			})
			.instruction();

		return {
			ixs: [ix],
			lookupTables: this.getLookupTables(),
			signers: [orderAccount],
		};
	}

	/**
	 * Creates instructions to update the card spend limits of a Quartz user account.
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
	public async makeFulfilSpendLimitsIxs(
		orderAccount: PublicKey,
		caller: PublicKey,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const order =
			await this.program.account.spendLimitsOrder.fetch(orderAccount);
		const timeLockRentPayer = order.timeLock.isOwnerPayer
			? this.pubkey
			: getTimeLockRentPayerPublicKey();

		const ix_fulfilSpendLimits = await this.program.methods
			.fulfilSpendLimits()
			.accounts({
				spendLimitsOrder: orderAccount,
				timeLockRentPayer: timeLockRentPayer,
				caller: caller,
				vault: this.vaultPubkey,
				owner: this.pubkey,
				systemProgram: SystemProgram.programId,
			})
			.instruction();

		return {
			ixs: [ix_fulfilSpendLimits],
			lookupTables: this.getLookupTables(),
			signers: [],
		};
	}

	/**
	 * Creates instructions to instantly increase the spend limits of a Quartz user account, skipping the time lock.
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
	 * @throw Error if the RPC connection fails, if the spend limits are invalid, or if the adjustment to spend limits results in a lower spend limit. Lowering spend limits must be done through adjustSpendLimits.
	 */
	public async makeIncreaseSpendLimitsIxs(
		spendLimitPerTransaction: BN,
		spendLimitPerTimeframe: BN,
		timeframeInSeconds: BN,
		nextTimeframeResetTimestamp: BN,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const ix = await this.program.methods
			.increaseSpendLimits(
				spendLimitPerTransaction,
				spendLimitPerTimeframe,
				timeframeInSeconds,
				nextTimeframeResetTimestamp,
			)
			.accounts({
				vault: this.vaultPubkey,
				owner: this.pubkey,
			})
			.instruction();

		return {
			ixs: [ix],
			lookupTables: this.getLookupTables(),
			signers: [],
		};
	}

	/**
	 * Creates instructions to spend using the Quartz card.
	 * @param amountSpendBaseUnits - The amount of tokens to spend.
	 * @param spendCaller - The public key of the Quartz spend caller.
	 * @param spendFee - True means a percentage of the spend will be sent to the spend fee address.
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
		amountFeeBaseUnits: number,
		spendCaller: Keypair,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const messageSentEventData = Keypair.generate();

		const mint = TOKENS[MARKET_INDEX_USDC].mint;
		const tokenProgram = await getTokenProgram(this.connection, mint);
		const depositAddress = getDepositAddressPublicKey(this.pubkey);
		const depositAddressUsdc = getAssociatedTokenAddressSync(
			mint,
			depositAddress,
			true,
			tokenProgram,
		);

		const ix_startSpend = await this.program.methods
			.startSpend(new BN(amountSpendBaseUnits), new BN(amountFeeBaseUnits))
			.accounts({
				vault: this.vaultPubkey,
				owner: this.pubkey,
				spendCaller: spendCaller.publicKey,
				spendFeeDestination: SPEND_FEE_DESTINATION,
				mule: getSpendMulePublicKey(this.pubkey),
				usdcMint: TOKENS[MARKET_INDEX_USDC].mint,
				driftUser: this.driftUser.pubkey,
				driftUserStats: this.driftUser.statsPubkey,
				driftState: getDriftStatePublicKey(),
				spotMarketVault: getDriftSpotMarketVaultPublicKey(MARKET_INDEX_USDC),
				driftSigner: this.driftSigner,
				tokenProgram: TOKEN_PROGRAM_ID,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				driftProgram: DRIFT_PROGRAM_ID,
				instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
				systemProgram: SystemProgram.programId,
				depositAddress: depositAddress,
				depositAddressUsdc: depositAddressUsdc,
			})
			.remainingAccounts(this.driftUser.getRemainingAccounts(MARKET_INDEX_USDC))
			.instruction();

		const ix_completeSpend = await this.program.methods
			.completeSpend()
			.accounts({
				vault: this.vaultPubkey,
				owner: this.pubkey,
				spendCaller: spendCaller.publicKey,
				mule: getSpendMulePublicKey(this.pubkey),
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
				instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
				systemProgram: SystemProgram.programId,
			})
			.instruction();

		return {
			ixs: [ix_startSpend, ix_completeSpend],
			lookupTables: this.getLookupTables(),
			signers: [spendCaller, messageSentEventData],
		};
	}

	/**
	 * Creates instructions to repay a loan using collateral.
	 * @param caller - The public key of the caller, this can be the owner or someone else if account health is 0%.
	 * @param depositMarketIndex - The market index of the loan token to deposit.
	 * @param withdrawMarketIndex - The market index of the collateral token to withdraw.
	 * @param swapInstruction - The swap instruction to use. Deposit and withdrawn amounts are calculated by the balance change after this instruction.
	 * @param requireOwnerSignature - True means the owner must sign the transaction. This is for manually marking the account info when two signers are required.
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
		swapInstruction: TransactionInstruction,
		requireOwnerSignature = false,
	): Promise<{
		ixs: TransactionInstruction[];
		lookupTables: AddressLookupTableAccount[];
		signers: Keypair[];
	}> {
		const depositMint = TOKENS[depositMarketIndex].mint;
		const withdrawMint = TOKENS[withdrawMarketIndex].mint;

		const [depositTokenProgram, withdrawTokenProgram] = await Promise.all([
			getTokenProgram(this.connection, depositMint),
			getTokenProgram(this.connection, withdrawMint),
		]);

		const callerDepositSpl = getAssociatedTokenAddressSync(
			depositMint,
			caller,
			false,
			depositTokenProgram,
		);
		const callerWithdrawSpl = getAssociatedTokenAddressSync(
			withdrawMint,
			caller,
			false,
			withdrawTokenProgram,
		);

		const driftState = getDriftStatePublicKey();
		const collateralRepayLedger = getCollateralRepayLedgerPublicKey(
			this.pubkey,
		);

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
				ledger: collateralRepayLedger,
			})
			.instruction();

		const depositCollateralRepayPromise = this.program.methods
			.depositCollateralRepay(depositMarketIndex)
			.accounts({
				caller: caller,
				callerSpl: callerDepositSpl,
				owner: this.pubkey,
				vault: this.vaultPubkey,
				mule: getCollateralRepayMulePublicKey(this.pubkey, depositMint),
				mint: depositMint,
				driftUser: this.driftUser.pubkey,
				driftUserStats: this.driftUser.statsPubkey,
				driftState: driftState,
				spotMarketVault: getDriftSpotMarketVaultPublicKey(depositMarketIndex),
				tokenProgram: depositTokenProgram,
				driftProgram: DRIFT_PROGRAM_ID,
				systemProgram: SystemProgram.programId,
				instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
				ledger: collateralRepayLedger,
			})
			.remainingAccounts(
				this.driftUser.getRemainingAccounts(depositMarketIndex),
			)
			.instruction();

		const withdrawCollateralRepayPromise = this.program.methods
			.withdrawCollateralRepay(withdrawMarketIndex)
			.accounts({
				caller: caller,
				callerSpl: callerWithdrawSpl,
				owner: this.pubkey,
				vault: this.vaultPubkey,
				mule: getCollateralRepayMulePublicKey(this.pubkey, withdrawMint),
				mint: withdrawMint,
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
				ledger: collateralRepayLedger,
			})
			.remainingAccounts(
				this.driftUser.getRemainingAccounts(withdrawMarketIndex),
			)
			.instruction();

		const [
			ix_startCollateralRepay,
			ix_depositCollateralRepay,
			ix_withdrawCollateralRepay,
		] = await Promise.all([
			startCollateralRepayPromise,
			depositCollateralRepayPromise,
			withdrawCollateralRepayPromise,
		]);

		// Mark the owner as a signer if the caller is not the owner
		if (requireOwnerSignature) {
			for (const ix of [
				ix_startCollateralRepay,
				ix_depositCollateralRepay,
				ix_withdrawCollateralRepay,
			]) {
				const ownerAccountMeta = ix.keys.find((key) =>
					key.pubkey.equals(this.pubkey),
				);
				if (ownerAccountMeta) {
					ownerAccountMeta.isSigner = true;
				}
			}
		}

		return {
			ixs: [
				ix_startCollateralRepay,
				swapInstruction,
				ix_depositCollateralRepay,
				ix_withdrawCollateralRepay,
			],
			lookupTables: this.getLookupTables(),
			signers: [],
		};
	}
}
