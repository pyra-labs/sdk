import { DriftClient, Wallet } from "@drift-labs/sdk";
import type { Connection } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";
import { TOKENS } from "../config/tokens.js";

export class DriftClientService {
    private static instance: DriftClientService;
    private driftClient: DriftClient;
    private driftClientInitPromise: Promise<boolean>;

    constructor(
        connection: Connection
    ) {
        const wallet = new Wallet(Keypair.generate());

        const supportedDriftMarkets = TOKENS.map((token) => token.marketIndex);

        this.driftClient = new DriftClient({
            connection: connection,
            wallet: wallet,
            env: 'mainnet-beta',
            userStats: false,
            perpMarketIndexes: [],
            spotMarketIndexes: supportedDriftMarkets,
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
