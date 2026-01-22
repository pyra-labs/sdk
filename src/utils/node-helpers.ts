import { Keypair } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";

export function getMarketKeypair(
	marketIndex: number,
	baseKeypair: Uint8Array,
): Keypair {
	const seed = baseKeypair.slice(0, 32);
	const path = `m/44'/501'/${marketIndex}'/0'`;
	const derived = derivePath(path, Buffer.from(seed).toString("hex")).key;
	return Keypair.fromSeed(derived);
}
