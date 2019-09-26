import { Block } from ".";
import cryptoHash from "../utils/crypto-hash";
import { Transaction } from "../wallet";

export class Blockchain {
    private static blockchainInstance: Blockchain;
    chain: Block[];

    /**
     * initiates the `chain` with the genesis block
     */
    constructor() {
        this.chain = [Block.genesis()];
    }

    static setInstance() {
        Blockchain.blockchainInstance = new Blockchain();
    }

    static getInstance(): Blockchain {
        return Blockchain.blockchainInstance;
    }

    /**
     * Add a block to the chain with the provided
     * list of transactions as its `data`
     *
     * @param data Transaction[]
     * @returns Block
     */
    addBlock(data: Transaction[]): Block {
        const lastBlock = this.chain[this.chain.length - 1];
        const newBlock = Block.mineBlock(lastBlock, data);
        this.chain.push(newBlock);

        return newBlock;
    }

    /**
     * replaces the local chain with the provided one,
     * only if the provided chain is valid and longer
     *
     * @param chain Block[]
     */
    replaceChain(chain: Block[], onSuccess?: (chain: Block[]) => void) {
        if (chain.length > this.chain.length && Blockchain.isValidChain(chain)) {
            this.chain = chain;
            if (onSuccess) {
                onSuccess(chain);
            }
        }
    }

    /**
     * checks if the provided chain is valid
     * a chain considered valid if it pass these conditions
     * - it should start with the genesis block
     * - it should have difficulty change of 1 or -1
     * - it should have valid lastHash
     * - it should have valid hash
     *
     * @param chain Block[]
     * @returns boolean
     */
    static isValidChain(chain: Block[]): boolean {
        // check if it starts with the genesis block
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }

        for (let i = 1; i < chain.length; i++) {
            const currBlock = chain[i];
            const prevBlock = chain[i - 1];

            // check for difficulty jump
            if (Math.abs(currBlock.difficulty - prevBlock.difficulty) !== 1) {
                return false;
            }

            // check `lastHash` is valid
            if (currBlock.lastHash !== prevBlock.hash) {
                return false;
            }

            // check `hash`
            if (
                currBlock.hash !==
                cryptoHash(
                    JSON.stringify(currBlock.data),
                    currBlock.lastHash,
                    currBlock.nonce.toString(),
                    currBlock.difficulty.toString(),
                    currBlock.timestamp.toString()
                )
            ) {
                return false;
            }
        }
        return true;
    }
}
