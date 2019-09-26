import { Transaction } from ".";
import { Block } from "../blockchain";

export type TransactionsMap = {
    [key: string]: Transaction;
};

export class TransactionPool {
    private static transactionPoolInstance: TransactionPool;
    transactions: TransactionsMap;

    /**
     * initiate the transaction pool
     */
    constructor() {
        this.transactions = {};
    }

    static setInstance() {
        TransactionPool.transactionPoolInstance = new TransactionPool();
    }

    static getInstance(): TransactionPool {
        return TransactionPool.transactionPoolInstance;
    }

    /**
     * add a transaction to the `transactions` pool
     *
     * @param transaction Transaction
     */
    addTransaction(transaction: Transaction) {
        this.transactions[transaction.id] = transaction;
    }

    /**
     * set the `transactions` pool with the provided one
     *
     * @param transactions TransactionsMap
     */
    setTransactions(transactions: TransactionsMap) {
        this.transactions = transactions;
    }

    /**
     * search for a transaction using the sender wallet's address
     * and return it, otherwise return null
     *
     * @param senderWalletPublicKey string
     * @returns Transaction | null
     */
    findTransaction(senderWalletPublicKey: string): Transaction | null {
        return (
            Object.values(this.transactions).find(
                (transaction: Transaction) => transaction.input.address === senderWalletPublicKey
            ) || null
        );
    }

    /**
     * check transactions and return valid ones
     * @returns Transaction[] valid transactions
     */
    validTransactions(): Transaction[] {
        return Object.values(this.transactions).filter((transaction: Transaction) =>
            Transaction.validateTransaction(transaction)
        );
    }

    /**
     *  remove all `transactions` from the pool
     */
    clearTransactions() {
        this.transactions = {};
    }

    /**
     * remove the provided blockchains' transactions from the `transactions` pool
     *
     * @param chain Block[]
     */
    clearBlockchainTransactions(chain: Block[]) {
        for (const block of chain) {
            const transactions = block.data;
            for (const transaction of transactions) {
                if (this.transactions[transaction.id]) {
                    delete this.transactions[transaction.id];
                }
            }
        }
    }
}
