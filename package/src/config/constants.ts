import { PublicKey } from "@solana/web3.js";

export const QUARTZ_PROGRAM_ID = new PublicKey("6JjHXLheGSNvvexgzMthEcgjkcirDrGduc3HAKB2P1v2");
export const QUARTZ_ADDRESS_TABLE = new PublicKey("96BmeKKVGX3LKYSKo3FCEom1YpNY11kCnGscKq6ouxLx");

export const DRIFT_PROGRAM_ID = new PublicKey("dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH");
export const PYTH_ORACLE_PROGRAM_ID = new PublicKey("pythWSnswVUd12oZpeFP8e9CVaEqJg25g1Vtc2biRsT");

export const QUARTZ_HEALTH_BUFFER = 10;

export const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
export const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

export const DRIFT_MARKET_INDEX_USDC = 0;
export const DRIFT_MARKET_INDEX_SOL = 1;
export const SUPPORTED_DRIFT_MARKETS = [DRIFT_MARKET_INDEX_USDC, DRIFT_MARKET_INDEX_SOL] as const;

export const DRIFT_ORACLE_1 = new PublicKey("En8hkHLkRe9d9DraYmBTrus518BvmVH448YcvmrFM6Ce");
export const DRIFT_ORACLE_2 = new PublicKey("BAtFj4kQttZRVep3UZS2aZRDixkGYgWsbqTBVDbnSsPF");
export const DRIFT_SPOT_MARKET_SOL = new PublicKey("3x85u7SWkmmr7YQGYhtjARgxwegTLJgkSLRprfXod6rh");
export const DRIFT_SPOT_MARKET_USDC = new PublicKey("6gMq3mRCKf8aP3ttTyYhuijVZ2LGi14oDsBbkgubfLB3");
