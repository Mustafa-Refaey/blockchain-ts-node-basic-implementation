import { Blockchain } from "../blockchain";
import { Transaction, TransactionPool, Wallet } from "../wallet";
import { Communicator } from "./communicator";

export class TransactioMiner {
    private static transactioMinerInstance: TransactioMiner;
    blockchain: Blockchain;
    transactionPool: TransactionPool;
    wallet: Wallet;
    communicator: Communicator;

    constructor(
        blockchain: Blockchain,
        transactionPool: TransactionPool,
        wallet: Wallet,
        communicator: Communicator
    ) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.communicator = communicator;
    }

    static setInstance() {
        TransactioMiner.transactioMinerInstance = new TransactioMiner(
            Blockchain.getInstance(),
            TransactionPool.getInstance(),
            Wallet.getInstance(),
            Communicator.getInstance()
        );
    }

    static getInstance(): TransactioMiner {
        return TransactioMiner.transactioMinerInstance;
    }

    /**
     * Mine valid transactions from the pool and add them to the blockchain
     * along with the mining reward
     */
    mineTransactions() {
        // get valid transactions from the pool
        const transactions = this.transactionPool.validTransactions();

        // add the reward transaction to the list of transactions
        transactions.push(Transaction.createRewardTransaction(this.wallet));

        // add a block to the blockchain with the list of transactions
        this.blockchain.addBlock(transactions);

        // broadcast the local chain to other peers
        this.communicator.broadcastChain();

        // clear the transactions pool
        this.transactionPool.clearTransactions();
    }
}

// Here are the tasks that should run on communicator boot
export function transactionMinerBoot() {
    TransactioMiner.setInstance();
}
