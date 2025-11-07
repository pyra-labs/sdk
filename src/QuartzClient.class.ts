import { BN, type DriftClient, type SpotMarketAccount } from "@drift-labs/sdk";
import {
	calculateBorrowRate,
	calculateDepositRate,
	fetchUserAccountsUsingKeys as fetchDriftAccountsUsingKeys,
} from "@drift-labs/sdk";
import {
	MAX_ACCOUNTS_PER_FETCH_CALL,
	QUARTZ_ADDRESS_TABLE,
	QUARTZ_PROGRAM_ID,
} from "./config/constants.js";
import type { Pyra } from "./types/idl/pyra.js";
import idl from "./types/idl/pyra.json" with { type: "json" };
import {
	AnchorProvider,
	BorshInstructionCoder,
	Program,
	setProvider,
} from "@coral-xyz/anchor";
import type {
	PublicKey,
	AddressLookupTableAccount,
	MessageCompiledInstruction,
	Logs,
} from "@solana/web3.js";
import { QuartzUser } from "./QuartzUser.class.js";
import {
	getDriftStatePublicKey,
	getDriftUserPublicKey,
	getDriftUserStatsPublicKey,
	getVaultPublicKey,
} from "./utils/accounts.js";
import { DummyWallet } from "./types/classes/DummyWallet.class.js";
import type { TransactionInstruction } from "@solana/web3.js";
import { retryWithBackoff } from "./utils/helpers.js";
import { Keypair } from "@solana/web3.js";
import { DriftClientService } from "./services/DriftClientService.js";
import type { VersionedTransactionResponse } from "@solana/web3.js";
import type {
	WithdrawOrder,
	WithdrawOrderAccount,
} from "./types/accounts/WithdrawOrder.account.js";
import type {
	SpendLimitsOrder,
	SpendLimitsOrderAccount,
} from "./types/accounts/SpendLimitsOrder.account.js";
import type { MarketIndex } from "./index.browser.js";
import AdvancedConnection from "@quartz-labs/connection";
import type { Connection } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";

export class QuartzClient {
	private connection: AdvancedConnection;
	private program: Program<Pyra>;
	private quartzLookupTable: AddressLookupTableAccount;
	private driftClient: DriftClient;

	private constructor(
		connection: AdvancedConnection,
		program: Program<Pyra>,
		quartzAddressTable: AddressLookupTableAccount,
		driftClient: DriftClient,
	) {
		this.connection = connection;
		this.program = program;
		this.quartzLookupTable = quartzAddressTable;
		this.driftClient = driftClient;
	}

	private static async getProgram(connection: Connection) {
		const wallet = new DummyWallet();
		const provider = new AnchorProvider(connection, wallet, {
			commitment: "confirmed",
		});
		setProvider(provider);
		return new Program(idl as Pyra, provider) as Program<Pyra>;
	}

	/**
	 * Fetch a QuartzClient instance.
	 * @param config - Configuration object, you must provide either `rpcUrls` or `connection`.
	 * @param config.rpcUrls - Array of RPC URLs.
	 * @param config.connection - AdvancedConnection instance (from @quartz-labs/connection)
	 * @param config.pollingFrequency - Polling frequency in milliseconds.
	 * @returns QuartzClient instance.
	 */
	public static async fetchClient(config: {
		rpcUrls?: string[];
		connection?: AdvancedConnection;
		pollingFrequency?: number;
	}): Promise<QuartzClient> {
		if (!config.connection && !config.rpcUrls)
			throw Error("Either rpcUrls or connection must be provided");
		const connection =
			config.connection ?? new AdvancedConnection(config.rpcUrls as string[]);

		const pollingFrequency = config.pollingFrequency ?? 1000;

		const program = await QuartzClient.getProgram(connection);
		const quartzLookupTable = await connection
			.getAddressLookupTable(QUARTZ_ADDRESS_TABLE)
			.then((res) => res.value);
		if (!quartzLookupTable)
			throw Error("Address Lookup Table account not found");

		const driftClient = await DriftClientService.getDriftClient(
			connection,
			pollingFrequency,
		);

		return new QuartzClient(
			connection,
			program,
			quartzLookupTable,
			driftClient,
		);
	}

	public static async doesQuartzUserExist(
		connection: Connection,
		owner: PublicKey,
		attempts = 5,
	): Promise<boolean> {
		const vault = getVaultPublicKey(owner);
		const program = await QuartzClient.getProgram(connection);
		try {
			await retryWithBackoff(async () => {
				await program.account.vault.fetch(vault);
			}, attempts);
			return true;
		} catch {
			return false;
		}
	}

	public async getAllQuartzAccountOwnerPubkeys(): Promise<PublicKey[]> {
		return (await this.program.account.vault.all()).map(
			(vault) => vault.account.owner,
		);
	}

