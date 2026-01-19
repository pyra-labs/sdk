import {
	BN,
	calculateAssetWeight,
	calculateLiabilityWeight,
	calculateLiveOracleTwap,
	calculateWithdrawLimit,
	type DriftClient,
	FIVE_MINUTE,
	getSignedTokenAmount,
	getStrictTokenValue,
	getTokenAmount,
	isSpotPositionAvailable,
	isVariant,
	MARGIN_PRECISION,
	type MarginCategory,
	OPEN_ORDER_MARGIN_REQUIREMENT,
	type PerpPosition,
	PRICE_PRECISION,
	QUOTE_SPOT_MARKET_INDEX,
	SPOT_MARKET_WEIGHT_PRECISION,
	SpotBalanceType,
	StrictOraclePrice,
	type UserAccount,
	UserStatus,
	ZERO,
	TEN,
	divCeil,
	type SpotMarketAccount,
	type SpotPosition,
	type OrderFillSimulation,
	calculateWeightedTokenValue,
	simulateOrderFill,
} from "@drift-labs/sdk";
import type { PublicKey } from "@solana/web3.js";
import {
	getDriftUserPublicKey,
	getDriftUserStatsPublicKey,
} from "../../utils/accounts.js";
import type { AccountMeta } from "../interfaces/AccountMeta.interface.js";
import type { MarketIndex } from "../../config/tokens.js";
import { getMarketIndicesRecord } from "../../index.browser.js";

export class DriftUser {
	private authority: PublicKey;
	private driftClient: DriftClient;

	private userAccount: UserAccount | undefined;
	public pubkey: PublicKey;
	public statsPubkey: PublicKey;

	constructor(
		authority: PublicKey,
		driftClient: DriftClient,
		userAccount: UserAccount,
	) {
		this.authority = authority;
		this.driftClient = driftClient;

		this.pubkey = getDriftUserPublicKey(this.authority);
		this.statsPubkey = getDriftUserStatsPublicKey(this.authority);
		this.userAccount = userAccount;

		driftClient.addUser(0, this.authority, userAccount);
	}

	public getDriftUserAccount(): UserAccount {
		if (!this.userAccount) throw new Error("DriftUser not initialized");
		return this.userAccount;
	}

	public getRemainingAccounts(writeableIndices: MarketIndex[]): AccountMeta[] {
		const remainingAccounts = this.driftClient.getRemainingAccounts({
			userAccounts: [this.getDriftUserAccount()],
			useMarketLastSlotCache: true,
			writableSpotMarketIndexes: writeableIndices,
			readableSpotMarketIndexes: [QUOTE_SPOT_MARKET_INDEX],
		});

		for (const index of writeableIndices) {
			const spotMarketAccount = this.driftClient.getSpotMarketAccount(index);
			if (!spotMarketAccount) throw new Error("Spot market not found");
			this.driftClient.addTokenMintToRemainingAccounts(
				spotMarketAccount,
				remainingAccounts,
			);
		}

		return remainingAccounts;
	}

	public getHealth(): number {
		if (this.isBeingLiquidated()) return 0;

		// Drift health uses Maintenance margin, Quartz health uses Initial margin
		const totalCollateral = this.getTotalCollateralValue("Initial", true);
		const maintenanceMarginReq = this.getInitialMarginRequirement();

		if (maintenanceMarginReq.eq(ZERO) && totalCollateral.gte(ZERO)) {
			return 100;
		}

		if (totalCollateral.lte(ZERO)) {
			return 0;
		}

		return Math.round(
			Math.min(
				100,
				Math.max(
					0,
					(1 - maintenanceMarginReq.toNumber() / totalCollateral.toNumber()) *
						100,
				),
			),
		);
	}

	public getTokenAmount(
		marketIndex: number,
		openOrderBalances?: Record<MarketIndex, BN>,
	): BN {
		if (!this.userAccount) throw new Error("DriftUser not initialized");
		if (!openOrderBalances) openOrderBalances = getMarketIndicesRecord(ZERO);

		const spotPosition = this.userAccount.spotPositions.find(
			(position) => position.marketIndex === marketIndex,
		);

		if (spotPosition === undefined) {
			return ZERO;
		}

		const spotMarket = this.driftClient.getSpotMarketAccount(marketIndex);
		if (!spotMarket) throw new Error("Spot market not found");
		return getSignedTokenAmount(
			getTokenAmount(
				spotPosition.scaledBalance,
				spotMarket,
				spotPosition.balanceType,
			),
			spotPosition.balanceType,
		).sub(openOrderBalances[marketIndex as MarketIndex]);
	}

