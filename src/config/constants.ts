import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

export const QUARTZ_PROGRAM_ID = new PublicKey(
	"6JjHXLheGSNvvexgzMthEcgjkcirDrGduc3HAKB2P1v2",
); // prod
// export const QUARTZ_PROGRAM_ID = new PublicKey(
// 	"GKp2mXvcsLBuU3ajGmYzujBBKtBt2osE7ingSq7kERYo",
// ); // staging
export const QUARTZ_ADDRESS_TABLE = new PublicKey(
	"5GQiSzo2t6ftg2LR56kHpdP8RYyzo5dryRz87ydaBycS",
);
export const QUARTZ_DRIFT_ACCOUNT = new PublicKey(
	"5XY5pQbBjwv8ByBxKPNE7Xyb9dVcdFgd51xcxKDJjGWE",
);

// Admin keys
export const SPEND_FEE_DESTINATION = new PublicKey(
	"EaC6zAamfa5oPHYbXka6U27SrFZn6SkofFGtzvqUNrpM",
);
export const SPEND_SETTLEMENT_ACCOUNT = new PublicKey(
	"AgrycchFMBGWktVv69sZSbz53biYozTfVRH9vV9YA4c",
);

// Integrations
export const DRIFT_PROGRAM_ID = new PublicKey(
	"dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH",
);
export const PYTH_ORACLE_PROGRAM_ID = new PublicKey(
	"pythWSnswVUd12oZpeFP8e9CVaEqJg25g1Vtc2biRsT",
);
export const MARGINFI_PROGRAM_ID = new PublicKey(
	"MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA",
);

export const MARGINFI_GROUP_1 = new PublicKey(
	"4qp6Fx6tnZkY5Wropq9wUYgtFxXKwE6viZxFHg3rdAG8",
);

export const MARKET_INDEX_USDC = 0;
export const MARKET_INDEX_SOL = 1;
export const MARKET_INDEX_JITOSOL = 6;

export const DEFAULT_COMPUTE_UNIT_LIMIT = 800_000;
export const DEFAULT_COMPUTE_UNIT_PRICE = 1_250_000;

export const ZERO = new BN(0);

export const MAX_ACCOUNTS_PER_FETCH_CALL = 100;

export const DEPOSIT_ADDRESS_DATA_SIZE = 0;
