import { FastifyReply, FastifyRequest } from "fastify";
import { ServerResponse } from "http";
import { TransactionPool } from "../../wallet";
import jsonResponse from "../utils/json-response";

/**
 * Retrieve a list of the transactions from the pool
 *
 * Response format
 * {
 *      status: boolean,
 *      transactions: Transaction[]
 * }
 *
 * @param req FastifyRequest
 * @param res FastifyReply<ServerResponse>
 */
export default function apiTransactionPool(req: FastifyRequest, res: FastifyReply<ServerResponse>) {
    const transactionPool = TransactionPool.getInstance();

    jsonResponse(res, {
        status: true,
        transactions: transactionPool.transactions
    });
}
