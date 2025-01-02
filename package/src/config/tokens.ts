import { PublicKey } from "@solana/web3.js";
import type { Token } from "../types/interfaces/token.interface.js";

export const MarketIndex = [
    1, 0, 5, 22, 28
] as const;
export type MarketIndex = (typeof MarketIndex)[number];

export const TOKENS: Token[] = [
    { // WSOL
        marketIndex: 1,
        mint: new PublicKey("So11111111111111111111111111111111111111112"),
        pythPriceFeedId: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d"
    },
    { // USDC
        marketIndex: 0,
        mint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
        pythPriceFeedId: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a"
    },
    { // USDT
        marketIndex: 5,
        mint: new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"),
        pythPriceFeedId: "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b"
    },
    { // PYUSD
        marketIndex: 22,
        mint: new PublicKey("2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo"),
        pythPriceFeedId: "0xc1da1b73d7f01e7ddd54b3766cf7fcd644395ad14f70aa706ec5384c59e76692"
    },
    { // USDS
        marketIndex: 28,
        mint: new PublicKey("USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA"),
        pythPriceFeedId: "0x77f0971af11cc8bac224917275c1bf55f2319ed5c654a1ca955c82fa2d297ea1"
    }
];

export const getToken = (marketIndex: number): Token => {
    const token = TOKENS.find((token) => token.marketIndex === marketIndex);
    if (!token) throw Error(`Token not found for market index: ${marketIndex}`);
    return token;
}