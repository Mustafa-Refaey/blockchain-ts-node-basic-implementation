import { Blockchain } from "./blockchain";
import { syncChain } from "./utils/sync-chain";
import { syncTransactions } from "./utils/sync-transactions";
import { TransactionPool } from "./wallet";

// Here are the tasks that should run on app boot
export function appBoot() {
    if (process.env.GENERATE_PEER_PORT === "true") {
        syncChain(Blockchain.getInstance());
        syncTransactions(TransactionPool.getInstance());
    }
}