	public getWithdrawalLimit(
		marketIndex: MarketIndex,
		reduceOnly?: boolean,
		openOrderBalances?: Record<MarketIndex, BN>,
	): BN {
		if (!openOrderBalances) openOrderBalances = getMarketIndicesRecord(ZERO);

		const nowTs = new BN(Math.floor(Date.now() / 1000));
		const spotMarket = this.driftClient.getSpotMarketAccount(marketIndex);
		if (!spotMarket) throw new Error("Spot market not found");

		// eslint-disable-next-line prefer-const
		let { borrowLimit, withdrawLimit } = calculateWithdrawLimit(
			spotMarket,
			nowTs,
		);

		const freeCollateral = this.getFreeCollateral(
			"Initial",
			undefined,
			openOrderBalances,
		);
		const initialMarginRequirement = this.getMarginRequirement(
			"Initial",
			undefined,
			true,
			true,
			openOrderBalances,
		);
		const oracleData = this.driftClient.getOracleDataForSpotMarket(marketIndex);
		const precisionIncrease = TEN.pow(new BN(spotMarket.decimals - 6));

		const { canBypass, depositAmount: userDepositAmount } =
			this.canBypassWithdrawLimits(marketIndex);

		if (canBypass) {
			withdrawLimit = BN.max(withdrawLimit, userDepositAmount);
		}

		const assetWeight = calculateAssetWeight(
			userDepositAmount,
			oracleData.price,
			spotMarket,
			"Initial",
		);

		let amountWithdrawable: BN;
		if (assetWeight.eq(ZERO)) {
			amountWithdrawable = userDepositAmount;
		} else if (initialMarginRequirement.eq(ZERO)) {
			amountWithdrawable = userDepositAmount;
		} else {
			amountWithdrawable = divCeil(
				divCeil(freeCollateral.mul(MARGIN_PRECISION), assetWeight).mul(
					PRICE_PRECISION,
				),
				oracleData.price,
			).mul(precisionIncrease);
		}

		const maxWithdrawValue = BN.min(
			BN.min(amountWithdrawable, userDepositAmount),
			withdrawLimit.abs(),
		);

		if (reduceOnly) return BN.max(maxWithdrawValue, ZERO);

		const weightedAssetValue = this.getSpotMarketAssetValue(
			"Initial",
			marketIndex,
			false,
			true,
			undefined,
			openOrderBalances,
		);

		const freeCollatAfterWithdraw = userDepositAmount.gt(ZERO)
			? freeCollateral.sub(weightedAssetValue)
			: freeCollateral;

		const maxLiabilityAllowed = freeCollatAfterWithdraw
			.mul(MARGIN_PRECISION)
			.div(new BN(spotMarket.initialLiabilityWeight))
			.mul(PRICE_PRECISION)
			.div(oracleData.price)
			.mul(precisionIncrease);

		const maxBorrowValue = BN.min(
			maxWithdrawValue.add(maxLiabilityAllowed),
			borrowLimit.abs(),
		);

		return BN.max(maxBorrowValue, ZERO);
	}

	public getFreeCollateral(
		marginCategory: MarginCategory = "Initial",
		strict = false,
		openOrderBalances?: Record<MarketIndex, BN>,
	): BN {
		const totalCollateral = this.getTotalCollateralValue(
			marginCategory,
			strict,
			true,
			openOrderBalances,
		);

		const marginRequirement =
			marginCategory === "Initial"
				? this.getMarginRequirement(
						"Initial",
						undefined,
						strict,
						true,
						openOrderBalances,
					)
				: this.getInitialMarginRequirement(openOrderBalances);

		const freeCollateral = totalCollateral.sub(marginRequirement);
		return freeCollateral.gte(ZERO) ? freeCollateral : ZERO;
	}

