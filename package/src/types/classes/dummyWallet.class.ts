import { Keypair, type PublicKey, type Transaction, type VersionedTransaction } from "@solana/web3.js";

export class DummyWallet {
    publicKey: PublicKey;
    payer: Keypair;
    
    constructor(publicKey?: PublicKey) {
        this.payer = Keypair.generate();
        this.publicKey = publicKey ?? this.payer.publicKey;
    }
    async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
        return tx;
    }
    async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
        return txs;
    }
}