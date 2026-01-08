import {
	ComputeBudgetProgram,
	PublicKey,
	type Connection,
	type TransactionInstruction,
} from "@solana/web3.js";
import type { AccountMeta } from "../types/interfaces/AccountMeta.interface.js";
import {
	getMarketIndicesRecord,
	MarketIndex,
	TOKENS,
} from "../config/tokens.js";
import {
	createAssociatedTokenAccountInstruction,
	TOKEN_2022_PROGRAM_ID,
	TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type { AddressLookupTableAccount } from "@solana/web3.js";
import { VersionedTransaction } from "@solana/web3.js";
import { TransactionMessage } from "@solana/web3.js";
import {
	BN,
	DEFAULT_COMPUTE_UNIT_LIMIT,
	DEFAULT_COMPUTE_UNIT_PRICE,
	ZERO,
	type WithdrawOrder,
} from "../index.browser.js";
import type { PythResponse } from "../types/interfaces/PythResponse.interface.js";
import { Keypair } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";
import {
	calculateAssetWeight,
	calculateLiabilityWeight,
	calculateLiveOracleTwap,
	FIVE_MINUTE,
	getSignedTokenAmount,
	getStrictTokenValue,
	getTokenAmount,
	getWorstCaseTokenAmounts,
	isSpotPositionAvailable,
	OPEN_ORDER_MARGIN_REQUIREMENT,
	QUOTE_SPOT_MARKET_INDEX,
	SPOT_MARKET_WEIGHT_PRECISION,
	StrictOraclePrice,
	type MarginCategory,
	type OraclePriceData,
	type SpotMarketAccount,
	type SpotPosition,
} from "@drift-labs/sdk";

export async function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getComputeUnitLimit(
	connection: Connection,
	instructions: TransactionInstruction[],
	address: PublicKey,
	blockhash: string,
	lookupTables: AddressLookupTableAccount[] = [],
) {
	const messageV0 = new TransactionMessage({
		payerKey: address,
		recentBlockhash: blockhash,
		instructions: [...instructions],
	}).compileToV0Message(lookupTables);
	const simulation = await connection.simulateTransaction(
		new VersionedTransaction(messageV0),
	);

	if (
		simulation.value.err ||
		simulation.value.unitsConsumed === undefined ||
		simulation.value.unitsConsumed === 0
	) {
		console.log("Could not simulate for CUs, using default limit");
		return DEFAULT_COMPUTE_UNIT_LIMIT;
	}

	const simulated = Math.ceil(simulation.value.unitsConsumed * 1.5);
	return Math.min(simulated, DEFAULT_COMPUTE_UNIT_LIMIT);
	// TODO: Figure out why simulation is so low sometimes, and change to a reasonable sanity check of 5k CUs
}

export async function getComputeUnitLimitIx(
	connection: Connection,
	instructions: TransactionInstruction[],
	address: PublicKey,
	blockhash: string,
	lookupTables: AddressLookupTableAccount[] = [],
) {
	const computeUnitLimit = await getComputeUnitLimit(
		connection,
		instructions,
		address,
		blockhash,
		lookupTables,
	);
	return ComputeBudgetProgram.setComputeUnitLimit({
		units: computeUnitLimit,
	});
}

export async function getComputeUnitPrice(
	connection: Connection,
	instructions: TransactionInstruction[],
) {
	const accounts = instructions.flatMap((instruction) => instruction.keys);
	const writeableAccounts = accounts
		.filter((account) => account.isWritable)
		.map((account) => account.pubkey);
	const recentFees = await connection
		.getRecentPrioritizationFees({
			lockedWritableAccounts: writeableAccounts,
		})
		.then((fees) => fees.map((fee) => fee.prioritizationFee));

	if (recentFees.length === 0) return DEFAULT_COMPUTE_UNIT_PRICE;

	const positiveFees = recentFees.filter((fee) => fee > 0);
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
	const filteredFees = sortedFees.filter(
		(fee) => fee >= lowerBound && fee <= upperBound,
	);
	const average =
		filteredFees.reduce((sum, fee) => sum + fee, 0) / filteredFees.length;

	return Math.ceil(average);
}

export async function getComputeUnitPriceIx(
	connection: Connection,
	instructions: TransactionInstruction[],
) {
	const computeUnitPrice = await getComputeUnitPrice(connection, instructions);
	return ComputeBudgetProgram.setComputeUnitPrice({
		microLamports: computeUnitPrice,
	});
}

export async function buildTransaction(
	connection: Connection,
	instructions: TransactionInstruction[],
	payer: PublicKey,
	lookupTables: AddressLookupTableAccount[] = [],
): Promise<{
	transaction: VersionedTransaction;
	gasLamports: number;
}> {
	const blockhash = (await connection.getLatestBlockhash()).blockhash;
	const computeUnitLimit = await getComputeUnitLimit(
		connection,
		instructions,
		payer,
		blockhash,
		lookupTables,
	);
	const ix_computeLimit = ComputeBudgetProgram.setComputeUnitLimit({
		units: computeUnitLimit,
	});

	const computeUnitPrice = await getComputeUnitPrice(connection, instructions);
	const ix_computePrice = ComputeBudgetProgram.setComputeUnitPrice({
		microLamports: computeUnitPrice,
	});

	const baseGasLamports = 5_000;
	const gasMicroLamports = computeUnitLimit * computeUnitPrice;
	const gasLamports = baseGasLamports + gasMicroLamports / 1_000_000;

	const messageV0 = new TransactionMessage({
		payerKey: payer,
		recentBlockhash: blockhash,
		instructions: [ix_computeLimit, ix_computePrice, ...instructions],
	}).compileToV0Message(lookupTables);
	const transaction = new VersionedTransaction(messageV0);
	return {
		transaction,
		gasLamports,
	};
}

export const toRemainingAccount = (
	pubkey: PublicKey,
	isSigner: boolean,
	isWritable: boolean,
): AccountMeta => {
	return {
		pubkey: pubkey,
		isSigner: isSigner,
		isWritable: isWritable,
	};
};

export const getTokenProgram = async (
	connection: Connection,
	mint: PublicKey,
) => {
	const mintAccount = await retryWithBackoff(
		() => connection.getAccountInfo(mint),
		3,
	);
	return mintAccount?.owner || TOKEN_PROGRAM_ID;
};

export async function makeCreateAtaIxIfNeeded(
	connection: Connection,
	ata: PublicKey,
	authority: PublicKey,
	mint: PublicKey,
	tokenProgramId: PublicKey,
	payer: PublicKey,
) {
	const oix_createAta: TransactionInstruction[] = [];
	const ataInfo = await retryWithBackoff(
		() => connection.getAccountInfo(ata),
		3,
	);
	if (ataInfo === null) {
		oix_createAta.push(
			createAssociatedTokenAccountInstruction(
				payer,
				ata,
				authority,
				mint,
				tokenProgramId,
			),
		);
	}
	return oix_createAta;
}

export function baseUnitToDecimal(
	baseUnits: number,
	marketIndex: MarketIndex,
): number {
	const token = TOKENS[marketIndex];
	return baseUnits / 10 ** token.decimalPrecision.toNumber();
}

export function decimalToBaseUnit(
	decimal: number,
	marketIndex: MarketIndex,
): number {
	const token = TOKENS[marketIndex];
	return Math.trunc(decimal * 10 ** token.decimalPrecision.toNumber());
}

export function isMarketIndex(index: number): boolean {
	if (Number.isNaN(index)) return false;

	const marketIndex = index as MarketIndex;
	return Object.values(MarketIndex).includes(marketIndex);
}

/**
 * Retries a function with exponential backoff, retries if an error is thrown.
 * @param fn - The function to retry.
 * @param retries - The number of retries, defaults to 5.
 * @param initialDelay - The initial delay in milliseconds, defaults to 1_000.
 * @param retryCallback - A callback function that is called on each retry.
 * @returns The result of the function.
 */
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
			const delay = initialDelay * 2 ** i;
			lastError = error;

			if (retryCallback) {
				retryCallback(error, delay);
			}

			await new Promise((resolve) => setTimeout(resolve, delay));
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
	withdrawOrders: WithdrawOrder[],
): Record<MarketIndex, BN> {
	const openOrdersBalance = getMarketIndicesRecord(ZERO);

	for (const order of withdrawOrders) {
		const marketIndex = order.driftMarketIndex.toNumber() as MarketIndex;
		if (!isMarketIndex(marketIndex)) {
			throw new Error(`Invalid market index: ${marketIndex}`);
		}

		openOrdersBalance[marketIndex] = openOrdersBalance[marketIndex].add(
			order.amountBaseUnits,
		);
	}

	return openOrdersBalance;
}

