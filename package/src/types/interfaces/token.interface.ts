import type { PublicKey } from "@solana/web3.js";
import type { MarketIndex } from "../../config/tokens.js";

export interface Token {
    marketIndex: typeof MarketIndex[number];
    mint: PublicKey;
    pythPriceFeedId: string;
}