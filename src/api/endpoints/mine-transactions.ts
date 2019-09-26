import { FastifyReply, FastifyRequest } from "fastify";
import { ServerResponse } from "http";
import jsonResponse from "../utils/json-response";
import { TransactioMiner } from "../../app/transaction-miner";

/**
 * Mine transactions
 * 
 * Response format
 * {
 *      status: boolean
 * }
 *
 * @param req FastifyRequest
 * @param res FastifyReply<ServerResponse>
 */
export default function apiMineTransactions(req: FastifyRequest, res: FastifyReply<ServerResponse>) {
    TransactioMiner.getInstance().mineTransactions();

    jsonResponse(res, { status: true });
}
