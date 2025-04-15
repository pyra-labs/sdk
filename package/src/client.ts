import { BN, type DriftClient } from "@drift-labs/sdk";
import { calculateBorrowRate, calculateDepositRate, DRIFT_PROGRAM_ID, fetchUserAccountsUsingKeys as fetchDriftAccountsUsingKeys } from "@drift-labs/sdk";
import { MESSAGE_TRANSMITTER_PROGRAM_ID, QUARTZ_ADDRESS_TABLE, QUARTZ_PROGRAM_ID } from "./config/constants.js";
import { IDL, type Quartz } from "./types/idl/quartz.js";
import { AnchorProvider, BorshInstructionCoder, Program, setProvider } from "@coral-xyz/anchor";
import type { PublicKey, Connection, AddressLookupTableAccount, MessageCompiledInstruction, Logs, Signer, } from "@solana/web3.js";
import { QuartzUser } from "./user.js";
import { getBridgeRentPayerPublicKey, getDriftStatePublicKey, getDriftUserPublicKey, getDriftUserStatsPublicKey, getInitRentPayerPublicKey, getMessageTransmitter, getVaultPublicKey } from "./utils/accounts.js";
import { SystemProgram, SYSVAR_RENT_PUBKEY, } from "@solana/web3.js";
import { DummyWallet } from "./types/classes/DummyWallet.class.js";
import type { TransactionInstruction } from "@solana/web3.js";
import { retryWithBackoff } from "./utils/helpers.js";
import type { Keypair } from "@solana/web3.js";
import { DriftClientService } from "./services/driftClientService.js";
import type { VersionedTransactionResponse } from "@solana/web3.js";
import type { WithdrawOrder, WithdrawOrderAccount } from "./types/accounts/WithdrawOrder.account.js";
import type { SpendLimitsOrder, SpendLimitsOrderAccount } from "./types/accounts/SpendLimitsOrder.account.js";
import type { MarketIndex } from "./index.browser.js";

export class QuartzClient {
    private connection: Connection;
    private program: Program<Quartz>;
    private quartzLookupTable: AddressLookupTableAccount;
    private driftClient: DriftClient;

    private constructor(
        connection: Connection,
        program: Program<Quartz>,
        quartzAddressTable: AddressLookupTableAccount,
        driftClient: DriftClient
    ) {
        this.connection = connection;
        this.program = program;
        this.quartzLookupTable = quartzAddressTable;
        this.driftClient = driftClient;
    }

    private static async getProgram(connection: Connection) {
        const wallet = new DummyWallet();
        const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
        setProvider(provider);
        return new Program(IDL, QUARTZ_PROGRAM_ID, provider) as unknown as Program<Quartz>;
    }

    public static async fetchClient(
        connection: Connection,
        pollingFrequency = 1000
    ): Promise<QuartzClient> {
        const program = await QuartzClient.getProgram(connection);
        const quartzLookupTable = await connection.getAddressLookupTable(QUARTZ_ADDRESS_TABLE).then((res) => res.value);
        if (!quartzLookupTable) throw Error("Address Lookup Table account not found");

        const driftClient = await DriftClientService.getDriftClient(connection, pollingFrequency);

        return new QuartzClient(
            connection,
            program,
            quartzLookupTable,
            driftClient
        );
    }

    public static async doesQuartzUserExist(
        connection: Connection,
        owner: PublicKey
    ) {
        const vault = getVaultPublicKey(owner);
        const program = await QuartzClient.getProgram(connection);
        try {
            await retryWithBackoff(
                async () => {
                    await program.account.vault.fetch(vault);
                },
                3
            );
            return true;
        } catch {
            return false;
        }
    }

    public async getAllQuartzAccountOwnerPubkeys(): Promise<PublicKey[]> {
        return (
            await this.program.account.vault.all()
        ).map((vault) => vault.account.owner);
    }

    public async getQuartzAccount(owner: PublicKey): Promise<QuartzUser> {
        const vaultAddress = getVaultPublicKey(owner);
        const vaultAccount = await this.program.account.vault.fetch(vaultAddress); // Check account exists

        const [driftUserAccount] = await fetchDriftAccountsUsingKeys(
            this.connection,
            this.driftClient.program,
            [getDriftUserPublicKey(vaultAddress)]
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
            vaultAccount.timeframeInSeconds
        );
    }

