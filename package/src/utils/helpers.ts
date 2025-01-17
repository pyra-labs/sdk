import { ComputeBudgetProgram, type Connection, type PublicKey, type TransactionInstruction, } from "@solana/web3.js";
import type { AccountMeta } from "../types/interfaces/accountMeta.interface.js";
import { type MarketIndex, TOKENS } from "../config/tokens.js";
import { createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";

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

export const getTokenProgram = async (connection: Connection, mint: PublicKey) => {
    const mintAccount = await connection.getAccountInfo(mint);
    return mintAccount?.owner || TOKEN_PROGRAM_ID;
}

export async function makeCreateAtaIxIfNeeded(
    connection: Connection,
    ata: PublicKey,
    authority: PublicKey,
    mint: PublicKey,
    tokenProgramId: PublicKey
) {
    const oix_createAta: TransactionInstruction[] = [];
    const ataInfo = await connection.getAccountInfo(ata);
    if (ataInfo === null) {
        oix_createAta.push(
            createAssociatedTokenAccountInstruction(
                authority,
                ata,
                authority,
                mint,
                tokenProgramId
            )
        );
    }
    return oix_createAta;
}

export function baseUnitToDecimal(baseUnits: number, marketIndex: MarketIndex): number {
    const token = TOKENS[marketIndex];
    return baseUnits / (10 ** token.decimalPrecision.toNumber());
}

export function decimalToBaseUnit(decimal: number, marketIndex: MarketIndex): number {
    const token = TOKENS[marketIndex];
    return Math.trunc(decimal * (10 ** token.decimalPrecision.toNumber()));
}
