import type { PublicKey } from "@solana/web3.js";
export declare const getVaultPublicKey: (user: PublicKey) => PublicKey;
export declare const getVaultSplPublicKey: (user: PublicKey, mint: PublicKey) => PublicKey;
export declare const getDriftUserPublicKey: (vaultPda: PublicKey) => PublicKey;
export declare const getDriftUserStatsPublicKey: (vaultPda: PublicKey) => PublicKey;
export declare const getDriftStatePublicKey: () => PublicKey;
export declare const getDriftSpotMarketPublicKey: (marketIndex: number) => PublicKey;
export declare const toRemainingAccount: (pubkey: PublicKey, isWritable: boolean, isSigner: boolean) => {
    pubkey: PublicKey;
    isWritable: boolean;
    isSigner: boolean;
};
