import type { PublicKey } from "@solana/web3.js";

export interface AccountMeta {
  pubkey: PublicKey;
  isSigner: boolean;
  isWritable: boolean;
}
