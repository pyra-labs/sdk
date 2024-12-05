import { PublicKey, Connection, TransactionInstruction } from "@solana/web3.js";
import { QuoteResponse } from "@jup-ag/api";
import { AddressLookupTableAccount } from "@solana/web3.js";
export declare function getJupiterSwapIx(walletPubkey: PublicKey, connection: Connection, quoteResponse: QuoteResponse): Promise<{
    ix_jupiterSwap: TransactionInstruction;
    jupiterLookupTables: AddressLookupTableAccount[];
}>;
