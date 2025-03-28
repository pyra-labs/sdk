
import type BN from "bn.js";
import type { TimeLocked } from "../interfaces/TimeLock.interface.js";

export interface WithdrawOrder extends TimeLocked {
    amountBaseUnits: BN;
    driftMarketIndex: BN;
    reduceOnly: boolean;
}