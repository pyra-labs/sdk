import { QUARTZ_ADDRESS_TABLE, QUARTZ_PROGRAM_ID } from "./config/constants";
import quartzIdl from "./idl/quartz.json";
import { Quartz } from "./types/quartz.js";
import { AnchorProvider, Idl, Program, setProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, AddressLookupTableAccount } from "@solana/web3.js";

class QuartzClient {
    private connection: Connection;
    private wallet: Wallet;
    private program: Program<Quartz>;
    private quartzAddressTable: AddressLookupTableAccount;

    constructor(
        connection: Connection,
        wallet: Wallet,
        program: Program<Quartz>,
        quartzAddressTable: AddressLookupTableAccount
    ) {
        this.connection = connection;
        this.wallet = wallet;
        this.program = program;
        this.quartzAddressTable = quartzAddressTable;
    }

    static async initialize(
        connection: Connection, 
        wallet: Wallet
    ) {
        const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
        setProvider(provider);
        const program = new Program(quartzIdl as Idl, QUARTZ_PROGRAM_ID, provider) as unknown as Program<Quartz>;

        const quartzLookupTable = await connection.getAddressLookupTable(QUARTZ_ADDRESS_TABLE).then((res) => res.value);
        if (!quartzLookupTable) throw Error("Address Lookup Table account not found");

        return new QuartzClient(
            connection, 
            wallet, 
            program, 
            quartzLookupTable
        );
    }
}