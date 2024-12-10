import type { Connection, AccountInfo } from "@solana/web3.js";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import type { QuoteResponse } from "@jup-ag/api";
import { AddressLookupTableAccount } from "@solana/web3.js";
import type { RemainingAccount } from "../interfaces/remainingAccount.interface.js";

export async function getJupiterSwapIx(
  walletPubkey: PublicKey, 
  connection: Connection, 
  quoteResponse: QuoteResponse
): Promise<{ 
  ix_jupiterSwap: TransactionInstruction, 
  jupiterLookupTables: AddressLookupTableAccount[] 
}> {
    const instructions: any = await (
        await fetch('https://quote-api.jup.ag/v6/swap-instructions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quoteResponse,
                userPublicKey: walletPubkey.toBase58(),
                useCompression: true,
            })
        })
    ).json();

    if (instructions.error) {
        throw new Error(`Failed to get swap instructions: ${instructions.error}`);
    }
    const { swapInstruction, addressLookupTableAddresses } = instructions;

    const getAddressLookupTableAccounts = async (
        keys: string[]
      ): Promise<AddressLookupTableAccount[]> => {
        const addressLookupTableAccountInfos =
          await connection.getMultipleAccountsInfo(
            keys.map((key) => new PublicKey(key))
          );
      
        return addressLookupTableAccountInfos.reduce((acc: AddressLookupTableAccount[], accountInfo: AccountInfo<Buffer> | null, index: number) => {
          const addressLookupTableAddress = keys[index];
          if (accountInfo) {
            if (addressLookupTableAddress === undefined) throw new Error("Address lookup table address is undefined");
            const addressLookupTableAccount = new AddressLookupTableAccount({
              key: new PublicKey(addressLookupTableAddress),
              state: AddressLookupTableAccount.deserialize(accountInfo.data),
            });
            acc.push(addressLookupTableAccount);
          }
      
          return acc;
        }, new Array<AddressLookupTableAccount>());
    };

    const addressLookupTableAccounts: AddressLookupTableAccount[] = [];
    addressLookupTableAccounts.push(
        ...(await getAddressLookupTableAccounts(addressLookupTableAddresses ?? []))
    );

    const ix_jupiterSwap =  new TransactionInstruction({
        programId: new PublicKey(swapInstruction.programId),
        keys: swapInstruction.accounts.map((key: RemainingAccount) => ({
          pubkey: new PublicKey(key.pubkey),
          isSigner: key.isSigner,
          isWritable: key.isWritable,
        })),
        data: Buffer.from(swapInstruction.data, "base64"),
    });

    return {
        ix_jupiterSwap,
        jupiterLookupTables: addressLookupTableAccounts,
    };
}