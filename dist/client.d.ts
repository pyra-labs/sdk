import type { DriftClient } from "@drift-labs/sdk";
import type { Quartz } from "./types/quartz.js";
import type { Program, Wallet } from "@coral-xyz/anchor";
import type { Connection, AddressLookupTableAccount } from "@solana/web3.js";
import type { PublicKey } from "@solana/web3.js";
import type { QuartzUser } from "./user";
export declare class QuartzClient {
    private connection;
    private wallet;
    private program;
    private quartzLookupTable;
    private driftClient;
    private oracles;
    constructor(connection: Connection, wallet: Wallet, program: Program<Quartz>, quartzAddressTable: AddressLookupTableAccount, driftClient: DriftClient, oracles: Map<string, PublicKey>);
    static fetchClient(connection: Connection, wallet: Wallet): Promise<QuartzClient>;
    getAllQuartzAccountOwnerPubkeys(): Promise<PublicKey[]>;
    getQuartzAccount(owner: PublicKey): Promise<QuartzUser>;
    getMultipleQuartzAccounts(owners: PublicKey[]): Promise<(QuartzUser | null)[]>;
}
