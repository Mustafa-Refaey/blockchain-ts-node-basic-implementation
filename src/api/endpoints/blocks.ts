import { FastifyReply, FastifyRequest } from "fastify";
import { ServerResponse } from "http";
import { Blockchain } from "../../blockchain";
import jsonResponse from "../utils/json-response";

/**
 * Retrieve a list of the blocks in the blockchain
 *
 * Response format
 * {
 *      status: boolean,
 *      chain: Block[]
 * }
 */
export default function apiBlocks(req: FastifyRequest, res: FastifyReply<ServerResponse>) {
    const blockchain = Blockchain.getInstance();
    jsonResponse(res, {
        status: true,
        chain: blockchain.chain
    });
}
