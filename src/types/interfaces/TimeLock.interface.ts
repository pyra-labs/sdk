import type { PublicKey } from "@solana/web3.js";
import type BN from "bn.js";

export interface TimeLock {
	owner: PublicKey;
	payer: PublicKey;
	releaseSlot: BN;
}

export interface TimeLocked {
	timeLock: TimeLock;
}
