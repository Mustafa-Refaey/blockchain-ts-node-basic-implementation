import { TransactionPool } from "./transaction-pool";
import { Wallet } from "./wallet";

export { Transaction, TransactionInput, TransactionOutput } from "./transaction";
export { TransactionPool, TransactionsMap } from "./transaction-pool";
export { Wallet } from "./wallet";

// Here are the tasks that should run on wallet boot
export function walletBoot() {
    TransactionPool.setInstance();
    Wallet.setInstance();
}
