export type { BN } from "@coral-xyz/anchor";
export { QuartzClient } from "./client.js";
export { QuartzUser } from "./user.js";
export * from "./config/constants.js";
export * from "./utils/helpers.js";

import { Wallet } from "@coral-xyz/anchor";
export type { Wallet };

import type { Keypair } from "@solana/web3.js";
export const getWallet = (keypair: Keypair) => {
    if (typeof window === "undefined") {
        const wallet = new Wallet(keypair);
        return wallet;
    }
    throw new Error("NodeWallet is not available in Node.js environment");
}