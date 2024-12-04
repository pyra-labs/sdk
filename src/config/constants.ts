import { PublicKey } from "@solana/web3.js";

export const QUARTZ_PROGRAM_ID = new PublicKey("6JjHXLheGSNvvexgzMthEcgjkcirDrGduc3HAKB2P1v2");
export const QUARTZ_ADDRESS_TABLE = new PublicKey("96BmeKKVGX3LKYSKo3FCEom1YpNY11kCnGscKq6ouxLx");

export const QUARTZ_HEALTH_BUFFER = 0.1;

export const DRIFT_MARKET_INDEX_USDC = 0;
export const DRIFT_MARKET_INDEX_SOL = 1;
export const SUPPORTED_DRIFT_MARKETS = [DRIFT_MARKET_INDEX_USDC, DRIFT_MARKET_INDEX_SOL];