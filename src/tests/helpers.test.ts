import { Keypair, PublicKey } from "@solana/web3.js";
import { getDriftSpotMarketVaultPublicKey, getDriftStatePublicKey, getDriftUserPublicKey, getDriftUserStatsPublicKey, getVaultPublicKey } from "../utils/accounts.js";
import { TOKENS } from "../config/tokens.js";
import { bs58 } from "../index.browser.js";
import { MarketIndex, QuartzClient } from "@quartz-labs/sdk";

describe("PDAs", () => {
    const testAddress = new PublicKey("DcJpAhpbhwgXF5UBJP1KN6ub4GS61TmAb32LtoB57pAf");

    it("Should get user vault", () => {
        const vault = getVaultPublicKey(testAddress);
        expect(vault).toStrictEqual(new PublicKey("D9RiL1Hs2mZs8VWT2vAbYBfspxk2j3iY51VDfeFooDqL"));
    });

    it("Should get drift user", () => {
        const driftUser = getDriftUserPublicKey(getVaultPublicKey(testAddress));
        expect(driftUser).toStrictEqual(new PublicKey("7ZpTwFDpbcFWY4tY8SwpTnD79JYtCgytXBM3T8Fukgcy"));
    })

    it("Should get drift user stats", () => {
        const driftUserStats = getDriftUserStatsPublicKey(getVaultPublicKey(testAddress));
        expect(driftUserStats).toStrictEqual(new PublicKey("4Kuz1AAF9DMYcrpQESbjG49VVqZW9J9pjiZZySaKVnUE"));
    })

    it("Should get drift state", () => {
        const driftState = getDriftStatePublicKey();
        expect(driftState).toStrictEqual(new PublicKey("5zpq7DvB6UdFFvpmBPspGPNfUGoBRRCE2HHg5u3gxcsN"));
    })

    it("Should get drift spot market USDC vault", () => {
        const driftSpotMarketVault = getDriftSpotMarketVaultPublicKey(0);
        expect(driftSpotMarketVault).toStrictEqual(new PublicKey("GXWqPpjQpdz7KZw9p7f5PX2eGxHAhvpNXiviFkAB8zXg"));
    })

    it("Should get drift spot market SOL vault", () => {
        const driftSpotMarketVault = getDriftSpotMarketVaultPublicKey(1);
        expect(driftSpotMarketVault).toStrictEqual(new PublicKey("DfYCNezifxAEsQbAJ1b3j6PX3JVBe8fu11KBhxsbw5d2"));
    })
});