import { AddressLookupTableAccount, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { DriftClient, QuoteResponse, UserAccount } from "@drift-labs/sdk";
import { Connection } from "@solana/web3.js";
import { Quartz } from "./types/quartz";
import { Program } from "@coral-xyz/anchor";
export declare class QuartzUser {
    readonly pubkey: PublicKey;
    readonly vaultPubkey: PublicKey;
    private connection;
    private program;
    private quartzLookupTable;
    private oracles;
    private driftClient;
    private driftUser;
    constructor(pubkey: PublicKey, connection: Connection, program: Program<Quartz>, quartzLookupTable: AddressLookupTableAccount, oracles: Map<string, PublicKey>, driftClient: DriftClient, driftUserAccount?: UserAccount);
    private convertToQuartzHealth;
    getHealth(): number;
    getRepayAmountForTargetHealth(targetHealth: number, repayCollateralWeight: number): number;
    getTotalWeightedCollateral(): number;
    getMaintenanceMarginRequirement(): number;
    makeCollateralRepayIxs(caller: PublicKey, callerDepositSpl: PublicKey, callerWithdrawSpl: PublicKey, callerStartingDepositBalance: number, jupiterExactOutRouteQuote: QuoteResponse): Promise<{
        ixs: TransactionInstruction[];
        lookupTables: AddressLookupTableAccount[];
    }>;
}
