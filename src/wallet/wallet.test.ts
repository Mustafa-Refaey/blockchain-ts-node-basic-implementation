import { Transaction, Wallet } from ".";
import verifySignature from "../utils/verify-signature";
import { Blockchain } from "../blockchain";
import { STARTING_BALANCE } from "../config";

describe("Wallet", () => {
    let wallet: Wallet;
    beforeEach(() => {
        wallet = new Wallet();
    });

    it("has a `balance` property of type number", () => {
        expect(wallet).toHaveProperty("balance");
    });

    it("has a `publicKey` property of type string", () => {
        expect(wallet).toHaveProperty("publicKey");
    });

    describe("sign()", () => {
        const data = "data";

        it("should return a valid signature", () => {
            expect(verifySignature(wallet.publicKey, wallet.sign(data), data)).toBe(true);
        });
    });

    describe("createTransaction()", () => {
        let transaction: Transaction, recipientAddress: string, amount: number;

        describe("when the amount is zero", () => {
            it("should throw an error saying `You must set the amount!`", () => {
                recipientAddress = "recipient-public-key-for-create-transaction";
                amount = 0;

                expect(() => wallet.createTransaction(recipientAddress, amount)).toThrow(
                    "You must set the amount!"
                );
            });
        });

        describe("the `amount` exceeds the `balance`", () => {
            it("should throw an error", () => {
                recipientAddress = "recipient-public-key-for-create-transaction";
                amount = 99999;

                expect(() => wallet.createTransaction(recipientAddress, amount)).toThrow(
                    "Amount exceeds balance"
                );
            });
        });

        describe("the `amount` is valid", () => {
            beforeEach(() => {
                recipientAddress = "recipient-public-key-for-create-transaction";
                amount = 100;
                transaction = wallet.createTransaction(recipientAddress, amount);
            });

            it("should create and return an instance of `Transaction`", () => {
                expect(transaction).toBeInstanceOf(Transaction);
            });

            describe("the `transaction` returned should have a correct `output`", () => {
                it("should have the recipient and their amount", () => {
                    expect(transaction.output[recipientAddress]).toBe(amount);
                });

                it("should have the sender and their `balance - amount`", () => {
                    expect(transaction.output[wallet.publicKey]).toBe(wallet.balance - amount);
                });
            });

            describe("the `transaction` returned should have a correct `input`", () => {
                it("should have the `address` of the sender's `publicKey`", () => {
                    expect(transaction.input.address).toBe(wallet.publicKey);
                });

                it("should have the `amount` of the sender's `balance`", () => {
                    expect(transaction.input.amount).toBe(wallet.balance);
                });
            });
        });

        describe("a `chain` is passed", () => {
            it("should call Wallet.calculateBalance()", () => {
                // store Wallet.calculateBalance to restore it at the end of the test
                const originalCalculateBalance = Wallet.calculateBalance;

                // create a mock of Wallet.calculateBalance
                const calculateBalanceMock = jest.fn();
                Wallet.calculateBalance = calculateBalanceMock;

                wallet.createTransaction("foo-rcp", 30, new Blockchain().chain);

                // restore Wallet.calculateBalance
                Wallet.calculateBalance = originalCalculateBalance;

                expect(calculateBalanceMock).toHaveBeenCalled();
            });
        });
    });

    describe("calculateBalance()", () => {
        let blockchain: Blockchain;

        beforeEach(() => {
            blockchain = new Blockchain();
        });

        describe("the address hasn't sent or received any transactions", () => {
            it("return the `starting balance`", () => {
                expect(Wallet.calculateBalance(blockchain.chain, wallet.publicKey)).toEqual(
                    STARTING_BALANCE
                );
            });
        });

        describe("the address received but hasn't sent any transactions", () => {
            it("return the `starting balance` + `total received output`", () => {
                blockchain.addBlock([
                    new Wallet().createTransaction(wallet.publicKey, 200, blockchain.chain)
                ]);
                blockchain.addBlock([
                    new Wallet().createTransaction(wallet.publicKey, 200, blockchain.chain)
                ]);
                blockchain.addBlock([
                    new Wallet().createTransaction(wallet.publicKey, 200, blockchain.chain)
                ]);

                expect(Wallet.calculateBalance(blockchain.chain, wallet.publicKey)).toEqual(
                    STARTING_BALANCE + 600
                );
            });
        });

        describe("the address received and sent transactions", () => {
            it("return the `last sent transaction ouput` + `total received output after it`", () => {
                blockchain.addBlock([
                    new Wallet().createTransaction(wallet.publicKey, 200, blockchain.chain)
                ]);

                blockchain.addBlock([
                    new Wallet().createTransaction(wallet.publicKey, 200, blockchain.chain)
                ]);

                blockchain.addBlock([wallet.createTransaction("foo", 200, blockchain.chain)]);

                blockchain.addBlock([
                    new Wallet().createTransaction(wallet.publicKey, 200, blockchain.chain)
                ]);

                expect(Wallet.calculateBalance(blockchain.chain, wallet.publicKey)).toEqual(
                    STARTING_BALANCE + 400
                );
            });
        });

        describe("the address received and sent transactions in the same block", () => {
            it("return the `last sent transaction ouput` + `total received output after it`", () => {

                blockchain.addBlock([
                    new Wallet().createTransaction(wallet.publicKey, 200, blockchain.chain),
                    new Wallet().createTransaction(wallet.publicKey, 200, blockchain.chain),
                    wallet.createTransaction("foo", 200, blockchain.chain),
                    new Wallet().createTransaction(wallet.publicKey, 200, blockchain.chain)
                ]);

                expect(Wallet.calculateBalance(blockchain.chain, wallet.publicKey)).toEqual(
                    STARTING_BALANCE + 400
                );
            });
        });
    });
});
