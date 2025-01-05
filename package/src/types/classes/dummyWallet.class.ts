import { Keypair, type PublicKey, type Transaction, type VersionedTransaction } from "@solana/web3.js";

export class DummyWallet {
    publicKey: PublicKey;
    payer: Keypair;

    constructor(publicKey?: PublicKey) {
        this.payer = Keypair.generate();
        this.publicKey = publicKey ?? this.payer.publicKey;
    }

    signTransaction<T extends Transaction | VersionedTransaction>(_: T): Promise<T> {
        throw new Error("DummyWallet cannot sign transactions");
    }

    signAllTransactions<T extends Transaction | VersionedTransaction>(_: T[]): Promise<T[]> {
        throw new Error("DummyWallet cannot sign transactions");
    }
}