export async function getPrices(
	pythFirst = true,
	marketIndices: MarketIndex[] = [...MarketIndex],
): Promise<Record<MarketIndex, number>> {
	if (pythFirst) {
		try {
			return await getPricesPyth(marketIndices);
		} catch (pythError) {
			try {
				return await getPricesCoinGecko(marketIndices);
			} catch (coingeckoError) {
				throw new Error(
					`Failed to fetch prices from main (Pyth) and backup (CoinGecko) sources. Pyth error: ${pythError}, CoinGecko error: ${coingeckoError}`,
				);
			}
		}
	} else {
		try {
			return await getPricesCoinGecko(marketIndices);
		} catch (pythError) {
			try {
				return await getPricesPyth(marketIndices);
			} catch (coingeckoError) {
				throw new Error(
					`Failed to fetch prices from main (Pyth) and backup (CoinGecko) sources. Pyth error: ${pythError}, CoinGecko error: ${coingeckoError}`,
				);
			}
		}
	}
}

async function getPricesPyth(
	marketIndices: MarketIndex[] = [...MarketIndex],
): Promise<Record<MarketIndex, number>> {
	const pythPriceFeedIdParams = marketIndices.map(
		(index) => `ids%5B%5D=${TOKENS[index].pythPriceFeedId}`,
	);
	const endpoint = `https://hermes.pyth.network/v2/updates/price/latest?${pythPriceFeedIdParams.join("&")}`;
	const body = await fetchAndParse<PythResponse>(endpoint);
	const pricesData = body.parsed;

	const prices = {} as Record<MarketIndex, number>;
	for (const index of MarketIndex) {
		prices[index] = 0;
	}

	for (const priceData of pricesData) {
		const marketIndex = MarketIndex.find(
			(index) => TOKENS[index].pythPriceFeedId.slice(2) === priceData.id,
		);
		if (marketIndex === undefined) continue;

		const price = Number(priceData.price.price) * 10 ** priceData.price.expo;
		prices[marketIndex] = price;
	}

	return prices;
}

