import hexToBinary from "hex-to-binary";
import { GENESIS_DATA, MINE_RATE } from "../config";
import cryptoHash from "../utils/crypto-hash";
import { Transaction } from "../wallet";

export class Block {
    data: Transaction[];
    timestamp: number;
    lastHash: string;
    hash: string;
    nonce: number;
    difficulty: number;

    constructor(block: Block) {
        this.timestamp = block.timestamp;
        this.lastHash = block.lastHash;
        this.hash = block.hash;
        this.data = block.data;
        this.nonce = block.nonce;
        this.difficulty = block.difficulty;
    }

    /**
     * create the genesis block and return it
     *
     * @returns Block
     */
    static genesis(): Block {
        return new Block(GENESIS_DATA);
    }

    /**
     * mine a block
     *
     * @param lastBlock Block
     * @param data Transaction[]
     * @returns Block
     */
    static mineBlock(lastBlock: Block, data: Transaction[]): Block {
        let timestamp, hash, difficulty;

        let nonce = 0;
        const lastHash = lastBlock.hash;

        // mine the block
        // by generating a hash that satisfies the difficulty
        do {
            // increment the nonce with every iteration
            nonce++;

            timestamp = Date.now();

            // adjust the difficulty in every iteration
            difficulty = Block.adjustDifficulty(lastBlock, timestamp);

            // generate the hash
            hash = cryptoHash(
                lastHash,
                timestamp.toString(),
                JSON.stringify(data),
                nonce.toString(),
                difficulty.toString()
            );

            // check if the generated hash satisfies the difficulty
        } while (hexToBinary(hash).substring(0, difficulty) != "0".repeat(difficulty));

        return new Block({
            timestamp,
            lastHash,
            data,
            nonce,
            difficulty,
            hash
        });
    }

    /**
     * adjusts the difficulty of mining and returns it
     *
     * @param originalBlock Block
     * @param timestamp number
     * @returns number
     */
    static adjustDifficulty(originalBlock: Block, timestamp: number = Date.now()): number {
        let difficulty = 1;

        // difficulty failsafe check
        if (originalBlock.difficulty >= 1) {
            if (timestamp - originalBlock.timestamp > MINE_RATE) {
                // the last block is later than the mine rate, decrement the difficulty
                difficulty = originalBlock.difficulty - 1;
            } else {
                // the last block is sooner than the mine rate, increment the difficulty
                difficulty = originalBlock.difficulty + 1;
            }

            // difficulty failsafe check
            if (difficulty < 1) {
                difficulty = 1;
            }
        }

        return difficulty;
    }
}
