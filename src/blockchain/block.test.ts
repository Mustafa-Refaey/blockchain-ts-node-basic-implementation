import hexToBinary from "hex-to-binary";
import { Block } from ".";
import { GENESIS_DATA, MINE_RATE } from "../config";
import cryptoHash from "../utils/crypto-hash";
import { Wallet } from "../wallet";

describe("Block", () => {
    const timestamp = 123123;
    const lastHash = "foo-hash";
    const hash = "bar-hash";
    const data = [new Wallet().createTransaction("foo-recipient", 10)];
    const nonce = 1;
    const difficulty = 1;

    const block = new Block({
        timestamp,
        lastHash,
        hash,
        nonce,
        difficulty,
        data
    });

    it("has a `timestamp` property", () => {
        expect(block.timestamp).toEqual(timestamp);
    });

    it("has a `lastHash` property", () => {
        expect(block.lastHash).toEqual(lastHash);
    });

    it("has a `hash` property", () => {
        expect(block.hash).toEqual(hash);
    });

    it("has a `data` property", () => {
        expect(block.data).toEqual(data);
    });

    it("has a `nonce` property", () => {
        expect(block.nonce).toEqual(nonce);
    });

    it("has a `difficulty` property", () => {
        expect(block.difficulty).toEqual(difficulty);
    });

    describe("genesis()", () => {
        const genesisBlock = Block.genesis();

        it("returns a Block instance", () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it("returns the genesis data", () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe("mineBlock()", () => {
        const lastBlock = Block.genesis();
        const data = [new Wallet().createTransaction("foo-recipient", 10)];
        const minedBlock = Block.mineBlock(lastBlock, data);

        it("returns a Block instance", () => {
            expect(minedBlock instanceof Block).toBe(true);
        });

        it("sets the `lastHash` to be the `hash of the lastBlock`", () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it("sets the `data`", () => {
            expect(minedBlock.data).toEqual(data);
        });

        it("sets a `timestamp`", () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it("creates a SHA-256 `hash` based on the proper inputs", () => {
            expect(minedBlock.hash).toEqual(
                cryptoHash(
                    lastBlock.hash,
                    JSON.stringify(data),
                    minedBlock.nonce.toString(),
                    minedBlock.difficulty.toString(),
                    minedBlock.timestamp.toString()
                )
            );
        });

        it("sets a hash that matches the `difficulty` criteria", () => {
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)).toEqual(
                "0".repeat(minedBlock.difficulty)
            );
        });

        it("adjusts the difficulty", () => {
            const possibleResults = [lastBlock.difficulty - 1, lastBlock.difficulty + 1];

            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        });
    });

    describe("adjustDifficulty()", () => {
        it("raises the `difficulty` when the block is mined too quickly", () => {
            block.difficulty = 4;
            expect(Block.adjustDifficulty(block, block.timestamp + MINE_RATE - 100)).toEqual(
                block.difficulty + 1
            );
        });

        it("lowers the `difficulty` when the block is mined too slowly", () => {
            block.difficulty = 4;
            expect(Block.adjustDifficulty(block, block.timestamp + MINE_RATE + 100)).toEqual(
                block.difficulty - 1
            );
        });

        it("has a lower limit of 1", () => {
            block.difficulty = 1;
            expect(Block.adjustDifficulty(block, block.timestamp + MINE_RATE + 100)).toBe(1);
        });

        describe("in case the previous block `difficulty` is less than 1", () => {
            it("has a lower limit of 1", () => {
                block.difficulty = -1;
                expect(Block.adjustDifficulty(block)).toBe(1);
            });
        });
    });
});