async function getPricesCoinGecko(
	marketIndices: MarketIndex[] = [...MarketIndex],
): Promise<Record<MarketIndex, number>> {
	const coinGeckoIdParams = marketIndices
		.map((index) => TOKENS[index].coingeckoPriceId)
		.join(",");
	const endpoint = `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIdParams}&vs_currencies=usd`;
	const body = await fetchAndParse<Record<string, { usd: number }>>(endpoint);

	const prices = {} as Record<MarketIndex, number>;
	for (const index of MarketIndex) {
		prices[index] = 0;
	}

	for (const id of Object.keys(body)) {
		const marketIndex = MarketIndex.find(
			(index) => TOKENS[index].coingeckoPriceId === id,
		);
		if (marketIndex === undefined) continue;

		const value = body[id];
		if (value === undefined) continue;

		prices[marketIndex] = value.usd;
	}

	return prices;
}

export async function getTokenAccountBalance(
	connection: Connection,
	tokenAccount: PublicKey,
) {
	const account = await retryWithBackoff(async () =>
		connection.getAccountInfo(tokenAccount),
	);
	if (account === null) return 0;

	const balance = await retryWithBackoff(async () =>
		connection.getTokenAccountBalance(tokenAccount),
	);
	return Number(balance.value.amount);
}

export async function fetchAndParse<T>(
	url: string,
	req?: RequestInit | undefined,
	retries = 0,
): Promise<T> {
	const response = await retryWithBackoff(async () => fetch(url, req), retries);

	if (!response.ok) {
		let body: any;
		try {
			body = await response.json();
		} catch {
			body = null;
		}
		throw new Error(
			`HTTP ${response.status} error fetching ${url}${body ? `: ${JSON.stringify(body)}` : ""}`,
		);
	}

	try {
		const body = await response.json();
		return body as T;
	} catch {
		return response as T;
	}
}

