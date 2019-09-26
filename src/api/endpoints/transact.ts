import { FastifyReply, FastifyRequest } from "fastify";
import { ServerResponse } from "http";
import { Communicator } from "../../app/communicator";
import { Transaction, TransactionPool, Wallet } from "../../wallet";
import jsonResponse from "../utils/json-response";

/**
 * Conduct a transaction
 * 
 * Payload format {
 *      amount: number
 *      recipientAddress: string
 * }
 * Response format
 * {
 *      status: boolean,
 *      transaction?: Transaction
 *      message?: string
 * }
 *
 * @param req FastifyRequest
 * @param res FastifyReply<ServerResponse>
 */
export default function apiTransact(req: FastifyRequest, res: FastifyReply<ServerResponse>) {
    const amount: number = Number.parseFloat(req.body.amount) || 0;
    const recipientAddress: string = req.body.recipient;

    const transactionPool = TransactionPool.getInstance();
    const communicator = Communicator.getInstance();
    const wallet = Wallet.getInstance();

    let transaction: Transaction | null;

    try {
        // get the transaction if exists
        transaction = transactionPool.findTransaction(wallet.publicKey);
        if (transaction) {
            // the transaction exists, update it
            transaction.update(wallet, recipientAddress, amount);
        } else {
            // the transaction does not exist, create it
            transaction = wallet.createTransaction(recipientAddress, amount);
        }
    } catch (err) {
        return jsonResponse(
            res,
            {
                status: false,
                message: <string>err.message
            },
            400
        );
    }

    // add the transaction to the pool
    transactionPool.addTransaction(transaction);

    // broadcast the transaction to other peers
    communicator.broadcastTransaction(transaction);

    jsonResponse(res, {
        status: true,
        transaction
    });
}
