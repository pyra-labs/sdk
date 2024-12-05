import type { PublicKey, Connection, TransactionInstruction } from "@solana/web3.js";
import type { QuoteResponse } from "@jup-ag/api";
import type { AddressLookupTableAccount } from "@solana/web3.js";
export declare function getJupiterSwapIx(walletPubkey: PublicKey, connection: Connection, quoteResponse: QuoteResponse): Promise<{
    ix_jupiterSwap: TransactionInstruction;
    jupiterLookupTables: AddressLookupTableAccount[];
}>;
