import { BulkAccountLoader, DriftClient } from "@drift-labs/sdk";
import type { Connection } from "@solana/web3.js";
import { MarketIndex } from "../config/tokens.js";
import { DummyWallet } from "../types/classes/dummyWallet.class.js";
import { QUARTZ_DRIFT_ACCOUNT } from "../config/constants.js";

export class DriftClientService {
    private static instance: DriftClientService;
    private driftClient: DriftClient;
    private driftClientInitPromise: Promise<boolean>;

    private constructor(
        connection: Connection,
        pollingFrequency = 1000
    ) {
        const wallet = new DummyWallet(QUARTZ_DRIFT_ACCOUNT);

        this.driftClient = new DriftClient({
            connection: connection,
            wallet: wallet,
            env: 'mainnet-beta',
            userStats: false,
            perpMarketIndexes: [],
            spotMarketIndexes: [...MarketIndex],
            accountSubscription: {
                type: 'polling',
                accountLoader: new BulkAccountLoader(connection, "confirmed", pollingFrequency)
            }
        });
        this.driftClientInitPromise = this.driftClient.subscribe();
    }

    public static async getDriftClient(connection: Connection, pollingFrequency = 1000): Promise<DriftClient> {
        if (!DriftClientService.instance) {
            DriftClientService.instance = new DriftClientService(connection, pollingFrequency);
        }
        await DriftClientService.instance.driftClientInitPromise;
        return DriftClientService.instance.driftClient;
    }
}
