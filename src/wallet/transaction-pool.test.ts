import { Transaction, TransactionPool, Wallet } from ".";
import { Blockchain } from "../blockchain";
import { TransactionsMap } from "./transaction-pool";

describe("TransactionPool", () => {
    let transactionPool: TransactionPool, transaction: Transaction, senderWallet: Wallet;

    beforeEach(() => {
        transactionPool = new TransactionPool();
        senderWallet = new Wallet();
        transaction = Transaction.createTransaction(senderWallet, "recipient-address", 100);
    });

    it("should have property `transactions`", () => {
        expect(transactionPool).toHaveProperty("transactions");
    });

    describe("addTransaction()", () => {
        it("should add a transaction", () => {
            transactionPool.addTransaction(transaction);
            expect(transactionPool.transactions).toHaveProperty(transaction.id);
            expect(transactionPool.transactions[transaction.id]).toBe(transaction);
        });
    });

    describe("findTransaction()", () => {
        it("should return null when transaction does not exist", () => {
            expect(transactionPool.findTransaction("non-existent-address")).toBe(null);
        });

        it("should return the transaction when it exists", () => {
            transactionPool.addTransaction(transaction);
            expect(transactionPool.findTransaction(senderWallet.publicKey)).toBe(transaction);
        });
    });

    describe("validTransactions()", () => {
        let validTransactions: Transaction[];

        beforeEach(() => {
            validTransactions = [];
            for (let i = 0; i < 10; i++) {
                transaction = Transaction.createTransaction(senderWallet, "foo-address", 30);

                if (i % 3 === 0) {
                    transaction.input.amount = 99999;
                } else if (i % 3 === 1) {
                    transaction.input.signature = new Wallet().sign("foo-data");
                } else {
                    validTransactions.push(transaction);
                }

                transactionPool.addTransaction(transaction);
            }
        });

        it("should return valid transactions", () => {
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        });
    });

    describe("clearTransactions()", () => {
        it("should empty the `transactions`", () => {
            transactionPool.clearTransactions();
            expect(transactionPool.transactions).toEqual({});
        });
    });

    describe("clearBlockchainTransactions()", () => {
        it("should remove the blockchain transaction from the pool `transactions`", () => {
            const blockchain = new Blockchain();
            const expectedTransactions: TransactionsMap = {};
            for (let i = 0; i < 10; i++) {
                transaction = new Wallet().createTransaction("foo-recipient", 70);
                transactionPool.addTransaction(transaction);
                if (i % 2 === 0) {
                    blockchain.addBlock([transaction]);
                } else {
                    expectedTransactions[transaction.id] = transaction;
                }
            }

            transactionPool.clearBlockchainTransactions(blockchain.chain);
            expect(transactionPool.transactions).toEqual(expectedTransactions);
        });
    });
});
