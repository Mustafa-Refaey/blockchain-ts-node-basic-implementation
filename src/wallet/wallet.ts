import { ec } from "elliptic";
import { Transaction } from ".";
import { Block } from "../blockchain";
import { STARTING_BALANCE } from "../config";
import cryptoHash from "../utils/crypto-hash";

export class Wallet {
    private static walletInstance: Wallet;
    balance: number;
    publicKey: string;
    keyPair: ec.KeyPair;

    /**
     * generate the keyPair
     * initiate the publicKey from the generated keyPair
     * initiate the balance
     */
    constructor() {
        const EC = new ec("secp256k1");
        this.keyPair = EC.genKeyPair();
        this.publicKey = <string>this.keyPair.getPublic().encode("hex", true);
        this.balance = STARTING_BALANCE;
    }

    static setInstance() {
        Wallet.walletInstance = new Wallet();
    }

    static getInstance(): Wallet {
        return Wallet.walletInstance;
    }

    /**
     * hashes and signs the provided data
     *
     * @param data string
     * @returns ec.Signature
     */
    sign(data: string): ec.Signature {
        return this.keyPair.sign(cryptoHash(data));
    }

    /**
     * create a transaction with the wallet
     *
     * @throws Error "You must set the amount!"
     * @throws Error "Amount exceeds balance"
     *
     * @param recipientAddress string
     * @param amount number
     * @returns Transaction
     */
    createTransaction(recipientAddress: string, amount: number, chain?: Block[]): Transaction {
        if (chain) {
            this.balance = Wallet.calculateBalance(chain, this.publicKey);
        }

        if (amount <= 0) {
            throw new Error("You must set the amount!");
        }

        // check if amount is greater than the balance
        if (amount > this.balance) {
            throw new Error("Amount exceeds balance");
        }

        return Transaction.createTransaction(this, recipientAddress, amount);
    }

    /**
     * Calculate the balance of an address
     *
     * @param chain Block[]
     * @param address string
     * @returns number
     */
    static calculateBalance(chain: Block[], address: string): number {
        let balance = 0,
            addressMadeTransaction = false;

        for (let i = chain.length - 1; i >= 0; i--) {
            const block = chain[i];

            const transactions = block.data;
            for (const transaction of transactions) {
                if (transaction.output[address]) {
                    balance += transaction.output[address];

                    if (transaction.input.address === address) {
                        addressMadeTransaction = true;
                    }
                }
            }

            if (addressMadeTransaction) {
                break;
            }
        }

        return addressMadeTransaction ? balance : balance + STARTING_BALANCE;
    }
}
