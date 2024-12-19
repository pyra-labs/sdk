import type { DriftClient } from "@drift-labs/sdk";
import { calculateBorrowRate, calculateDepositRate, DRIFT_PROGRAM_ID, fetchUserAccountsUsingKeys as fetchDriftAccountsUsingKeys } from "@drift-labs/sdk";
import { QUARTZ_ADDRESS_TABLE, QUARTZ_PROGRAM_ID } from "./config/constants.js";
import { IDL, type Quartz } from "./types/idl/quartz.js";
import { AnchorProvider, BorshInstructionCoder, Program, setProvider } from "@coral-xyz/anchor";
import type { PublicKey, Connection, AddressLookupTableAccount, MessageCompiledInstruction, Logs, TransactionInstruction } from "@solana/web3.js";
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";
import { QuartzUser } from "./user.js";
import { getDriftStatePublicKey, getDriftUserPublicKey, getDriftUserStatsPublicKey, getVaultPublicKey } from "./utils/helpers.js";
import { DriftClientService } from "./services/driftClientService.js";
import { Keypair, SystemProgram, SYSVAR_RENT_PUBKEY, } from "@solana/web3.js";
import { DummyWallet } from "./types/classes/dummyWallet.class.js";

export class QuartzClient {
    private connection: Connection;
    private program: Program<Quartz>;
    private quartzLookupTable: AddressLookupTableAccount;

    private driftClient: DriftClient;
    private oracles: Map<string, PublicKey>;

    constructor(
        connection: Connection,
        program: Program<Quartz>,
        quartzAddressTable: AddressLookupTableAccount,
        driftClient: DriftClient,
        oracles: Map<string, PublicKey>
    ) {
        this.connection = connection;
        this.program = program;
        this.quartzLookupTable = quartzAddressTable;
        this.driftClient = driftClient;
        this.oracles = oracles;
    }

    static async fetchClient(
        connection: Connection
    ) {
        const wallet = new DummyWallet(Keypair.generate());

        const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
        setProvider(provider);
        const program = new Program(IDL, QUARTZ_PROGRAM_ID, provider) as unknown as Program<Quartz>;

        const quartzLookupTable = await connection.getAddressLookupTable(QUARTZ_ADDRESS_TABLE).then((res) => res.value);
        if (!quartzLookupTable) throw Error("Address Lookup Table account not found");

        const driftClient = await DriftClientService.getDriftClient(connection);

        const pythSolanaReceiver = new PythSolanaReceiver({ connection, wallet });
        const oracles = new Map<string, PublicKey>([
            ["SOL/USD", pythSolanaReceiver.getPriceFeedAccountAddress(0, 
                "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d")],
            ["USDC/USD", pythSolanaReceiver.getPriceFeedAccountAddress(0, 
                "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a")]
        ]);

        return new QuartzClient(
            connection, 
            program, 
            quartzLookupTable,
            driftClient,
            oracles
        );
    }

    public async makeInitQuartzUserIxs(owner: PublicKey): Promise<TransactionInstruction[]> {
        const vault = getVaultPublicKey(owner);
        const ix_initUser = await this.program.methods
            .initUser()
            .accounts({
                vault: vault,
                owner: owner,
                systemProgram: SystemProgram.programId,
            })
            .instruction();

        const ix_initVaultDriftAccount = await this.program.methods
            .initDriftAccount()
            .accounts({
                vault: vault,
                owner: owner,
                driftUser: getDriftUserPublicKey(vault),
                driftUserStats: getDriftUserStatsPublicKey(vault),
                driftState: getDriftStatePublicKey(),
                driftProgram: DRIFT_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY,
                systemProgram: SystemProgram.programId,
            })
            .instruction(); 

        return [ix_initUser, ix_initVaultDriftAccount];
    }

    public async getAllQuartzAccountOwnerPubkeys(): Promise<PublicKey[]> {
        return (
            await this.program.account.vault.all()
        ).map((vault) => vault.account.owner);
    }

