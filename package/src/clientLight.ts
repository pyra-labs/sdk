import { AnchorProvider, Program, setProvider } from "@coral-xyz/anchor";
import type { Connection, TransactionInstruction } from "@solana/web3.js";
import { IDL, type Quartz } from "./types/idl/quartz.js";
import type { AddressLookupTableAccount } from "@solana/web3.js";
import type { PublicKey } from "@solana/web3.js";
import { getDriftUserPublicKey, getVaultPublicKey, getDriftUserStatsPublicKey, getDriftStatePublicKey, getPythPriceFeedAccount } from "./utils/helpers.js";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { QuartzUserLight } from "./userLight.js";
import { DummyWallet } from "./types/classes/dummyWallet.class.js";
import { QUARTZ_PROGRAM_ID, DRIFT_PROGRAM_ID, QUARTZ_ADDRESS_TABLE } from "./config/constants.js";

export class QuartzClientLight {
    protected connection: Connection;
    protected program: Program<Quartz>;
    protected quartzLookupTable: AddressLookupTableAccount;
    protected oracles: Map<string, PublicKey>;

    constructor(
        connection: Connection,
        program: Program<Quartz>,
        quartzAddressTable: AddressLookupTableAccount,
        oracles: Map<string, PublicKey>
    ) {
        this.connection = connection;
        this.program = program;
        this.quartzLookupTable = quartzAddressTable;
        this.oracles = oracles;
    }

    public static async fetchClientLight(
        connection: Connection
    ) {
        const wallet = new DummyWallet(Keypair.generate());

        const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
        setProvider(provider);
        const program = new Program(IDL, QUARTZ_PROGRAM_ID, provider) as unknown as Program<Quartz>;

        const quartzLookupTable = await connection.getAddressLookupTable(QUARTZ_ADDRESS_TABLE).then((res) => res.value);
        if (!quartzLookupTable) throw Error("Address Lookup Table account not found");

        const oracles = await QuartzClientLight.fetchOracles();

        return new QuartzClientLight(
            connection, 
            program, 
            quartzLookupTable, 
            oracles
        );
    }

    protected static async fetchOracles() {
        const oracles = new Map<string, PublicKey>([
            ["SOL/USD", getPythPriceFeedAccount(0, 
                "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d")],
            ["USDC/USD", getPythPriceFeedAccount(0, 
                "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a")]
        ]);
        return oracles;
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

    public getQuartzAccountLight(pubkey: PublicKey): QuartzUserLight {
        return new QuartzUserLight(
            pubkey,
            this.connection,
            this.program,
            this.quartzLookupTable,
            this.oracles
        );
    }
}
