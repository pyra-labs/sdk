import {
	BulkAccountLoader,
	DriftClient,
	type DriftClientSubscriptionConfig,
	type GrpcConfigs,
} from "@drift-labs/sdk";
import type { Connection } from "@solana/web3.js";
import { MarketIndex } from "../config/tokens.js";
import { DummyWallet } from "../types/classes/DummyWallet.class.js";
import { QUARTZ_DRIFT_ACCOUNT } from "../config/constants.js";

export class DriftClientService {
	private static instance: DriftClientService;
	private driftClient: DriftClient;
	private driftClientInitPromise: Promise<boolean>;

	private constructor(
		connection: Connection,
		pollingFrequency = 1000,
		grpcConfigs?: GrpcConfigs,
	) {
		const wallet = new DummyWallet(QUARTZ_DRIFT_ACCOUNT);

		const accountSubscription = grpcConfigs
			? {
					type: "grpc",
					grpcConfigs,
				}
			: {
					type: "polling",
					accountLoader: new BulkAccountLoader(
						connection,
						"confirmed",
						pollingFrequency,
					),
				};

		this.driftClient = new DriftClient({
			connection: connection,
			wallet: wallet,
			env: "mainnet-beta",
			userStats: false,
			perpMarketIndexes: [],
			spotMarketIndexes: [...MarketIndex],
			accountSubscription: accountSubscription as DriftClientSubscriptionConfig,
		});
		this.driftClientInitPromise = this.driftClient.subscribe();
	}

	public static async getDriftClient(
		connection: Connection,
		pollingFrequency = 1000,
		grpcConfigs?: GrpcConfigs,
	): Promise<DriftClient> {
		if (!DriftClientService.instance) {
			DriftClientService.instance = new DriftClientService(
				connection,
				pollingFrequency,
				grpcConfigs,
			);
		}
		await DriftClientService.instance.driftClientInitPromise;
		return DriftClientService.instance.driftClient;
	}
}