export function buildEndpointURL(
	baseEndpoint: string,
	params?: Record<string, string>,
) {
	if (!params) return baseEndpoint;

	const stringParams: Record<string, string> = {};
	for (const [key, value] of Object.entries(params)) {
		stringParams[key] = String(value);
	}
	const searchParams = new URLSearchParams(stringParams);
	return `${baseEndpoint}${params ? `?${searchParams.toString()}` : ""}`;
}

export function getMaxSwapSize(
	existingSpotPositions: number,
	isNewPosition: boolean,
	tokenProgramFrom: PublicKey,
	tokenProgramTo: PublicKey,
): {
	bytes: number;
	accounts: number;
} {
	const spotPositionCount = existingSpotPositions + (isNewPosition ? 1 : 0);

	// Get accounts used
	const BASE_ACCOUNTS = 32;
	const EXTRA_ACCOUNTS_PER_POSITION = 2; // Market and oracle

	const accountsUsed =
		BASE_ACCOUNTS + spotPositionCount * EXTRA_ACCOUNTS_PER_POSITION;

	// Get bytes used
	const BASE_SWAP_BYTES = 732;
	const EXTRA_BYTES_PER_POSITION = (1 + 2) * EXTRA_ACCOUNTS_PER_POSITION; // 1 Pyra refence, 2 Drift references, for the market and oracle

	let bytes = BASE_SWAP_BYTES + spotPositionCount * EXTRA_BYTES_PER_POSITION;
	if (tokenProgramFrom.equals(TOKEN_2022_PROGRAM_ID)) {
		bytes += 3; // 1 Pyra reference, 2 Drift references
	}
	if (tokenProgramTo.equals(TOKEN_2022_PROGRAM_ID)) {
		bytes += 3; // 1 Pyra reference, 2 Drift references
	}

	// Get remaining
	const MAX_ACCOUNTS = 64;
	const MAX_BYTES = 1232;

	return {
		bytes: Math.max(MAX_BYTES - bytes, 0),
		accounts: Math.max(MAX_ACCOUNTS - accountsUsed, 0),
	};
}

export function getMarketKeypair(
	marketIndex: number,
	baseKeypair: Uint8Array,
): Keypair {
	const seed = baseKeypair.slice(0, 32);
	const path = `m/44'/501'/${marketIndex}'/0'`;
	const derived = derivePath(path, Buffer.from(seed).toString("hex")).key;
	return Keypair.fromSeed(derived);
}

export function getTotalCollateralValue(
	spotPositions: SpotPosition[],
	spotMarkets: Record<MarketIndex, SpotMarketAccount>,
	oraclePrices: Record<MarketIndex, OraclePriceData>,
	marginCategory?: MarginCategory,
	strict = false,
): BN {
	return getSpotMarketAssetValue(
		spotPositions,
		spotMarkets,
		oraclePrices,
		marginCategory,
		undefined,
		strict,
		undefined,
	);
}

function getSpotMarketAssetValue(
	spotPositions: SpotPosition[],
	spotMarkets: Record<MarketIndex, SpotMarketAccount>,
	oraclePrices: Record<MarketIndex, OraclePriceData>,
	marginCategory?: MarginCategory,
	marketIndex?: number,
	strict = false,
	now?: BN,
): BN {
	const { totalAssetValue } = getSpotMarketAssetAndLiabilityValue(
		spotPositions,
		spotMarkets,
		oraclePrices,
		marginCategory,
		marketIndex,
		undefined,
		strict,
		now,
	);
	return totalAssetValue;
}

