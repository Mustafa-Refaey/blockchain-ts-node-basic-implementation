import { Block } from "./blockchain";
import { TransactionInput } from "./wallet/transaction";

export const INITIAL_DIFFICULTY = 3;

export const MINE_RATE = 1000;

export const DEFAULT_PORT = 3000;

export const STARTING_BALANCE = 5000;

export const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

export const GENESIS_DATA: Block = {
    timestamp: 1,
    lastHash: "---",
    hash: "hash-genesis",
    data: [],
    nonce: 0,
    difficulty: INITIAL_DIFFICULTY
};

export const MINING_REWARD_INPUT: TransactionInput = { address: "*special-reward-transaction*" };

export const MINING_REWARD_AMOUNT: number = 20;
