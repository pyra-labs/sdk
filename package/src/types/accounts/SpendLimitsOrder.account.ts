
import type BN from "bn.js";
import type { TimeLock } from "../interfaces/TimeLock.interface.js";

export interface SpendLimitsOrder {
    timeLock: TimeLock;
    spendLimitPerTransaction: BN;
    spendLimitPerTimeframe: BN;
    timeframeInSeconds: BN;
    nextTimeframeResetTimestamp: BN;
}