
import type BN from "bn.js";
import type { TimeLock } from "../interfaces/TimeLock.interface.js";

export interface WithdrawOrder {
    timeLock: TimeLock;
    amountBaseUnits: BN;
    driftMarketIndex: BN;
    reduceOnly: boolean;
}