function getSpotMarketAssetAndLiabilityValue(
	spotPositions: SpotPosition[],
	spotMarkets: Record<MarketIndex, SpotMarketAccount>,
	oraclePrices: Record<MarketIndex, OraclePriceData>,
	marginCategory?: MarginCategory,
	marketIndex?: number,
	liquidationBuffer?: BN,
	strict = false,
	now: BN = new BN(new Date().getTime() / 1000),
): { totalAssetValue: BN; totalLiabilityValue: BN } {
	let netQuoteValue = ZERO;
	let totalAssetValue = ZERO;
	let totalLiabilityValue = ZERO;
	for (const spotPosition of spotPositions) {
		const countForBase =
			marketIndex === undefined || spotPosition.marketIndex === marketIndex;

		const countForQuote =
			marketIndex === undefined || marketIndex === QUOTE_SPOT_MARKET_INDEX;
		if (
			isSpotPositionAvailable(spotPosition) ||
			(!countForBase && !countForQuote)
		) {
			continue;
		}

		const spotMarketAccount =
			spotMarkets[spotPosition.marketIndex as MarketIndex];
		if (!spotMarketAccount) throw new Error("Spot market not found");
		const oraclePriceData =
			oraclePrices[spotPosition.marketIndex as MarketIndex];

		let twap5min: BN | undefined;
		if (strict) {
			twap5min = calculateLiveOracleTwap(
				spotMarketAccount.historicalOracleData,
				oraclePriceData,
				now,
				FIVE_MINUTE, // 5MIN
			);
		}
		const strictOraclePrice = new StrictOraclePrice(
			oraclePriceData.price,
			twap5min,
		);

		const tokenAmount = getSignedTokenAmount(
			getTokenAmount(
				spotPosition.scaledBalance,
				spotMarketAccount,
				spotPosition.balanceType,
			),
			spotPosition.balanceType,
		);

		const isBorrow = tokenAmount.lt(ZERO);

		if (spotPosition.marketIndex === QUOTE_SPOT_MARKET_INDEX && countForQuote) {
			if (isBorrow) {
				const weightedTokenValue = getSpotLiabilityValue(
					tokenAmount,
					strictOraclePrice,
					spotMarketAccount,
					marginCategory,
					liquidationBuffer,
				).abs();

				netQuoteValue = netQuoteValue.sub(weightedTokenValue);
			} else {
				const weightedTokenValue = getSpotAssetValue(
					tokenAmount,
					strictOraclePrice,
					spotMarketAccount,
					marginCategory,
				);

				netQuoteValue = netQuoteValue.add(weightedTokenValue);
			}

			continue;
		}

		if (countForBase) {
			if (isBorrow) {
				const liabilityValue = getSpotLiabilityValue(
					tokenAmount,
					strictOraclePrice,
					spotMarketAccount,
					marginCategory,
					liquidationBuffer,
				).abs();
				totalLiabilityValue = totalLiabilityValue.add(liabilityValue);

				continue;
			}

			const assetValue = getSpotAssetValue(
				tokenAmount,
				strictOraclePrice,
				spotMarketAccount,
				marginCategory,
			);
			totalAssetValue = totalAssetValue.add(assetValue);

			continue;
		}

		const {
			tokenAmount: worstCaseTokenAmount,
			ordersValue: worstCaseQuoteTokenAmount,
		} = getWorstCaseTokenAmounts(
			spotPosition,
			spotMarketAccount,
			strictOraclePrice,
			marginCategory ?? "Initial",
		);

		if (worstCaseTokenAmount.gt(ZERO) && countForBase) {
			const baseAssetValue = getSpotAssetValue(
				worstCaseTokenAmount,
				strictOraclePrice,
				spotMarketAccount,
				marginCategory,
			);

			totalAssetValue = totalAssetValue.add(baseAssetValue);
		}

		if (worstCaseTokenAmount.lt(ZERO) && countForBase) {
			const baseLiabilityValue = getSpotLiabilityValue(
				worstCaseTokenAmount,
				strictOraclePrice,
				spotMarketAccount,
				marginCategory,
				liquidationBuffer,
			).abs();

			totalLiabilityValue = totalLiabilityValue.add(baseLiabilityValue);
		}

		if (worstCaseQuoteTokenAmount.gt(ZERO) && countForQuote) {
			netQuoteValue = netQuoteValue.add(worstCaseQuoteTokenAmount);
		}

		if (worstCaseQuoteTokenAmount.lt(ZERO) && countForQuote) {
			const weightedTokenValue = worstCaseQuoteTokenAmount
				.abs()
				.mul(SPOT_MARKET_WEIGHT_PRECISION)
				.div(SPOT_MARKET_WEIGHT_PRECISION);

			netQuoteValue = netQuoteValue.sub(weightedTokenValue);
		}

		totalLiabilityValue = totalLiabilityValue.add(
			new BN(spotPosition.openOrders).mul(OPEN_ORDER_MARGIN_REQUIREMENT),
		);
	}

	if (marketIndex === undefined || marketIndex === QUOTE_SPOT_MARKET_INDEX) {
		if (netQuoteValue.gt(ZERO)) {
			totalAssetValue = totalAssetValue.add(netQuoteValue);
		} else {
			totalLiabilityValue = totalLiabilityValue.add(netQuoteValue.abs());
		}
	}

	return { totalAssetValue, totalLiabilityValue };
}