	public async getQuartzAccount(owner: PublicKey): Promise<QuartzUser> {
		const vaultAddress = getVaultPublicKey(owner);
		const vaultAccount = await this.program.account.vault.fetch(vaultAddress); // Check account exists

		const [driftUserAccount] = await fetchDriftAccountsUsingKeys(
			this.connection,
			this.driftClient.program,
			[getDriftUserPublicKey(vaultAddress)],
		);
		if (!driftUserAccount) throw Error("Drift user not found");

		return new QuartzUser(
			owner,
			this.connection,
			this,
			this.program,
			this.quartzLookupTable,
			this.driftClient,
			driftUserAccount,
			vaultAccount.spendLimitPerTransaction,
			vaultAccount.spendLimitPerTimeframe,
			vaultAccount.remainingSpendLimitPerTimeframe,
			vaultAccount.nextTimeframeResetTimestamp,
			vaultAccount.timeframeInSeconds,
		);
	}

	public async getMultipleQuartzAccounts(
		owners: PublicKey[],
	): Promise<(QuartzUser | null)[]> {
		if (owners.length === 0) return [];
		const vaultAddresses = owners.map((owner) => getVaultPublicKey(owner));

		const vaultChunks = Array.from(
			{
				length: Math.ceil(vaultAddresses.length / MAX_ACCOUNTS_PER_FETCH_CALL),
			},
			(_, i) =>
				vaultAddresses.slice(
					i * MAX_ACCOUNTS_PER_FETCH_CALL,
					(i + 1) * MAX_ACCOUNTS_PER_FETCH_CALL,
				),
		);

		const vaultResults = await Promise.all(
			vaultChunks.map(async (chunk) => {
				const vaultAccounts =
					await this.program.account.vault.fetchMultiple(chunk);
				return vaultAccounts.map((account, index) => {
					if (account === null)
						throw Error(
							`Account not found for pubkey: ${vaultAddresses[index]?.toBase58()}`,
						);
					return account;
				});
			}),
		);
		const vaultAccounts = vaultResults.flat();

		const driftResults = await Promise.all(
			vaultChunks.map(async (chunk) => {
				return await fetchDriftAccountsUsingKeys(
					this.connection,
					this.driftClient.program,
					chunk.map((vault) => getDriftUserPublicKey(vault)),
				);
			}),
		);
		const driftUsers = driftResults.flat();

		// TODO: Uncomment once Drift accounts are guaranteed
		// const undefinedIndex = driftUsers.findIndex(user => !user);
		// if (undefinedIndex !== -1) {
		//     throw new Error(`[${this.wallet?.publicKey}] Failed to fetch drift user for vault ${vaults[undefinedIndex].toBase58()}`);
		// }

		return driftUsers.map((driftUser, index) => {
			if (driftUser === undefined) return null;
			if (owners[index] === undefined)
				throw Error("Missing pubkey in owners array");

			const vaultAccount = vaultAccounts[index];
			if (!vaultAccount)
				throw Error(
					`Vault account not found for pubkey: ${vaultAddresses[index]?.toBase58()}`,
				);

			return new QuartzUser(
				owners[index],
				this.connection,
				this,
				this.program,
				this.quartzLookupTable,
				this.driftClient,
				driftUser,
				vaultAccount.spendLimitPerTransaction,
				vaultAccount.spendLimitPerTimeframe,
				vaultAccount.remainingSpendLimitPerTimeframe,
				vaultAccount.nextTimeframeResetTimestamp,
				vaultAccount.timeframeInSeconds,
			);
		});
	}

	public async isDriftFull(): Promise<boolean> {
		const state = await this.driftClient.getStateAccount();
		const maxAccounts =
			state.maxNumberOfSubAccounts <= 5
				? state.maxNumberOfSubAccounts
				: state.maxNumberOfSubAccounts * 100;

		if (maxAccounts === 0) return false;

		return state.numberOfAuthorities.toNumber() >= maxAccounts;
	}

	public getMarketKeypair(
		marketIndex: number,
		baseKeypair: Uint8Array,
	): Keypair {
		const seed = baseKeypair.slice(0, 32);
		const path = `m/44'/501'/${marketIndex}'/0'`;
		const derived = derivePath(path, Buffer.from(seed).toString("hex")).key;
		return Keypair.fromSeed(derived);
	}

	public async getDepositRate(marketIndex: MarketIndex): Promise<BN> {
		const spotMarket = await this.getSpotMarketAccount(marketIndex);
		const depositRate = calculateDepositRate(spotMarket);
		return depositRate;
	}

	public async getBorrowRate(marketIndex: MarketIndex): Promise<BN> {
		const spotMarket = await this.getSpotMarketAccount(marketIndex);
		const borrowRate = calculateBorrowRate(spotMarket);
		return borrowRate;
	}

	public async getCollateralWeight(marketIndex: MarketIndex): Promise<number> {
		const spotMarket = await this.getSpotMarketAccount(marketIndex);
		return spotMarket.initialAssetWeight;
	}

	private async getSpotMarketAccount(
		marketIndex: MarketIndex,
	): Promise<SpotMarketAccount> {
		const spotMarket = await this.driftClient.getSpotMarketAccount(marketIndex);
		if (!spotMarket) throw Error("Spot market not found");
		return spotMarket;
	}

