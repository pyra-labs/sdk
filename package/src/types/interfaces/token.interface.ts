import type { PublicKey } from "@solana/web3.js";

export interface Token {
    name: string;
    mint: PublicKey;
    pythPriceFeedId: string;
    decimalPrecision: number;
}