import { ComputeBudgetProgram, PublicKey, type Connection, type TransactionInstruction, } from "@solana/web3.js";
import type { AccountMeta } from "../types/interfaces/AccountMeta.interface.js";
import { getMarketIndicesRecord, MarketIndex, TOKENS } from "../config/tokens.js";
import { createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { AddressLookupTableAccount } from "@solana/web3.js";
import { VersionedTransaction } from "@solana/web3.js";
import { TransactionMessage } from "@solana/web3.js";
import { type BN, DEFAULT_COMPUTE_UNIT_LIMIT, DEFAULT_COMPUTE_UNIT_PRICE, ZERO, type WithdrawOrder } from "../index.browser.js";
import type { PythResponse } from "../types/interfaces/PythResponse.interface.js";

export async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getComputeUnitLimit(
    connection: Connection,
    instructions: TransactionInstruction[],
    address: PublicKey,
    blockhash: string,
    lookupTables: AddressLookupTableAccount[] = []
) {
    const messageV0 = new TransactionMessage({
        payerKey: address,
        recentBlockhash: blockhash,
        instructions: [...instructions]
    }).compileToV0Message(lookupTables);
    const simulation = await connection.simulateTransaction(
        new VersionedTransaction(messageV0)
    );

    const estimatedComputeUnits = simulation.value.unitsConsumed;
    if (!estimatedComputeUnits) console.log("Could not simulate for CUs, using default limit");
    const computeUnitLimit = estimatedComputeUnits
        ? Math.ceil(estimatedComputeUnits * 1.5)
        : DEFAULT_COMPUTE_UNIT_LIMIT;
    return computeUnitLimit;
}

export async function getComputerUnitLimitIx(
    connection: Connection,
    instructions: TransactionInstruction[],
    address: PublicKey,
    blockhash: string,
    lookupTables: AddressLookupTableAccount[] = []
) {
    const computeUnitLimit = await getComputeUnitLimit(connection, instructions, address, blockhash, lookupTables);
    return ComputeBudgetProgram.setComputeUnitLimit({
        units: computeUnitLimit,
    });
}

export async function getComputeUnitPrice(connection: Connection, instructions: TransactionInstruction[]) {
    const accounts = instructions.flatMap(instruction => instruction.keys);
    const writeableAccounts = accounts.filter(account => account.isWritable).map(account => account.pubkey);
    const recentFees = await connection.getRecentPrioritizationFees({
        lockedWritableAccounts: writeableAccounts
    }).then(fees => fees.map(fee => fee.prioritizationFee));

    if (recentFees.length === 0) return DEFAULT_COMPUTE_UNIT_PRICE;

    const positiveFees = recentFees.filter(fee => fee > 0);
    const sortedFees = [...positiveFees].sort((a, b) => a - b);

    // Calculate Q1 and Q3
    const q1Index = Math.floor(sortedFees.length * 0.25);
    const q3Index = Math.floor(sortedFees.length * 0.75);
    const q1 = sortedFees[q1Index];
    const q3 = sortedFees[q3Index];
    if (q1 === undefined || q3 === undefined) return Math.min(...recentFees);

    // Calculate IQR and bounds
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    // Filter out outliers and calculate average
    const filteredFees = sortedFees.filter(fee => fee >= lowerBound && fee <= upperBound);
    const average = filteredFees.reduce((sum, fee) => sum + fee, 0) / filteredFees.length;

    return Math.ceil(average);
};

export async function getComputeUnitPriceIx(connection: Connection, instructions: TransactionInstruction[]) {
    const computeUnitPrice = await getComputeUnitPrice(connection, instructions);
    return ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: computeUnitPrice,
    });
}