    public async getQuartzAccount(owner: PublicKey): Promise<QuartzUser> {
        const vault = getVaultPublicKey(owner);
        await this.program.account.vault.fetch(vault); // Check account exists

        const [ driftUserAccount ] = await fetchDriftAccountsUsingKeys(
            this.connection,
            this.driftClient.program,
            [getDriftUserPublicKey(vault)]
        );
        if (!driftUserAccount) throw Error("Drift user not found");

        return new QuartzUser(
            owner, 
            this.connection, 
            this.program, 
            this.quartzLookupTable, 
            this.oracles, 
            this.driftClient,
            driftUserAccount
        );
    }

    public async getMultipleQuartzAccounts(owners: PublicKey[]): Promise<(QuartzUser | null)[]> {
        if (owners.length === 0) return [];
        const vaults = owners.map((owner) => getVaultPublicKey(owner));
        const accounts = await this.program.account.vault.fetchMultiple(vaults);

        accounts.forEach((account, index) => {
            if (account === null) throw Error(`Account not found for pubkey: ${vaults[index]?.toBase58()}`)
        });

        const driftUsers = await fetchDriftAccountsUsingKeys(
            this.connection,
            this.driftClient.program,
            vaults.map((vault) => getDriftUserPublicKey(vault))
        )

        // TODO: Uncomment once Drift accounts are guaranteed
        // const undefinedIndex = driftUsers.findIndex(user => !user);
        // if (undefinedIndex !== -1) {
        //     throw new Error(`[${this.wallet?.publicKey}] Failed to fetch drift user for vault ${vaults[undefinedIndex].toBase58()}`);
        // }

        return driftUsers.map((driftUser, index) => {
            if (driftUser === undefined) return null;
            if (owners[index] === undefined) throw Error("Missing pubkey in owners array");
            return new QuartzUser(
                owners[index], 
                this.connection, 
                this.program, 
                this.quartzLookupTable, 
                this.oracles, 
                this.driftClient,
                driftUser
            )
        });
    }

    public async getDepositRate(spotMarketIndex: number) {
        const spotMarket = await this.getSpotMarketAccount(spotMarketIndex);
        const depositRate = calculateDepositRate(spotMarket);
        return depositRate;
    }

    public async getBorrowRate(spotMarketIndex: number) {
        const spotMarket = await this.getSpotMarketAccount(spotMarketIndex);
        const borrowRate = calculateBorrowRate(spotMarket);
        return borrowRate;
    }

    private async getSpotMarketAccount(spotMarketIndex: number) {
        const spotMarket = await this.driftClient.getSpotMarketAccount(spotMarketIndex);
        if (!spotMarket) throw Error("Spot market not found");
        return spotMarket;
    }

    public async listenForInstruction(
        instructionName: string,
        onInstruction: (instruction: MessageCompiledInstruction, accountKeys: PublicKey[]) => void
    ) {
        this.connection.onLogs(
            QUARTZ_PROGRAM_ID,
            async (logs: Logs) => {
                if (!logs.logs.some(log => log.includes(instructionName))) return;

                const tx = await this.connection.getTransaction(logs.signature, {
                    maxSupportedTransactionVersion: 0,
                    commitment: 'confirmed'
                });
                if (!tx) throw new Error("Transaction not found"); 

                const encodedIxs = tx.transaction.message.compiledInstructions;
                const coder = new BorshInstructionCoder(IDL);
                for (const ix of encodedIxs) {
                    try {
                        const quartzIx = coder.decode(Buffer.from(ix.data), "base58");
                        if (quartzIx?.name.toLowerCase() === instructionName.toLowerCase()) {
                            const accountKeys = tx.transaction.message.staticAccountKeys;
                            onInstruction(ix, accountKeys);
                        }
                    } catch { }
                }
            },
            "confirmed"
        )
    }
}