    public async getMultipleQuartzAccounts(owners: PublicKey[]): Promise<(QuartzUser | null)[]> {
        if (owners.length === 0) return [];
        const vaultAddresses = owners.map((owner) => getVaultPublicKey(owner));
        const vaultAccounts = await this.program.account.vault.fetchMultiple(vaultAddresses);

        vaultAccounts.forEach((account, index) => {
            if (account === null) throw Error(`Account not found for pubkey: ${vaultAddresses[index]?.toBase58()}`)
        });

        const driftUsers = await fetchDriftAccountsUsingKeys(
            this.connection,
            this.driftClient.program,
            vaultAddresses.map((vault) => getDriftUserPublicKey(vault))
        )

        // TODO: Uncomment once Drift accounts are guaranteed
        // const undefinedIndex = driftUsers.findIndex(user => !user);
        // if (undefinedIndex !== -1) {
        //     throw new Error(`[${this.wallet?.publicKey}] Failed to fetch drift user for vault ${vaults[undefinedIndex].toBase58()}`);
        // }

        return driftUsers.map((driftUser, index) => {
            if (driftUser === undefined) return null;
            if (owners[index] === undefined) throw Error("Missing pubkey in owners array");

            const vaultAccount = vaultAccounts[index];
            if (!vaultAccount) throw Error(`Vault account not found for pubkey: ${vaultAddresses[index]?.toBase58()}`);

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
                vaultAccount.timeframeInSeconds
            )
        });
    }

    public async getDepositRate(marketIndex: MarketIndex) {
        const spotMarket = await this.getSpotMarketAccount(marketIndex);
        const depositRate = calculateDepositRate(spotMarket);
        return depositRate;
    }

    public async getBorrowRate(marketIndex: MarketIndex) {
        const spotMarket = await this.getSpotMarketAccount(marketIndex);
        const borrowRate = calculateBorrowRate(spotMarket);
        return borrowRate;
    }

    public async getCollateralWeight(marketIndex: MarketIndex) {
        const spotMarket = await this.getSpotMarketAccount(marketIndex);
        return spotMarket.initialAssetWeight;
    }

    private async getSpotMarketAccount(marketIndex: MarketIndex) {
        const spotMarket = await this.driftClient.getSpotMarketAccount(marketIndex);
        if (!spotMarket) throw Error("Spot market not found");
        return spotMarket;
    }

    public async getOpenWithdrawOrders(
        user?: PublicKey
    ): Promise<WithdrawOrderAccount[]> {
        const query = user
            ? [{
                memcmp: {
                    offset: 8,
                    bytes: user.toBase58()
                }
            }]
            : undefined;

        const orders = await this.program.account.withdrawOrder.all(query);
        const sortedOrders = orders.sort((a, b) =>
            a.account.timeLock.releaseSlot.cmp(b.account.timeLock.releaseSlot)
        )

        return sortedOrders.map((order) => ({
            publicKey: order.publicKey,
            account: {
                ...order.account,
                driftMarketIndex: new BN(order.account.driftMarketIndex)
            }
        }));
    }

    public async getOpenSpendLimitsOrders(
        user?: PublicKey
    ): Promise<SpendLimitsOrderAccount[]> {
        const query = user
            ? [{
                memcmp: {
                    offset: 8,
                    bytes: user.toBase58()
                }
            }]
            : undefined;

        const orders = await this.program.account.spendLimitsOrder.all(query);
        return orders.sort((a, b) =>
            a.account.timeLock.releaseSlot.cmp(b.account.timeLock.releaseSlot)
        );
    }

    public async parseOpenWithdrawOrder(
        order: PublicKey,
        retries = 5
    ): Promise<WithdrawOrder> {
        const orderAccount = await retryWithBackoff(
            async () => {
                return await this.program.account.withdrawOrder.fetch(order);
            },
            retries
        );
        return {
            ...orderAccount,
            driftMarketIndex: new BN(orderAccount.driftMarketIndex)
        };
    }

    public async parseOpenSpendLimitsOrder(
        order: PublicKey,
        retries = 5
    ): Promise<SpendLimitsOrder> {
        const orderAccount = await retryWithBackoff(
            async () => {
                return await this.program.account.spendLimitsOrder.fetch(order);
            },
            retries
        );
        return orderAccount;
    }

    public async listenForInstruction(
        instructionName: string,
        onInstruction: (tx: VersionedTransactionResponse, ix: MessageCompiledInstruction, accountKeys: PublicKey[]) => void,
        ignoreErrors = true
    ) {
        this.connection.onLogs(
            QUARTZ_PROGRAM_ID,
            async (logs: Logs) => {
                if (!logs.logs.some(log => log.includes(instructionName))) return;

                const tx = await retryWithBackoff(
                    async () => {
                        const tx = await this.connection.getTransaction(logs.signature, {
                            maxSupportedTransactionVersion: 0,
                            commitment: 'confirmed'
                        });
                        if (!tx) throw new Error("Transaction not found");
                        return tx;
                    }
                );

                if (tx.meta?.err && ignoreErrors) return;

                const encodedIxs = tx.transaction.message.compiledInstructions;
                const coder = new BorshInstructionCoder(IDL);
                for (const ix of encodedIxs) {
                    try {
                        const quartzIx = coder.decode(Buffer.from(ix.data), "base58");
                        if (quartzIx?.name.toLowerCase() === instructionName.toLowerCase()) {
                            const accountKeys = tx.transaction.message.staticAccountKeys;
                            onInstruction(tx, ix, accountKeys);
                        }
                    } catch { }
                }
            },
            "confirmed"
        )
    }

    public static async parseSpendIx(
        connection: Connection,
        signature: string,
        owner: PublicKey
    ): Promise<PublicKey> {
        const INSRTUCTION_NAME = "CompleteSpend";
        const ACCOUNT_INDEX_OWNER = 1;
        const ACCOUNT_INDEX_MESSAGE_SENT_EVENT_DATA = 12;

        const tx = await retryWithBackoff(
            async () => {
                const tx = await connection.getTransaction(signature, {
                    maxSupportedTransactionVersion: 0,
                    commitment: "finalized"
                });
                if (!tx) throw new Error("Transaction not found");
                return tx;
            }
        );

        const encodedIxs = tx.transaction.message.compiledInstructions;
        const coder = new BorshInstructionCoder(IDL);

        for (const ix of encodedIxs) {
            try {
                const quartzIx = coder.decode(Buffer.from(ix.data), "base58");
                if (quartzIx?.name.toLowerCase() === INSRTUCTION_NAME.toLowerCase()) {
                    const accountKeys = tx.transaction.message.staticAccountKeys;

                    const ownerIndex = ix.accountKeyIndexes?.[ACCOUNT_INDEX_OWNER];
                    if (ownerIndex === undefined || accountKeys[ownerIndex] === undefined) {
                        throw new Error("Owner not found");
                    }

                    const actualOwner = accountKeys[ownerIndex];
                    if (!actualOwner.equals(owner)) throw new Error("Owner does not match");


                    const messageSentEventDataIndex = ix.accountKeyIndexes?.[ACCOUNT_INDEX_MESSAGE_SENT_EVENT_DATA];
                    if (messageSentEventDataIndex === undefined || accountKeys[messageSentEventDataIndex] === undefined) {
                        throw new Error("Message sent event data not found");
                    }
                    return accountKeys[messageSentEventDataIndex];
                }
            } catch { }
        }

        throw new Error("Spend instruction not found");
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
        spendLimitPerTransaction: BN,
        spendLimitPerTimeframe: BN,
        timeframeInSeconds: BN,
        nextTimeframeResetTimestamp: BN
    ): Promise<{
        ixs: TransactionInstruction[],
        lookupTables: AddressLookupTableAccount[],
        signers: Keypair[]
    }> {
        const vault = getVaultPublicKey(owner);

        const ix_initUser = await this.program.methods
            .initUser(
                spendLimitPerTransaction,
                spendLimitPerTimeframe,
                timeframeInSeconds,
                nextTimeframeResetTimestamp
            )
            .accounts({
                vault: vault,
                owner: owner,
                initRentPayer: getInitRentPayerPublicKey(),
                driftUser: getDriftUserPublicKey(vault),
                driftUserStats: getDriftUserStatsPublicKey(vault),
                driftState: getDriftStatePublicKey(),
                driftProgram: DRIFT_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY,
                systemProgram: SystemProgram.programId,
            })
            .instruction();

        return {
            ixs: [ix_initUser],
            lookupTables: [this.quartzLookupTable],
            signers: []
        };
    }

    public admin = {
        makeReclaimBridgeRentIxs: async (
            messageSentEventData: PublicKey,
            attestation: Buffer<ArrayBuffer>,
            rentReclaimer: Signer
        ): Promise<{
            ixs: TransactionInstruction[],
            lookupTables: AddressLookupTableAccount[],
            signers: Signer[]
        }> => {
            const ix_reclaimBridgeRent = await this.program.methods
                .reclaimBridgeRent(attestation)
                .accounts({
                    rentReclaimer: rentReclaimer.publicKey,
                    bridgeRentPayer: getBridgeRentPayerPublicKey(),
                    messageTransmitter: getMessageTransmitter(),
                    messageSentEventData: messageSentEventData,
                    cctpMessageTransmitter: MESSAGE_TRANSMITTER_PROGRAM_ID
                })
                .instruction();

            return {
                ixs: [ix_reclaimBridgeRent],
                lookupTables: [this.quartzLookupTable],
                signers: [rentReclaimer]
            };
        }
    }
}