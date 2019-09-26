import { Blockchain } from "./blockchain";

export { Block } from "./block";
export { Blockchain } from "./blockchain";

// Here are the tasks that should run on blockchain boot
export function blockchainBoot() {
    Blockchain.setInstance();
}
