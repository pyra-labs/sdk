import { Wallet } from "@coral-xyz/anchor";
import { QuartzClient } from "@quartz-labs/sdk";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    const TEST_WALLET = new PublicKey("DcJpAhpbhwgXF5UBJP1KN6ub4GS61TmAb32LtoB57pAf");

    if (!process.env.RPC_URL) throw new Error("RPC_URL is not set");
    const connection = new Connection(process.env.RPC_URL, "confirmed");
    const wallet = new Wallet(Keypair.generate());

    const client = await QuartzClient.fetchClient(connection, wallet);
    const user = await client.getQuartzAccount(TEST_WALLET);
    
    console.log(user);
}

main();