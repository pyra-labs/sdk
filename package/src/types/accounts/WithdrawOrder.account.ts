
import type BN from "bn.js";
import type { TimeLocked } from "../interfaces/TimeLock.interface.js";
import type { PublicKey } from "@solana/web3.js";

export interface WithdrawOrder extends TimeLocked {
    amountBaseUnits: BN;
    driftMarketIndex: BN;
    reduceOnly: boolean;
}

export interface WithdrawOrderAccount {
    publicKey: PublicKey;
    account: WithdrawOrder;
}
