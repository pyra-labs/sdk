
import type BN from "bn.js";
import type { TimeLocked } from "../interfaces/TimeLock.interface.js";
import type { PublicKey } from "@solana/web3.js";

export interface SpendLimitsOrder extends TimeLocked {
    spendLimitPerTransaction: BN;
    spendLimitPerTimeframe: BN;
    timeframeInSeconds: BN;
    nextTimeframeResetTimestamp: BN;
}

export interface SpendLimitsOrderAccount {
    publicKey: PublicKey;
    account: SpendLimitsOrder;
}