	public async getOpenWithdrawOrders(
		user?: PublicKey,
	): Promise<WithdrawOrderAccount[]> {
		const query = user
			? [
					{
						memcmp: {
							offset: 8,
							bytes: user.toBase58(),
						},
					},
				]
			: undefined;

		const orders = await this.program.account.withdrawOrder.all(query);
		const sortedOrders = orders.sort((a, b) =>
			a.account.timeLock.releaseSlot.cmp(b.account.timeLock.releaseSlot),
		);

		return sortedOrders.map((order) => ({
			publicKey: order.publicKey,
			account: {
				...order.account,
				driftMarketIndex: new BN(order.account.driftMarketIndex),
			},
		}));
	}

	public async getOpenSpendLimitsOrders(
		user?: PublicKey,
	): Promise<SpendLimitsOrderAccount[]> {
		const query = user
			? [
					{
						memcmp: {
							offset: 8,
							bytes: user.toBase58(),
						},
					},
				]
			: undefined;

		const orders = await this.program.account.spendLimitsOrder.all(query);
		return orders.sort((a, b) =>
			a.account.timeLock.releaseSlot.cmp(b.account.timeLock.releaseSlot),
		);
	}

	public async parseOpenWithdrawOrder(
		order: PublicKey,
		retries = 5,
	): Promise<WithdrawOrder> {
		const orderAccount = await retryWithBackoff(async () => {
			return await this.program.account.withdrawOrder.fetch(order);
		}, retries);
		return {
			...orderAccount,
			driftMarketIndex: new BN(orderAccount.driftMarketIndex),
		};
	}

	public async parseOpenSpendLimitsOrder(
		order: PublicKey,
		retries = 5,
	): Promise<SpendLimitsOrder> {
		const orderAccount = await retryWithBackoff(async () => {
			return await this.program.account.spendLimitsOrder.fetch(order);
		}, retries);
		return orderAccount;
	}

	public async listenForInstruction(
		instructionName: string,
		onInstruction: (
			tx: VersionedTransactionResponse,
			ix: MessageCompiledInstruction,
			accountKeys: PublicKey[],
		) => void,
		ignoreErrors = true,
	) {
		const instructionNameSnake = instructionName
			.replace(/([A-Z])/g, "_$1") // Add underscore before capital letters
			.toLowerCase() // Convert to lowercase
			.replace(/^_/, ""); // Remove leading underscore

		this.connection.onLogs(
			QUARTZ_PROGRAM_ID,
			async (logs: Logs) => {
				if (!logs.logs.some((log) => log.includes(instructionName))) return;

				const tx = await retryWithBackoff(async () => {
					const tx = await this.connection.getTransaction(logs.signature, {
						maxSupportedTransactionVersion: 0,
						commitment: "confirmed",
					});
					if (!tx) throw new Error("Transaction not found");
					return tx;
				});

				if (tx.meta?.err && ignoreErrors) return;

				const encodedIxs = tx.transaction.message.compiledInstructions;

				const coder = new BorshInstructionCoder(idl as Pyra);
				for (const ix of encodedIxs) {
					try {
						const quartzIx = coder.decode(Buffer.from(ix.data));
						if (quartzIx?.name.toLowerCase() !== instructionNameSnake) {
							continue;
						}

						const accountKeys = tx.transaction.message.staticAccountKeys;
						onInstruction(tx, ix, accountKeys);
					} catch {}
				}
			},
			"confirmed",
		);
	}

	// --- Instructions ---

	/**
	 * Creates instructions to initialize a new Quartz user account.
	 * @param owner - The public key of Quartz account owner.
	 * @param spendLimitPerTransaction - The card spend limit per transaction.
	 * @param spendLimitPerTimeframe - The card spend limit per timeframe.
	 * @param timeframeInSlots - The timeframe in slots (eg: 216,000 for ~1 day).
	 * @returns {Promise<{
	 *     ixs: TransactionInstruction[],
	 *     lookupTables: AddressLookupTableAccount[],
	 *     signers: Keypair[]
	 * }>} Object containing:
	 * - ixs: Array of instructions to initialize the Quartz user account.
	 * - lookupTables: Array of lookup tables for building VersionedTransaction.
	 * - signers: Array of signer keypairs that must sign the transaction the instructions are added to.
	 * @throws Error if the RPC connection fails. The transaction will fail if the vault already exists, or the user does not have enough SOL.
	 */
	public async makeInitQuartzUserIxs(
		owner: PublicKey,
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
		const vault = getVaultPublicKey(owner);
		const subAccountId = 0;

		const ix_initUser = await this.program.methods
			.initUser(
				spendLimitPerTransaction,
				spendLimitPerTimeframe,
				nextTimeframeResetTimestamp,
				timeframeInSeconds,
			)
			.accounts({
				owner: owner,
				payer: payer,
			})
			.instruction();

		const ix_initDrift = await this.program.methods
			.initDrift(subAccountId)
			.accounts({
				vault: vault,
				payer: payer,
				driftUserStats: getDriftUserStatsPublicKey(vault),
				driftState: getDriftStatePublicKey(),
			})
			.instruction();

		return {
			ixs: [ix_initUser, ix_initDrift],
			lookupTables: [this.quartzLookupTable],
			signers: [],
		};
	}
}
