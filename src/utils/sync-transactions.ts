import request from "request";
import { ROOT_NODE_ADDRESS } from "../config";
import { TransactionPool, TransactionsMap } from "../wallet";

/**
 * synchronize the local pool with the root node's one
 *
 * @param transactionPool TransactionPool
 */
export function syncTransactions(transactionPool: TransactionPool) {
    request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool` }, (error, res, body) => {
        if (!error && res.statusCode === 200 && res.body.status) {
            const rootTransactions: TransactionsMap = JSON.parse(body).transactions;
            if (rootTransactions) {
                console.log("replace transactions on sync", rootTransactions);
                transactionPool.setTransactions(rootTransactions);
            }
        }
    });
}