	private canBypassWithdrawLimits(marketIndex: number): {
		canBypass: boolean;
		netDeposits: BN;
		depositAmount: BN;
		maxDepositAmount: BN;
	} {
		if (!this.userAccount) throw new Error("DriftUser not initialized");

		const spotMarket = this.driftClient.getSpotMarketAccount(marketIndex);
		if (!spotMarket) throw new Error("Spot market not found");

		const maxDepositAmount = spotMarket.withdrawGuardThreshold.div(new BN(10));
		const position = this.userAccount.spotPositions.find(
			(position) => position.marketIndex === marketIndex,
		);

		const netDeposits = this.userAccount.totalDeposits.sub(
			this.userAccount.totalWithdraws,
		);

		if (!position) {
			return {
				canBypass: false,
				maxDepositAmount,
				depositAmount: ZERO,
				netDeposits,
			};
		}

		if (isVariant(position.balanceType, "borrow")) {
			return {
				canBypass: false,
				maxDepositAmount,
				netDeposits,
				depositAmount: ZERO,
			};
		}

		const depositAmount = getTokenAmount(
			position.scaledBalance,
			spotMarket,
			SpotBalanceType.DEPOSIT,
		);

		if (netDeposits.lt(ZERO)) {
			return {
				canBypass: false,
				maxDepositAmount,
				depositAmount,
				netDeposits,
			};
		}

		return {
			canBypass: depositAmount.lt(maxDepositAmount),
			maxDepositAmount,
			netDeposits,
			depositAmount,
		};
	}

	private isBeingLiquidated(): boolean {
		if (!this.userAccount) throw new Error("DriftUser not initialized");
		return (
			(this.userAccount.status &
				(UserStatus.BEING_LIQUIDATED | UserStatus.BANKRUPT)) >
			0
		);
	}

	public getTotalCollateralValue(
		marginCategory?: MarginCategory,
		strict = false,
		includeOpenOrders = true,
		openOrderBalances?: Record<MarketIndex, BN>,
	): BN {
		if (!this.userAccount) throw new Error("DriftUser not initialized");

		return this.getSpotMarketAssetValue(
			marginCategory,
			undefined,
			includeOpenOrders,
			strict,
			undefined,
			openOrderBalances,
		);
	}

	public getTotalSpotLiabilityValue(
		marginCategory?: MarginCategory,
		strict = false,
		includeOpenOrders = true,
		openOrderBalances?: Record<MarketIndex, BN>,
	): BN {
		if (!this.userAccount) throw new Error("DriftUser not initialized");

		const { totalLiabilityValue } = this.getSpotMarketAssetAndLiabilityValue(
			marginCategory,
			undefined,
			undefined,
			includeOpenOrders,
			strict,
			undefined,
			openOrderBalances,
		);
		return totalLiabilityValue;
	}

	private getSpotMarketAssetValue(
		marginCategory?: MarginCategory,
		marketIndex?: number,
		includeOpenOrders?: boolean,
		strict = false,
		now?: BN,
		openOrderBalances?: Record<MarketIndex, BN>,
	): BN {
		const { totalAssetValue } = this.getSpotMarketAssetAndLiabilityValue(
			marginCategory,
			marketIndex,
			undefined,
			includeOpenOrders,
			strict,
			now,
			openOrderBalances,
		);
		return totalAssetValue;
	}

