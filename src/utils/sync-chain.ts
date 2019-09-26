import request from "request";
import { Block, Blockchain } from "../blockchain";
import { ROOT_NODE_ADDRESS } from "../config";

/**
 * synchronize the local blockchain with the root node's one
 *
 * @param blockchain Blockchain
 */
export function syncChain(blockchain: Blockchain) {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, res, body) => {
        if (!error && res.statusCode === 200 && res.body.status) {
            const rootChain: Block[] = JSON.parse(body).chain;
            if (rootChain) {
                console.log("replace chain on sync", rootChain);
                blockchain.replaceChain(rootChain);
            }
        }
    });
}
