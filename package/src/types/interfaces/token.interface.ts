import type { PublicKey } from "@solana/web3.js";

export interface Token {
    marketIndex: number;
    mint: PublicKey;
    pythPriceFeedId: string;
    driftSpotMarket: PublicKey;
    driftOracle: PublicKey;
}