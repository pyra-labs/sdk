import { PublicKey } from "@solana/web3.js";
import { DriftUser } from "./model/driftUser";
import { DriftClient, UserAccount } from "@drift-labs/sdk";
import { getVaultPubkey } from "./helpers";
import { Connection } from "@solana/web3.js";
import { QUARTZ_HEALTH_BUFFER } from "./config/constants";

export class QuartzUser {
    private pubkey: PublicKey;
    private vaultPubkey: PublicKey;

    private connection: Connection;
    private driftClient: DriftClient;
    private driftUser: DriftUser;

    constructor(
        pubkey: PublicKey,
        connection: Connection,
        driftClient: DriftClient,
        driftUserAccount?: UserAccount
    ) {
        this.pubkey = pubkey;
        this.vaultPubkey = getVaultPubkey(pubkey);
        this.connection = connection;
        this.driftClient = driftClient;
        this.driftUser = new DriftUser(this.vaultPubkey, connection, driftClient, driftUserAccount);
    }

    private convertToQuartzHealth(protocolHealth: number): number {
        if (protocolHealth <= 0) return 0;
        if (protocolHealth >= 100) return 100;

        return Math.floor(
            Math.min(
                100,
                Math.max(
                    0,
                    (protocolHealth - QUARTZ_HEALTH_BUFFER) / (1 - QUARTZ_HEALTH_BUFFER)
                )
            )
        );
    }

    public getHealth(): number {
        const driftHealth = this.driftUser.getHealth();
        return this.convertToQuartzHealth(driftHealth);
    }

    public getRepayAmountForTargetHealth(
        targetHealth: number,
        repayCollateralWeight: number
    ): number {
        // New Quartz health after repayment is given as:
        // 
        //                                           loanValue - repayAmount                     
        //                  1 - ----------------------------------------------------------------- - quartzHealthBuffer
        //                      currentWeightedCollateral - (repayAmount * repayCollateralWeight)
        //   targetHealth = -------------------------------------------------------------------------------------------
        //                                                    1 - quartzHealthBuffer                                  
        //
        // The following is an algebraicly simplified expression of the above formula, in terms of repayAmount

        if (targetHealth <= 0 || targetHealth >= 100) throw Error(`Target health must be between 0 and 100`);
        if (targetHealth <= this.getHealth()) throw Error(`Target health must be greater than current health`);

        const currentWeightedCollateral = this.getTotalWeightedCollateral();
        const loanValue = this.getMaintenanceMarginRequirement();

        return Math.round(
            (
                loanValue - currentWeightedCollateral * (1 - QUARTZ_HEALTH_BUFFER) * (1 - targetHealth)
            ) / (
                1 - repayCollateralWeight * (1 - QUARTZ_HEALTH_BUFFER) * (1 - targetHealth)
            )
        );
    }

    public getTotalWeightedCollateral(): number {
        return this.driftUser.getTotalCollateral('Maintenance').toNumber();
    }

    public getMaintenanceMarginRequirement(): number {
        return this.driftUser.getMaintenanceMarginRequirement().toNumber();
    }
}
