import fastify from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import apiBlocks from "./endpoints/blocks";
import apiMine from "./endpoints/mine";
import apiTransact from "./endpoints/transact";
import apiTransactionPool from "./endpoints/transaction-pool";
import apiMineTransactions from "./endpoints/mine-transactions";

/**
 * Here's the endpoints routing
 * @param server fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>
 */
export default function router(
    server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>
) {
    /**
     * Retrieve a list of the blocks in the blockchain
     */
    server.get("/api/blocks", apiBlocks);

    /**
     * Retrieve a list of the transactions from the pool
     */
    server.get("/api/transaction-pool", apiTransactionPool);

    /**
     * Mine a block with the provided transactions
     */
    server.post("/api/mine", apiMine);

    /**
     * Conduct a transaction
     */
    server.post("/api/transact", apiTransact);

    /**
     * Mine transactions
     */
    server.post("/api/mine-transactions", apiMineTransactions);
}
