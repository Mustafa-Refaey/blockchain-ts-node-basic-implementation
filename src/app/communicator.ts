import { createClient, RedisClient } from "redis";
import { Blockchain, Block } from "../blockchain";
import { Transaction, TransactionPool } from "../wallet";

export const CHANNELS = {
    TEST: "TEST",
    BLOCKCHAIN: "BLOCKCHAIN",
    TRANSACTION: "TRANSACTION"
};

export class Communicator {
    private static communicatorInstance: Communicator;
    publisher: RedisClient;
    subscriber: RedisClient;
    blockchain: Blockchain;
    transactionPool: TransactionPool;

    constructor(blockchain: Blockchain, transactionPool: TransactionPool) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;

        // create the publisher client
        this.publisher = createClient();

        // create the subscriber client
        this.subscriber = createClient();

        // subscribe to all channels
        this.subscribeToChannels();

        // handle incoming messages
        this.subscriber.on("message", (channel: string, message: string) =>
            this.handleMessage(channel, message)
        );
    }

    static setInstance() {
        Communicator.communicatorInstance = new Communicator(
            Blockchain.getInstance(),
            TransactionPool.getInstance()
        );
    }

    static getInstance(): Communicator {
        return Communicator.communicatorInstance;
    }

    /**
     * Handling incoming messages
     * @param channel string
     * @param message string
     */
    handleMessage(channel: string, message: string) {
        console.log(`Message received. Channel: ${channel}. Message: ${message}`);

        const messageParsed = JSON.parse(message);
        switch (channel) {
            case CHANNELS.BLOCKCHAIN:
                this.blockchain.replaceChain(<Block[]>messageParsed, (chain: Block[]) =>
                    this.transactionPool.clearBlockchainTransactions(chain)
                );
                break;
            case CHANNELS.TRANSACTION:
                this.transactionPool.addTransaction(<Transaction>messageParsed);
                break;
        }
    }

    /**
     * subscribe to all channels
     */
    subscribeToChannels() {
        for (const channel of Object.values(CHANNELS)) {
            this.subscriber.subscribe(channel);
        }
    }

    /**
     * publish a message to a channel
     */
    publish(channel: string, message: string) {
        this.publisher.publish(channel, message);
    }

    /**
     * broadcast local chain to other peers
     */
    broadcastChain() {
        this.subscriber.unsubscribe(CHANNELS.BLOCKCHAIN);
        this.publish(CHANNELS.BLOCKCHAIN, JSON.stringify(this.blockchain.chain));
        this.subscriber.subscribe(CHANNELS.BLOCKCHAIN);
    }

    /**
     * broadcast a transaction to other peers
     */
    broadcastTransaction(transaction: Transaction) {
        this.subscriber.unsubscribe(CHANNELS.TRANSACTION);
        this.publish(CHANNELS.TRANSACTION, JSON.stringify(transaction));
        this.subscriber.subscribe(CHANNELS.TRANSACTION);
    }
}

// Here are the tasks that should run on communicator boot
export function communicatorBoot() {
    Communicator.setInstance();
}
