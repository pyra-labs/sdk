import { ComputeBudgetProgram, PublicKey, } from "@solana/web3.js";
import { QUARTZ_PROGRAM_ID, DRIFT_PROGRAM_ID, PYTH_ORACLE_PROGRAM_ID } from "../config/constants.js";
import { BN } from "bn.js";
import type { AccountMeta } from "../types/interfaces/accountMeta.interface.js";
import { type MarketIndex, TOKENS } from "../config/tokens.js";

export const getVaultPublicKey = (user: PublicKey) => {
    const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), user.toBuffer()],
        QUARTZ_PROGRAM_ID
    )
    return vaultPda;
}

export const getVaultSplPublicKey = (user: PublicKey, mint: PublicKey) => {
    const vaultPda = getVaultPublicKey(user);
    const [vaultSplPda] = PublicKey.findProgramAddressSync(
        [vaultPda.toBuffer(), mint.toBuffer()],
        QUARTZ_PROGRAM_ID
    );
    return vaultSplPda;
}

export const getDriftUserPublicKey = (vaultPda: PublicKey) => {
    const [userPda] = PublicKey.findProgramAddressSync(
        [
			Buffer.from("user"),
			vaultPda.toBuffer(),
			new BN(0).toArrayLike(Buffer, 'le', 2),
		],
		DRIFT_PROGRAM_ID
    );
    return userPda;
}

export const getDriftUserStatsPublicKey = (vaultPda: PublicKey) => {
    const [userStatsPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_stats"), vaultPda.toBuffer()],
        DRIFT_PROGRAM_ID
    );
    return userStatsPda;
}

export const getDriftStatePublicKey = () => {
    const [statePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("drift_state")],
        DRIFT_PROGRAM_ID
    );
    return statePda; 
}

export const getDriftSignerPublicKey = () => {
    const [signerPda] = PublicKey.findProgramAddressSync(
		[Buffer.from("drift_signer")],
		DRIFT_PROGRAM_ID
	);
    return signerPda;
}

export const getDriftSpotMarketVaultPublicKey = (marketIndex: number) => {
    const [spotMarketVaultPda] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("spot_market_vault"), 
            new BN(marketIndex).toArrayLike(Buffer, 'le', 2)    
        ],
        DRIFT_PROGRAM_ID
    );
    return spotMarketVaultPda;
}

export const getDriftSpotMarketPublicKey = (marketIndex: number) => {
    const [spotMarketPda] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("spot_market"), 
            new BN(marketIndex).toArrayLike(Buffer, 'le', 2)    
        ],
        DRIFT_PROGRAM_ID
    );
    return spotMarketPda;
}

export const getPythPriceFeedAccount = (shardId: number, priceFeedId: string) => {
    let priceFeedIdBuffer: Buffer;
    if (priceFeedId.startsWith("0x")) {
        priceFeedIdBuffer = Buffer.from(priceFeedId.slice(2), "hex");
    } else {
        priceFeedIdBuffer = Buffer.from(priceFeedId, "hex");
    }
    if (priceFeedIdBuffer.length !== 32) {
        throw new Error("Feed ID should be 32 bytes long");
    }
    const shardBuffer = Buffer.alloc(2);
    shardBuffer.writeUint16LE(shardId, 0);
    return PublicKey.findProgramAddressSync([shardBuffer, priceFeedIdBuffer], PYTH_ORACLE_PROGRAM_ID)[0];
}

export const getPythOracle = (marketIndex: MarketIndex) => {
    const priceFeedId = TOKENS[marketIndex].pythPriceFeedId;
    return getPythPriceFeedAccount(0, priceFeedId);
}

export const createPriorityFeeInstructions = async (computeBudget: number) => {
    const computeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: computeBudget,
    });

    const computePriceIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1_000_000, // TODO: Calculate priority fee based on tx accounts
    });
    return [computeLimitIx, computePriceIx];
}

export const toRemainingAccount = (pubkey: PublicKey, isSigner: boolean, isWritable: boolean): AccountMeta => {
    return {
        pubkey: pubkey,
        isSigner: isSigner,
        isWritable: isWritable,
    }
}