export async function buildTransaction(
    connection: Connection,
    instructions: TransactionInstruction[],
    payer: PublicKey,
    lookupTables: AddressLookupTableAccount[] = []
): Promise<VersionedTransaction> {
    const blockhash = (await connection.getLatestBlockhash()).blockhash;
    const ix_computeLimit = await getComputerUnitLimitIx(connection, instructions, payer, blockhash, lookupTables);
    const ix_computePrice = await getComputeUnitPriceIx(connection, instructions);

    const messageV0 = new TransactionMessage({
        payerKey: payer,
        recentBlockhash: blockhash,
        instructions: [
            ix_computeLimit,
            ix_computePrice,
            ...instructions
        ]
    }).compileToV0Message(lookupTables);
    const transaction = new VersionedTransaction(messageV0);
    return transaction;
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

export function isMarketIndex(index: number): boolean {
    const marketIndex = index as MarketIndex;
    return Object.values(MarketIndex).includes(marketIndex);
}

export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries = 5,
    initialDelay = 1_000,
    retryCallback?: (error: unknown, delayMs: number) => void,
) {
    let lastError: unknown = new Error("Unknown error");
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (error) {
            const delay = initialDelay * (2 ** i);
            lastError = error;

            if (retryCallback) {
                retryCallback(error, delay);
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

export function calculateWithdrawOrderBalances(
    withdrawOrders: WithdrawOrder[]
): Record<MarketIndex, BN> {
    const openOrdersBalance = getMarketIndicesRecord(ZERO);

    for (const order of withdrawOrders) {
        const marketIndex = order.driftMarketIndex.toNumber() as MarketIndex;
        if (!isMarketIndex(marketIndex)) {
            throw new Error(`Invalid market index: ${marketIndex}`);
        }

        openOrdersBalance[marketIndex] = openOrdersBalance[marketIndex]
            .add(order.amountBaseUnits);
    }

    return openOrdersBalance;
}

export async function getPrices(): Promise<Record<MarketIndex, number>> {
    try {
        return await getPricesPyth();
    } catch {
        try {
            return await getPricesCoinGecko();
        } catch {
            throw new Error("Failed to fetch prices from main (Pyth) and backup (CoinGecko) sources");
        }
    }
}

async function getPricesPyth(): Promise<Record<MarketIndex, number>> {
    const pythPriceFeedIdParams = MarketIndex.map(index => `ids%5B%5D=${TOKENS[index].pythPriceFeedId}`);
    const endpoint = `https://hermes.pyth.network/v2/updates/price/latest?${pythPriceFeedIdParams.join("&")}`;
    const reponse = await fetch(endpoint);
    if (!reponse.ok) throw new Error("Failed to fetch prices");
    const body = await reponse.json() as PythResponse;
    const pricesData = body.parsed;

    const prices = {} as Record<MarketIndex, number>;
    for (const index of MarketIndex) {
        prices[index] = 0;
    }
    
    for (const priceData of pricesData) {
        const marketIndex = MarketIndex.find(index => TOKENS[index].pythPriceFeedId.slice(2) === priceData.id);
        if (marketIndex === undefined) continue;

        const price = Number(priceData.price.price) * (10 ** priceData.price.expo);
        prices[marketIndex] = price;
    }

    return prices;
}

async function getPricesCoinGecko(): Promise<Record<MarketIndex, number>> {
    const coinGeckoIdParams = MarketIndex.map(index => TOKENS[index].coingeckoPriceId).join(",");
    const endpoint = `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIdParams}&vs_currencies=usd`;
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Failed to fetch prices");
    const body = await response.json() as Record<string, { usd: number }>;
    
    const prices = {} as Record<MarketIndex, number>;
    for (const index of MarketIndex) {
        prices[index] = 0;
    }

    for (const id of Object.keys(body)) {
        const marketIndex = MarketIndex.find(index => TOKENS[index].coingeckoPriceId === id);
        if (marketIndex === undefined) continue;

        const value = body[id];
        if (value === undefined) continue;

        prices[marketIndex] = value.usd;
    }

    return prices;
}
