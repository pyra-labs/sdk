import type { DriftClient } from "@drift-labs/sdk";
import { fetchUserAccountsUsingKeys as fetchDriftAccountsUsingKeys } from "@drift-labs/sdk";
import { QUARTZ_ADDRESS_TABLE, QUARTZ_PROGRAM_ID } from "./config/constants.js";
import quartzIdl from "./idl/quartz.json" with { type: "json" };
import type { Quartz } from "./types/quartz.js";
import { AnchorProvider, BorshInstructionCoder, Program, setProvider } from "@coral-xyz/anchor";
import type { Idl, Wallet } from "@coral-xyz/anchor";
import type { PublicKey, Connection, AddressLookupTableAccount, MessageCompiledInstruction, Logs } from "@solana/web3.js";
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";
import { QuartzUser } from "./user.js";
import { getDriftUserPublicKey, getVaultPublicKey } from "./utils/helpers.js";
import { DriftClientService } from "./services/driftClientService.js";

export class QuartzClient {
    private connection: Connection;
    private wallet: Wallet;
    private program: Program<Quartz>;
    private quartzLookupTable: AddressLookupTableAccount;

    private driftClient: DriftClient;
    private oracles: Map<string, PublicKey>;

    constructor(
        connection: Connection,
        wallet: Wallet,
        program: Program<Quartz>,
        quartzAddressTable: AddressLookupTableAccount,
        driftClient: DriftClient,
        oracles: Map<string, PublicKey>
    ) {
        this.connection = connection;
        this.wallet = wallet;
        this.program = program;
        this.quartzLookupTable = quartzAddressTable;
        this.driftClient = driftClient;
        this.oracles = oracles;
    }

    static async fetchClient(
        connection: Connection, 
        wallet: Wallet
    ) {
        const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
        setProvider(provider);
        const program = new Program(quartzIdl as Idl, QUARTZ_PROGRAM_ID, provider) as unknown as Program<Quartz>;

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
            wallet, 
            program, 
            quartzLookupTable,
            driftClient,
            oracles
        );
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
            vault, 
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
            if (vaults[index] === undefined) throw Error("Missing pubkey in vaults array");
            return new QuartzUser(
                vaults[index], 
                this.connection, 
                this.program, 
                this.quartzLookupTable, 
                this.oracles, 
                this.driftClient,
                driftUser
            )
        });
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
                const coder = new BorshInstructionCoder(quartzIdl as Idl);
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
