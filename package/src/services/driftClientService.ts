import { DriftClient } from "@drift-labs/sdk";
import type { Connection } from "@solana/web3.js";
import { MarketIndex } from "../config/tokens.js";
import { DummyWallet } from "../types/classes/dummyWallet.class.js";
import { QUARTZ_DRIFT_ACCOUNT } from "../config/constants.js";

export class DriftClientService {
    private static instance: DriftClientService;
    private driftClient: DriftClient;
    private driftClientInitPromise: Promise<boolean>;

    constructor(
        connection: Connection
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
                type: 'websocket',
                commitment: "confirmed"
            }
        });
        this.driftClientInitPromise = this.driftClient.subscribe();
    }

    public static async getDriftClient(connection: Connection): Promise<DriftClient> {
        if (!DriftClientService.instance) {
            DriftClientService.instance = new DriftClientService(connection);
        }
        await DriftClientService.instance.driftClientInitPromise;
        return DriftClientService.instance.driftClient;
    }
}
