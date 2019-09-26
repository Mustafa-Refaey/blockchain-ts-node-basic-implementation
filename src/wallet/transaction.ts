import { ec } from "elliptic";
import uuid from "uuid";
import { Wallet } from ".";
import { MINING_REWARD_AMOUNT, MINING_REWARD_INPUT } from "../config";
import verifySignature from "../utils/verify-signature";

export type TransactionOutput = {
    [key: string]: number;
};

export type TransactionInput = {
    timestamp?: number;
    amount?: number;
    signature?: ec.Signature;
    address: string;
};

export class Transaction {
    id: string;
    input: TransactionInput;
    output: TransactionOutput;

    /**
     * initiate the `id` with an uuid version 1
     */
    private constructor() {
        this.id = uuid.v1();
    }

    /**
     * create and return a transaction using the provided parameters
     *
     * @param senderWallet Wallet
     * @param recipientAddress string
     * @param amount number
     */
    static createTransaction(
        senderWallet: Wallet,
        recipientAddress: string,
        amount: number
    ): Transaction {
        const transaction = new Transaction();

        transaction.output = Transaction.createTransactionOutput(
            senderWallet,
            recipientAddress,
            amount
        );

        transaction.input = Transaction.createTransactionInput(senderWallet, transaction.output);

        return transaction;
    }

    /**
     * create and return a reward transaction for a miner wallet
     *
     * @param minerWallet Wallet
     * @returns Transaction
     */
    static createRewardTransaction(minerWallet: Wallet): Transaction {
        const transaction = new Transaction();

        transaction.input = MINING_REWARD_INPUT;

        transaction.output = {};
        transaction.output[minerWallet.publicKey] = MINING_REWARD_AMOUNT;

        return transaction;
    }

    /**
     * return the sender output
     *
     * @returns number
     */
    getSenderOutput(): number {
        return this.output[this.input.address];
    }

    /**
     * calculate and return the total output
     *
     * @returns number
     */
    getTotalOutput(): number {
        return Object.values(this.output).reduce((total: number, amount: number) => total + amount);
    }

    /**
     * calculate and return the recipients' total output
     *
     * @returns number
     */
    getAllRecipientsOutput(): number {
        return this.getTotalOutput() - this.getSenderOutput();
    }

    /**
     * update a transaction using the provided parameters
     *
     * @throws Error "You must set the amount!"
     * @throws Error "Amount exceeds your balance!"
     * @throws Error "You can not send to yourself!"
     *
     * @param senderWallet Wallet
     * @param recipientAddress string
     * @param amount number
     *
     * @returns TransactionInput
     */
    update(senderWallet: Wallet, recipientAddress: string, amount: number) {
        if (amount <= 0) {
            throw new Error("You must set the amount!");
        }

        if (amount > this.getSenderOutput()) {
            throw new Error("Amount exceeds your balance!");
        }

        if (recipientAddress === this.input.address) {
            throw new Error("You can not send to yourself!");
        }

        if (this.output[recipientAddress]) {
            this.output[recipientAddress] += amount;
        } else {
            this.output[recipientAddress] = amount;
        }

        this.output[this.input.address] -= amount;

        this.input.signature = senderWallet.sign(JSON.stringify(this.output));
    }

    /**
     * create and return a transaction output
     * using the provided parameters
     *
     * @param senderWallet Wallet
     * @param recipientAddress string
     * @param amount number
     *
     * @returns TransactionInput
     */
    static createTransactionOutput(
        senderWallet: Wallet,
        recipientAddress: string,
        amount: number
    ): TransactionOutput {
        const transactionOutput: TransactionOutput = {};

        transactionOutput[recipientAddress] = amount;
        transactionOutput[senderWallet.publicKey] = senderWallet.balance - amount;

        return transactionOutput;
    }

    /**
     * create and return a transaction input
     * using the provided parameters
     *
     * @param senderWallet Wallet
     * @param transactionOutput TransactionOutput
     * @returns TransactionInput
     */
    static createTransactionInput(
        senderWallet: Wallet,
        transactionOutput: TransactionOutput
    ): TransactionInput {
        return {
            timestamp: Date.now(),
            address: senderWallet.publicKey,
            amount: senderWallet.balance,
            signature: senderWallet.sign(JSON.stringify(transactionOutput))
        };
    }

    /**
     * validate a transaction.
     *
     * a transaction is valid if it pass these conditions:
     * - input value equals the output value
     * - signature is valid
     *
     * @param transaction Transaction
     * @returns boolean
     */
    static validateTransaction(transaction: Transaction): boolean {
        // check if input value equals the output value
        if (transaction.getTotalOutput() !== transaction.input.amount) {
            return false;
        }

        // verify signature
        if (
            !verifySignature(
                transaction.input.address,
                transaction.input.signature,
                JSON.stringify(transaction.output)
            )
        ) {
            return false;
        }

        return true;
    }
}