function getSpotLiabilityValue(
	tokenAmount: BN,
	strictOraclePrice: StrictOraclePrice,
	spotMarketAccount: SpotMarketAccount,
	marginCategory?: MarginCategory,
	liquidationBuffer?: BN,
): BN {
	let liabilityValue = getStrictTokenValue(
		tokenAmount,
		spotMarketAccount.decimals,
		strictOraclePrice,
	);

	if (marginCategory !== undefined) {
		let weight = calculateLiabilityWeight(
			tokenAmount,
			spotMarketAccount,
			marginCategory,
		);

		if (
			marginCategory === "Initial" &&
			spotMarketAccount.marketIndex !== QUOTE_SPOT_MARKET_INDEX
		) {
			weight = BN.max(weight, SPOT_MARKET_WEIGHT_PRECISION);
		}

		if (liquidationBuffer !== undefined) {
			weight = weight.add(liquidationBuffer);
		}

		liabilityValue = liabilityValue
			.mul(weight)
			.div(SPOT_MARKET_WEIGHT_PRECISION);
	}

	return liabilityValue;
}

function getSpotAssetValue(
	tokenAmount: BN,
	strictOraclePrice: StrictOraclePrice,
	spotMarketAccount: SpotMarketAccount,
	marginCategory?: MarginCategory,
): BN {
	let assetValue = getStrictTokenValue(
		tokenAmount,
		spotMarketAccount.decimals,
		strictOraclePrice,
	);

	if (marginCategory !== undefined) {
		let weight = calculateAssetWeight(
			tokenAmount,
			strictOraclePrice.current,
			spotMarketAccount,
			marginCategory,
		);

		if (
			marginCategory === "Initial" &&
			spotMarketAccount.marketIndex !== QUOTE_SPOT_MARKET_INDEX
		) {
			const userCustomAssetWeight = BN.max(ZERO, SPOT_MARKET_WEIGHT_PRECISION);
			weight = BN.min(weight, userCustomAssetWeight);
		}

		assetValue = assetValue.mul(weight).div(SPOT_MARKET_WEIGHT_PRECISION);
	}

	return assetValue;
}

export function getInitialMarginRequirement(
	spotPositions: SpotPosition[],
	spotMarkets: Record<MarketIndex, SpotMarketAccount>,
	oraclePrices: Record<MarketIndex, OraclePriceData>,
): BN {
	return getMarginRequirement(
		spotPositions,
		spotMarkets,
		oraclePrices,
		"Initial",
		undefined,
		false,
	);
}

function getMarginRequirement(
	spotPositions: SpotPosition[],
	spotMarkets: Record<MarketIndex, SpotMarketAccount>,
	oraclePrices: Record<MarketIndex, OraclePriceData>,
	marginCategory: MarginCategory,
	liquidationBuffer?: BN,
	strict = false,
): BN {
	return getSpotMarketLiabilityValue(
		spotPositions,
		spotMarkets,
		oraclePrices,
		marginCategory,
		undefined,
		liquidationBuffer,
		strict,
	);
}

function getSpotMarketLiabilityValue(
	spotPositions: SpotPosition[],
	spotMarkets: Record<MarketIndex, SpotMarketAccount>,
	oraclePrices: Record<MarketIndex, OraclePriceData>,
	marginCategory: MarginCategory,
	marketIndex?: number,
	liquidationBuffer?: BN,
	strict = false,
	now?: BN,
): BN {
	const { totalLiabilityValue } = getSpotMarketAssetAndLiabilityValue(
		spotPositions,
		spotMarkets,
		oraclePrices,
		marginCategory,
		marketIndex,
		liquidationBuffer,
		strict,
		now,
	);
	return totalLiabilityValue;
}
