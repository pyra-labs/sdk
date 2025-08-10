import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

export const QUARTZ_PROGRAM_ID = new PublicKey("6JjHXLheGSNvvexgzMthEcgjkcirDrGduc3HAKB2P1v2");
export const QUARTZ_ADDRESS_TABLE = new PublicKey("5GQiSzo2t6ftg2LR56kHpdP8RYyzo5dryRz87ydaBycS");
export const QUARTZ_DRIFT_ACCOUNT = new PublicKey("5XY5pQbBjwv8ByBxKPNE7Xyb9dVcdFgd51xcxKDJjGWE");

export const DRIFT_PROGRAM_ID = new PublicKey("dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH");
export const PYTH_ORACLE_PROGRAM_ID = new PublicKey("pythWSnswVUd12oZpeFP8e9CVaEqJg25g1Vtc2biRsT");
export const TOKEN_MESSAGE_MINTER_PROGRAM_ID = new PublicKey("CCTPiPYPc6AsJuwueEnWgSgucamXDZwBd53dQ11YiKX3");
export const MESSAGE_TRANSMITTER_PROGRAM_ID = new PublicKey("CCTPmbSD7gX1bxKPAmg77w8oFzNFpaQiQUWD43TKaecd");
export const MARGINFI_PROGRAM_ID = new PublicKey("MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA");

export const PROVIDER_BASE_ADDRESS = "0x55a2eeB9028ee51Ef91352Fa9f84A9450C5Af099";
export const QUARTZ_CALLER_BASE_ADDRESS = "0x28A0105A0cf8C0485a4956ba14b5274e9ED229DE";
export const SPEND_FEE_DESTINATION = new PublicKey("9hDHD7rPvo8QgcApomXBQJhAQSU8L7Skaghms5U7KQ2k");

export const MARGINFI_GROUP_1 = new PublicKey("4qp6Fx6tnZkY5Wropq9wUYgtFxXKwE6viZxFHg3rdAG8");

export const MARKET_INDEX_USDC = 0;
export const MARKET_INDEX_SOL = 1;

export const DEFAULT_COMPUTE_UNIT_LIMIT = 800_000;
export const DEFAULT_COMPUTE_UNIT_PRICE = 1_250_000;

export const ZERO = new BN(0);

export const MAX_ACCOUNTS_PER_FETCH_CALL = 100;

export const DEPOSIT_ADDRESS_DATA_SIZE = 0;