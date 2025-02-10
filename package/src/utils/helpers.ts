import { ComputeBudgetProgram, PublicKey, type Connection, type TransactionInstruction, } from "@solana/web3.js";
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
    const mintAccount = await retryWithBackoff(
        () => connection.getAccountInfo(mint),
        3
    );
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
    const ataInfo = await retryWithBackoff(
        () => connection.getAccountInfo(ata),
        3
    );
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

export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries = 5,
    initialDelay = 1_000,
    retryCallback?: (error: unknown, delayMs: number) => void,
) {
    let lastError = new Error("Unknown error");
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (error) {
            const delay = initialDelay * (2 ** i);
            lastError = (error instanceof Error) 
                ? error 
                : new Error(String(error));

            if (retryCallback) {
                retryCallback(lastError, delay);
            }

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}

export function evmAddressToSolana(evmAddress: string) {
    const bytes32 = `0x000000000000000000000000${evmAddress.replace("0x", "")}`;
    
    const bytes = new Uint8Array((bytes32.length - 2) / 2);
    let offset = 2;
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Number.parseInt(bytes32.substring(offset, offset + 2), 16);
        offset += 2;
    }
    
    return new PublicKey(bytes);
}