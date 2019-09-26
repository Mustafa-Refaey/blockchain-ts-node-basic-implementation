import { FastifyReply, FastifyRequest } from "fastify";
import { ServerResponse } from "http";
import { Communicator } from "../../app/communicator";
import { Blockchain } from "../../blockchain";
import { Transaction } from "../../wallet";
import jsonResponse from "../utils/json-response";

/**
 * Mine a block with the provided transactions
 *
 * Payload format {
 *      data: Transaction[]
 * }
 * Response format
 * {
 *      status: boolean,
 *      newBlock: Block
 * }
 *
 * @param req FastifyRequest
 * @param res FastifyReply<ServerResponse>
 */
export default function apiMine(req: FastifyRequest, res: FastifyReply<ServerResponse>) {
    const transactionsList: Transaction[] = req.body.data;

    const blockchain = Blockchain.getInstance();
    const communicator = Communicator.getInstance();

    // add a new block to the blockchain
    // with the transactions list
    const newBlock = blockchain.addBlock(transactionsList);

    // broadcast the local chain to other peers
    communicator.broadcastChain();

    jsonResponse(res, {
        status: true,
        newBlock
    });
}
