import { PublicKey } from "@solana/web3.js";
import type { Token } from "../types/interfaces/token.interface.js";
import BN from "bn.js";

export const MarketIndex = [
    1, 0, 5, 22, 28, 3, 6, 19, 29
] as const;
export type MarketIndex = (typeof MarketIndex)[number];

export function getMarketIndicesRecord<T>(defaultValue: T): Record<MarketIndex, T> {
    return MarketIndex.reduce((acc, marketIndex) => {
        acc[marketIndex] = defaultValue;
        return acc;
    }, {} as Record<MarketIndex, T>);
}

export const TOKENS: Record<MarketIndex, Token> = {
    1: {
        name: "SOL",
        mint: new PublicKey("So11111111111111111111111111111111111111112"),
        pythPriceFeedId: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
        decimalPrecision: new BN(9),
        driftInitialCollateralWeight: new BN(80),
        coingeckoPriceId: "solana",
    },
    0: {
        name: "USDC",
        mint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
        pythPriceFeedId: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
        decimalPrecision: new BN(6),
        driftInitialCollateralWeight: new BN(100),
        coingeckoPriceId: "usd-coin",
    },
    5: {
        name: "USDT",
        mint: new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"),
        pythPriceFeedId: "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
        decimalPrecision: new BN(6),
        driftInitialCollateralWeight: new BN(90),
        coingeckoPriceId: "tether",
    },
    22: {
        name: "PYUSD",
        mint: new PublicKey("2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo"),
        pythPriceFeedId: "0xc1da1b73d7f01e7ddd54b3766cf7fcd644395ad14f70aa706ec5384c59e76692",
        decimalPrecision: new BN(6),
        driftInitialCollateralWeight: new BN(90),
        coingeckoPriceId: "paypal-usd",
    },
    28: {
        name: "USDS",
        mint: new PublicKey("USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA"),
        pythPriceFeedId: "0x77f0971af11cc8bac224917275c1bf55f2319ed5c654a1ca955c82fa2d297ea1",
        decimalPrecision: new BN(6),
        driftInitialCollateralWeight: new BN(90),
        coingeckoPriceId: "usds",
    },
    3: {
        name: "wBTC",
        mint: new PublicKey("3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh"),
        pythPriceFeedId: "0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33",
        decimalPrecision: new BN(8),
        driftInitialCollateralWeight: new BN(80),
        coingeckoPriceId: "wrapped-btc-wormhole",
    },
    6: {
        name: "JitoSOL",
        mint: new PublicKey("J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn"),
        pythPriceFeedId: "0x67be9f519b95cf24338801051f9a808eff0a578ccb388db73b7f6fe1de019ffb",
        decimalPrecision: new BN(9),
        driftInitialCollateralWeight: new BN(80),
        coingeckoPriceId: "jito-staked-sol",
    },
    19: {
        name: "JLP",
        mint: new PublicKey("27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4"),
        pythPriceFeedId: "0xc811abc82b4bad1f9bd711a2773ccaa935b03ecef974236942cec5e0eb845a3a",
        decimalPrecision: new BN(6),
        driftInitialCollateralWeight: new BN(80),
        coingeckoPriceId: "jupiter-perpetuals-liquidity-provider-token",
    },
    29: {
        name: "META",
        mint: new PublicKey("METADDFL6wWMWEoKTFJwcThTbUmtarRJZjRpzUvkxhr"),
        pythPriceFeedId: "0xe379d8d3a1a44952474f057bdfe6e902a97f093b2872c152dcf04f612e3e3be9",
        decimalPrecision: new BN(9),
        driftInitialCollateralWeight: new BN(25),
        coingeckoPriceId: "meta-2",
    }
};
