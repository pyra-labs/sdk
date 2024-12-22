import { DriftUser } from "./types/classes/driftUser.class.js";
import type { DriftClient, UserAccount } from "@drift-labs/sdk";
import type { Connection, AddressLookupTableAccount, } from "@solana/web3.js";
import { QUARTZ_HEALTH_BUFFER, } from "./config/constants.js";
import type { Quartz } from "./types/idl/quartz.js";
import type { Program } from "@coral-xyz/anchor";
import type { PublicKey, } from "@solana/web3.js";
import { QuartzUserLight } from "./userLights.js";

export class QuartzUser extends QuartzUserLight {
    private driftClient: DriftClient;
    private driftUser: DriftUser;

    constructor(
        pubkey: PublicKey,
        connection: Connection,
        program: Program<Quartz>,
        quartzLookupTable: AddressLookupTableAccount,
        oracles: Map<string, PublicKey>,
        driftClient: DriftClient,
        driftUserAccount: UserAccount
    ) {
        super(
            pubkey, 
            connection, 
            program, 
            quartzLookupTable, 
            oracles
        );
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
                    ((protocolHealth - QUARTZ_HEALTH_BUFFER) / (100 - QUARTZ_HEALTH_BUFFER)) * 100
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

        if (targetHealth <= 0 || targetHealth >= 100) throw Error("Target health must be between 0 and 100");
        if (targetHealth <= this.getHealth()) throw Error("Target health must be greater than current health");

        const currentWeightedCollateral = this.getTotalWeightedCollateralValue();
        const loanValue = this.getMaintenanceMarginRequirement();
        const targetHealthDecimal = targetHealth / 100;
        const healthBufferDecimal = QUARTZ_HEALTH_BUFFER / 100;

        return Math.round(
            (
                loanValue - currentWeightedCollateral * (1 - healthBufferDecimal) * (1 - targetHealthDecimal)
            ) / (
                1 - repayCollateralWeight * (1 - healthBufferDecimal) * (1 - targetHealthDecimal)
            )
        );
    }

    public getTotalCollateralValue(): number {
        return this.driftUser.getTotalCollateralValue(undefined).toNumber();
    }

    public getTotalWeightedCollateralValue(): number {
        return this.driftUser.getTotalCollateralValue('Maintenance').toNumber();
    }

    public getMaintenanceMarginRequirement(): number {
        return this.driftUser.getMaintenanceMarginRequirement().toNumber();
    }

    public async getTokenBalance(spotMarketIndex: number): Promise<number> {
        return this.driftUser.getTokenAmount(spotMarketIndex).toNumber();
    }

    public async getWithdrawalLimit(spotMarketIndex: number): Promise<number> {
        return this.driftUser.getWithdrawalLimit(spotMarketIndex, false, true).toNumber();
    }
}
