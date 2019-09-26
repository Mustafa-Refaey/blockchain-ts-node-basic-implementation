import { Block, Blockchain } from ".";
import cryptoHash from "../utils/crypto-hash";
import { Wallet } from "../wallet";

describe("Blockchain", () => {
    let blockchain: Blockchain, newBlockchain: Blockchain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newBlockchain = new Blockchain();
    });

    it("contains a property named `chain` of type `Array`", () => {
        expect(blockchain).toHaveProperty("chain");
        expect(blockchain.chain).toBeInstanceOf(Array);
    });

    it("starts with the genesis block", () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    describe("addBlock()", () => {
        it("adds a new block to the chain", () => {
            const newBlockData = [new Wallet().createTransaction("j-recipient", 64)];
            blockchain.addBlock(newBlockData);

            let chainLength = blockchain.chain.length;
            expect(blockchain.chain[chainLength - 1]).toBeInstanceOf(Block);
            expect(blockchain.chain[chainLength - 1].data).toEqual(newBlockData);
        });
    });

    describe("isValidChain()", () => {
        beforeEach(() => {
            blockchain.addBlock([new Wallet().createTransaction("x-recipient", 40)]);
            blockchain.addBlock([new Wallet().createTransaction("y-recipient", 50)]);
            blockchain.addBlock([new Wallet().createTransaction("z-recipient", 60)]);
        });

        describe("when the chain does not start with the genesis block", () => {
            it("returns false", () => {
                blockchain.chain[0].data = [new Wallet().createTransaction("b-recipient", 19)];
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe("when the chain starts with the genesis block and has multiple blocks", () => {
            describe("and the `lastHash` of one of the blocks is invalid", () => {
                it("returns false", () => {
                    blockchain.chain[2].lastHash = "invalid-hash";
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe("and a field of one of the blocks is invalid", () => {
                it("returns false", () => {
                    blockchain.chain[2].data = [
                        new Wallet().createTransaction("foo-recipient", 10)
                    ];
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe("and and the chain has no invalid blocks", () => {
                it("returns true", () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });

            describe("and the chain contains a block with a jumped `difficulty`", () => {
                it("returns false", () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length - 1];
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [new Wallet().createTransaction("x-recipient", 20)];
                    const difficulty = lastBlock.difficulty - 3;
                    const lastHash = lastBlock.hash;
                    const hash = cryptoHash(
                        timestamp.toString(),
                        nonce.toString(),
                        JSON.stringify(data),
                        difficulty.toString(),
                        lastHash
                    );

                    const badBlock = new Block({
                        timestamp,
                        nonce,
                        data,
                        difficulty,
                        lastHash,
                        hash
                    });
                    blockchain.chain.push(badBlock);
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
        });
    });

    describe("replaceChain", () => {
        let originalChain: Block[];

        beforeEach(() => {
            blockchain.addBlock([new Wallet().createTransaction("a-recipient", 24)]);
            blockchain.addBlock([new Wallet().createTransaction("s-recipient", 23)]);
            blockchain.addBlock([new Wallet().createTransaction("d-recipient", 22)]);

            originalChain = blockchain.chain;
        });
        describe("when the new chain is not longer", () => {
            it("does not replace the chain", () => {
                newBlockchain.addBlock([new Wallet().createTransaction("f-recipient", 54)]);

                blockchain.replaceChain(newBlockchain.chain);
                expect(blockchain.chain).toEqual(originalChain);
            });
        });

        describe("when the new chain is longer", () => {
            beforeEach(() => {
                newBlockchain.addBlock([new Wallet().createTransaction("a-recipient", 24)]);
                newBlockchain.addBlock([new Wallet().createTransaction("s-recipient", 23)]);
                newBlockchain.addBlock([new Wallet().createTransaction("d-recipient", 22)]);
                newBlockchain.addBlock([new Wallet().createTransaction("i-recipient", 102)]);
            });

            describe("and the new chain is not valid", () => {
                it("does not replace the chain", () => {
                    newBlockchain.chain[2].lastHash = "invalid-hash";

                    blockchain.replaceChain(newBlockchain.chain);
                    expect(blockchain.chain).toEqual(originalChain);
                });
            });
            describe("and the new chain is valid", () => {
                it("replaces the chain", () => {
                    blockchain.replaceChain(newBlockchain.chain);
                    expect(blockchain.chain).toEqual(newBlockchain.chain);
                });
            });
        });
    });
});
