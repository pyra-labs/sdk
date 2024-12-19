import type { Keypair, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

export class DummyWallet {
    publicKey: PublicKey;
    payer: Keypair;
    constructor(keypair: Keypair) {
        this.payer = keypair;
        this.publicKey = keypair.publicKey;
    }
    signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
        return Promise.resolve(transaction);
    }
    signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
        return Promise.resolve(transactions);
    }
}