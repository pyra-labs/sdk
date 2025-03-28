
import type BN from "bn.js";
import type { TimeLocked } from "../interfaces/TimeLock.interface.js";

export interface SpendLimitsOrder extends TimeLocked {
    spendLimitPerTransaction: BN;
    spendLimitPerTimeframe: BN;
    timeframeInSeconds: BN;
    nextTimeframeResetTimestamp: BN;
}