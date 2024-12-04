import { PublicKey } from "@solana/web3.js";
import { QUARTZ_PROGRAM_ID } from "./config/constants";
import { BN } from "@coral-xyz/anchor";
import { DRIFT_PROGRAM_ID } from "@drift-labs/sdk";

export const getVaultPubkey = (owner: PublicKey) => {
    const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), owner.toBuffer()],
        QUARTZ_PROGRAM_ID
    )
    return vaultPda;
}

export const getVaultSplPubkey = (owner: PublicKey, mint: PublicKey) => {
    const vaultPda = getVaultPubkey(owner);
    const [vaultSplPda] = PublicKey.findProgramAddressSync(
        [vaultPda.toBuffer(), mint.toBuffer()],
        QUARTZ_PROGRAM_ID
    );
    return vaultSplPda;
}

export const getDriftUser = (vaultPda: PublicKey) => {
    const [userPda] = PublicKey.findProgramAddressSync(
        [
			Buffer.from("user"),
			vaultPda.toBuffer(),
			new BN(0).toArrayLike(Buffer, 'le', 2),
		],
		new PublicKey(DRIFT_PROGRAM_ID)
    );
    return userPda;
}