	private getSpotMarketAssetAndLiabilityValue(
		marginCategory?: MarginCategory,
		marketIndex?: number,
		liquidationBuffer?: BN,
		includeOpenOrders?: boolean,
		strict = false,
		now: BN = new BN(new Date().getTime() / 1000),
		openOrderBalances?: Record<MarketIndex, BN>,
	): { totalAssetValue: BN; totalLiabilityValue: BN } {
		if (!this.userAccount) throw new Error("DriftUser not initialized");
		if (!openOrderBalances) openOrderBalances = getMarketIndicesRecord(ZERO);

		let netQuoteValue = ZERO;
		let totalAssetValue = ZERO;
		let totalLiabilityValue = ZERO;
		for (const spotPosition of this.userAccount.spotPositions) {
			const countForBase =
				marketIndex === undefined || spotPosition.marketIndex === marketIndex;

			const countForQuote =
				marketIndex === undefined ||
				marketIndex === QUOTE_SPOT_MARKET_INDEX ||
				(includeOpenOrders && spotPosition.openOrders !== 0);
			if (
				isSpotPositionAvailable(spotPosition) ||
				(!countForBase && !countForQuote)
			) {
				continue;
			}

			const spotMarketAccount = this.driftClient.getSpotMarketAccount(
				spotPosition.marketIndex,
			);
			if (!spotMarketAccount) throw new Error("Spot market not found");
			const oraclePriceData = this.driftClient.getOracleDataForSpotMarket(
				spotPosition.marketIndex,
			);

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
			).sub(openOrderBalances[spotPosition.marketIndex as MarketIndex]);

			const isBorrow = tokenAmount.lt(ZERO);

			if (
				spotPosition.marketIndex === QUOTE_SPOT_MARKET_INDEX &&
				countForQuote
			) {
				if (isBorrow) {
					const weightedTokenValue = this.getSpotLiabilityValue(
						tokenAmount,
						strictOraclePrice,
						spotMarketAccount,
						marginCategory,
						liquidationBuffer,
					).abs();

					netQuoteValue = netQuoteValue.sub(weightedTokenValue);
				} else {
					const weightedTokenValue = this.getSpotAssetValue(
						tokenAmount,
						strictOraclePrice,
						spotMarketAccount,
						marginCategory,
					);

					netQuoteValue = netQuoteValue.add(weightedTokenValue);
				}

				continue;
			}

			if (!includeOpenOrders && countForBase) {
				if (isBorrow) {
					const liabilityValue = this.getSpotLiabilityValue(
						tokenAmount,
						strictOraclePrice,
						spotMarketAccount,
						marginCategory,
						liquidationBuffer,
					).abs();
					totalLiabilityValue = totalLiabilityValue.add(liabilityValue);

					continue;
				}

				const assetValue = this.getSpotAssetValue(
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
			} = this.getWorstCaseTokenAmounts(
				spotPosition,
				spotMarketAccount,
				strictOraclePrice,
				marginCategory ?? "Initial",
				this.userAccount.maxMarginRatio,
				openOrderBalances,
			);

			if (worstCaseTokenAmount.gt(ZERO) && countForBase) {
				const baseAssetValue = this.getSpotAssetValue(
					worstCaseTokenAmount,
					strictOraclePrice,
					spotMarketAccount,
					marginCategory,
				);

				totalAssetValue = totalAssetValue.add(baseAssetValue);
			}

			if (worstCaseTokenAmount.lt(ZERO) && countForBase) {
				const baseLiabilityValue = this.getSpotLiabilityValue(
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
				let weight = SPOT_MARKET_WEIGHT_PRECISION;
				if (marginCategory === "Initial") {
					weight = BN.max(weight, new BN(this.userAccount.maxMarginRatio));
				}

				const weightedTokenValue = worstCaseQuoteTokenAmount
					.abs()
					.mul(weight)
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

	private getWorstCaseTokenAmounts(
		spotPosition: SpotPosition,
		spotMarketAccount: SpotMarketAccount,
		strictOraclePrice: StrictOraclePrice,
		marginCategory: MarginCategory,
		customMarginRatio?: number,
		openOrderBalances?: Record<MarketIndex, BN>,
	): OrderFillSimulation {
		if (!openOrderBalances) openOrderBalances = getMarketIndicesRecord(ZERO);

		const tokenAmount = getSignedTokenAmount(
			getTokenAmount(
				spotPosition.scaledBalance,
				spotMarketAccount,
				spotPosition.balanceType,
			),
			spotPosition.balanceType,
		).sub(openOrderBalances[spotPosition.marketIndex as MarketIndex]);

		const tokenValue = getStrictTokenValue(
			tokenAmount,
			spotMarketAccount.decimals,
			strictOraclePrice,
		);

		if (spotPosition.openBids.eq(ZERO) && spotPosition.openAsks.eq(ZERO)) {
			const { weight, weightedTokenValue } = calculateWeightedTokenValue(
				tokenAmount,
				tokenValue,
				strictOraclePrice.current,
				spotMarketAccount,
				marginCategory,
				customMarginRatio,
			);
			return {
				tokenAmount,
				ordersValue: ZERO,
				tokenValue,
				weight,
				weightedTokenValue,
				freeCollateralContribution: weightedTokenValue,
			};
		}

		const bidsSimulation = simulateOrderFill(
			tokenAmount,
			tokenValue,
			spotPosition.openBids,
			strictOraclePrice,
			spotMarketAccount,
			marginCategory,
			customMarginRatio,
		);
		const asksSimulation = simulateOrderFill(
			tokenAmount,
			tokenValue,
			spotPosition.openAsks,
			strictOraclePrice,
			spotMarketAccount,
			marginCategory,
			customMarginRatio,
		);

		if (
			asksSimulation.freeCollateralContribution.lt(
				bidsSimulation.freeCollateralContribution,
			)
		) {
			return asksSimulation;
		}

		return bidsSimulation;
	}

	private getSpotLiabilityValue(
		tokenAmount: BN,
		strictOraclePrice: StrictOraclePrice,
		spotMarketAccount: SpotMarketAccount,
		marginCategory?: MarginCategory,
		liquidationBuffer?: BN,
	): BN {
		if (!this.userAccount) throw new Error("DriftUser not initialized");

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
				weight = BN.max(
					weight,
					SPOT_MARKET_WEIGHT_PRECISION.addn(this.userAccount.maxMarginRatio),
				);
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

	private getSpotAssetValue(
		tokenAmount: BN,
		strictOraclePrice: StrictOraclePrice,
		spotMarketAccount: SpotMarketAccount,
		marginCategory?: MarginCategory,
	): BN {
		if (!this.userAccount) throw new Error("DriftUser not initialized");

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
				const userCustomAssetWeight = BN.max(
					ZERO,
					SPOT_MARKET_WEIGHT_PRECISION.subn(this.userAccount.maxMarginRatio),
				);
				weight = BN.min(weight, userCustomAssetWeight);
			}

			assetValue = assetValue.mul(weight).div(SPOT_MARKET_WEIGHT_PRECISION);
		}

		return assetValue;
	}

	private getActivePerpPositions() {
		if (!this.userAccount) throw new Error("DriftUser not initialized");
		return this.userAccount.perpPositions.filter(
			(pos) =>
				!pos.baseAssetAmount.eq(ZERO) ||
				!pos.quoteAssetAmount.eq(ZERO) ||
				!(pos.openOrders === 0) ||
				!pos.lpShares.eq(ZERO),
		);
	}

	private getClonedPosition(position: PerpPosition): PerpPosition {
		const clonedPosition = Object.assign({}, position);
		return clonedPosition;
	}

	public getInitialMarginRequirement(
		openOrderBalances?: Record<MarketIndex, BN>,
	): BN {
		if (!this.userAccount) throw new Error("DriftUser not initialized");

		// if user being liq'd, can continue to be liq'd until total collateral above the margin requirement plus buffer
		let liquidationBuffer: BN | undefined = undefined;
		if (this.isBeingLiquidated()) {
			liquidationBuffer = new BN(
				this.driftClient.getStateAccount().liquidationMarginBufferRatio,
			);
		}

		return this.getMarginRequirement(
			"Initial",
			liquidationBuffer,
			false,
			true,
			openOrderBalances,
		);
	}

	private getMarginRequirement(
		marginCategory: MarginCategory,
		liquidationBuffer?: BN,
		strict = false,
		includeOpenOrders = true,
		openOrderBalances?: Record<MarketIndex, BN>,
	): BN {
		return this.getSpotMarketLiabilityValue(
			marginCategory,
			undefined,
			liquidationBuffer,
			includeOpenOrders,
			strict,
			undefined,
			openOrderBalances,
		);
	}

	private getSpotMarketLiabilityValue(
		marginCategory: MarginCategory,
		marketIndex?: number,
		liquidationBuffer?: BN,
		includeOpenOrders?: boolean,
		strict = false,
		now?: BN,
		openOrderBalances?: Record<MarketIndex, BN>,
	): BN {
		const { totalLiabilityValue } = this.getSpotMarketAssetAndLiabilityValue(
			marginCategory,
			marketIndex,
			liquidationBuffer,
			includeOpenOrders,
			strict,
			now,
			openOrderBalances,
		);
		return totalLiabilityValue;
	}
}
