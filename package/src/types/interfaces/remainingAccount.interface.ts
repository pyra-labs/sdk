import type { PublicKey } from "@solana/web3.js";

export interface RemainingAccount {
  pubkey: PublicKey;
  isSigner: boolean;
  isWritable: boolean;
}
