export type { BN } from "@coral-xyz/anchor";
export { QuartzClient } from "./client.js";
export { QuartzUser } from "./user.js";
export * from "./config/constants.js";
export * from "./utils/helpers.js";

import type { Wallet } from "@coral-xyz/anchor/dist/cjs/provider.js";
export type { Wallet };

import { Wallet as NodeWallet } from "@coral-xyz/anchor/dist/cjs/index.js";
import type { Keypair } from "@solana/web3.js";
export const getWallet = (keypair: Keypair) => {
    if (typeof window === "undefined") {
        const wallet = new NodeWallet(keypair);
        return wallet;
    }
    throw new Error("NodeWallet is not available in Node.js environment");
}