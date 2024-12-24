import { AnchorProvider, Program, setProvider, type ProgramAccount } from "@coral-xyz/anchor";
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

    constructor(
        connection: Connection,
        program: Program<Quartz>,
        quartzAddressTable: AddressLookupTableAccount
    ) {
        this.connection = connection;
        this.program = program;
        this.quartzLookupTable = quartzAddressTable;
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

        return new QuartzClientLight(
            connection, 
            program, 
            quartzLookupTable
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

    public getQuartzAccountLight(pubkey: PublicKey): QuartzUserLight {
        return new QuartzUserLight(
            pubkey,
            this.connection,
            this.program,
            this.quartzLookupTable
        );
    }
}
