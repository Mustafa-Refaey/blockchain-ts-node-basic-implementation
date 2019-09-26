import { Transaction, TransactionInput, TransactionOutput, Wallet } from ".";
import { MINING_REWARD_AMOUNT, MINING_REWARD_INPUT } from "../config";
import verifySignature from "../utils/verify-signature";

describe("Transaction", () => {
    let transaction: Transaction, senderWallet: Wallet, recipientAddress: string, amount: number;

    beforeEach(() => {
        senderWallet = new Wallet();
        recipientAddress = "recipient-public-key";
        amount = 50;
        transaction = Transaction.createTransaction(senderWallet, recipientAddress, amount);
    });

    it("should have an `id`", () => {
        expect(transaction).toHaveProperty("id");
    });

    it("should have an `output`", () => {
        expect(transaction).toHaveProperty("output");
    });

    it("should have an `input`", () => {
        expect(transaction).toHaveProperty("input");
    });

    describe("createTransactionOutput()", () => {
        let transactionOutput: TransactionOutput;

        beforeEach(() => {
            transactionOutput = Transaction.createTransactionOutput(
                senderWallet,
                recipientAddress,
                amount
            );
        });

        it("should return `TransactionOutput` of the recipient and their amount", () => {
            expect(transactionOutput[recipientAddress]).toBe(amount);
        });

        it("should return `TransactionOutput` of the sender and their `balance - amount`", () => {
            expect(transactionOutput[senderWallet.publicKey]).toBe(senderWallet.balance - amount);
        });
    });

    describe("createTransactionInput()", () => {
        let transactionOutput: TransactionOutput, transactionInput: TransactionInput;

        beforeEach(() => {
            transactionOutput = Transaction.createTransactionOutput(
                senderWallet,
                recipientAddress,
                amount
            );

            transactionInput = Transaction.createTransactionInput(senderWallet, transactionOutput);
        });

        it("should return `TransactionInput` with the `address` of the sender's `publicKey`", () => {
            expect(transactionInput.address).toBe(senderWallet.publicKey);
        });

        it("should return `TransactionInput` with the `amount` of the sender's `balance`", () => {
            expect(transactionInput.amount).toBe(senderWallet.balance);
        });

        it("should return `TransactionInput` with the `timestamp` set", () => {
            expect(transactionInput).toHaveProperty("timestamp");
        });

        it("should return `TransactionInput` with a valid `signature` of the `transactionOutput`", () => {
            expect(
                verifySignature(
                    senderWallet.publicKey,
                    senderWallet.sign(JSON.stringify(transactionOutput)),
                    JSON.stringify(transactionOutput)
                )
            ).toBe(true);
        });
    });

    describe("validateTransaction()", () => {
        describe("when the transaction is valid", () => {
            it("should return true", () => {
                expect(Transaction.validateTransaction(transaction)).toBe(true);
            });
        });

        describe("when the transaction is invalid", () => {
            describe("the `output` is invalid", () => {
                it("should return false", () => {
                    transaction.output[senderWallet.publicKey] = 123123;
                    expect(Transaction.validateTransaction(transaction)).toBe(false);
                });
            });
            describe("the `input` is invalid", () => {
                it("should return false", () => {
                    let transactionOutput = Transaction.createTransactionOutput(
                        senderWallet,
                        recipientAddress,
                        amount
                    );
                    transaction.input.signature = new Wallet().sign(
                        JSON.stringify(transactionOutput)
                    );
                    expect(Transaction.validateTransaction(transaction)).toBe(false);
                });
            });
        });
    });

    describe("update()", () => {
        describe("when the amount is zero", () => {
            it("should throw an error saying `You must set the amount!`", () => {
                expect(() => transaction.update(senderWallet, recipientAddress, 0)).toThrow(
                    "You must set the amount!"
                );
            });
        });

        describe("when the amount is greater than the sender remaining balance", () => {
            it("should throw an error saying `Amount exceeds your balance!`", () => {
                expect(() =>
                    transaction.update(
                        senderWallet,
                        recipientAddress,
                        transaction.getSenderOutput() + 1
                    )
                ).toThrow("Amount exceeds your balance!");
            });
        });

        describe("when the recipient is the sender", () => {
            it("should throw an error saying `You can not send to yourself!`", () => {
                expect(() =>
                    transaction.update(senderWallet, transaction.input.address, amount)
                ).toThrow("You can not send to yourself!");
            });
        });

        describe("when the recipient is already in the output", () => {
            it("should add to their output", () => {
                const recipientOriginalOutput: number = transaction.output[recipientAddress];
                transaction.update(senderWallet, recipientAddress, amount);
                expect(transaction.output[recipientAddress]).toBe(recipientOriginalOutput + amount);
            });
        });

        describe("when the recipient is not in the output", () => {
            it("should add them to the output", () => {
                const anotherRecipientAddress: string = "another-recipient-public-key";
                transaction.update(senderWallet, anotherRecipientAddress, amount);
                expect(transaction.output[anotherRecipientAddress]).toBe(amount);
            });
        });

        it("should subtract the amount from the sender output", () => {
            const senderOriginalOutput: number = transaction.output[transaction.input.address];
            transaction.update(senderWallet, recipientAddress, amount);
            expect(transaction.output[transaction.input.address]).toBe(
                senderOriginalOutput - amount
            );
        });

        it("should maintain the validity of the transaction", () => {
            transaction.update(senderWallet, recipientAddress, amount);
            expect(Transaction.validateTransaction(transaction)).toBe(true);
        });
    });

    describe("createRewardTransaction()", () => {
        let rewardTransaction: Transaction, minerWallet: Wallet;
        beforeEach(() => {
            minerWallet = new Wallet();
            rewardTransaction = Transaction.createRewardTransaction(minerWallet);
        });

        it("should create a transaction with the mining reward input", () => {
            expect(rewardTransaction.input).toBe(MINING_REWARD_INPUT);
        });

        it("should create a transaction with the mining reward output", () => {
            expect(rewardTransaction.output[minerWallet.publicKey]).toBe(MINING_REWARD_AMOUNT);
        });
    });
});
