import type { PublicKey } from "@solana/web3.js";
import type BN from "bn.js";

export interface TimeLock {
    owner: PublicKey;
    isOwnerPayer: boolean;
    releaseSlot: BN;
}

export interface TimeLocked {
    timeLock: TimeLock;
}
