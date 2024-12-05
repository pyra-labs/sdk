import { DriftClient, Wallet } from "@drift-labs/sdk";
import { Keypair } from "@solana/web3.js";
import { SUPPORTED_DRIFT_MARKETS } from "../config/constants.js";
export class DriftClientService {
    constructor(connection) {
        const wallet = new Wallet(Keypair.generate());
        this.driftClient = new DriftClient({
            connection: connection,
            wallet: wallet,
            env: 'mainnet-beta',
            userStats: false,
            perpMarketIndexes: [],
            spotMarketIndexes: SUPPORTED_DRIFT_MARKETS,
            accountSubscription: {
                type: 'websocket',
                commitment: "confirmed"
            }
        });
        this.driftClientInitPromise = this.driftClient.subscribe();
    }
    static async getDriftClient(connection) {
        if (!DriftClientService.instance) {
            DriftClientService.instance = new DriftClientService(connection);
        }
        await DriftClientService.instance.driftClientInitPromise;
        return DriftClientService.instance.driftClient;
    }
}
