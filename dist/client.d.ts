import { DriftClient } from "@drift-labs/sdk";
import { Quartz } from "./types/quartz.js";
import { Program, Wallet } from "@coral-xyz/anchor";
import { Connection, AddressLookupTableAccount } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { QuartzUser } from "./user";
export declare class QuartzClient {
    private connection;
    private wallet;
    private program;
    private quartzLookupTable;
    private driftClient;
    private oracles;
    constructor(connection: Connection, wallet: Wallet, program: Program<Quartz>, quartzAddressTable: AddressLookupTableAccount, driftClient: DriftClient, oracles: Map<string, PublicKey>);
    static initialize(connection: Connection, wallet: Wallet): Promise<QuartzClient>;
    getAllQuartzAccountPubkeys(): Promise<PublicKey[]>;
    getQuartzAccount(vault: PublicKey): Promise<QuartzUser>;
    getMultipleQuartzAccounts(vaults: PublicKey[]): Promise<(QuartzUser | null)[]>;
}
