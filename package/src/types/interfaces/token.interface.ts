import type { PublicKey } from "@solana/web3.js";
import type BN from "bn.js";

export interface Token {
    name: string;
    mint: PublicKey;
    pythPriceFeedId: string;
    decimalPrecision: BN;
    driftCollateralWeight: BN;
}