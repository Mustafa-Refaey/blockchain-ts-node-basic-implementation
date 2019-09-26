import apiBoot from "./api";
import { appBoot } from "./app-boot";
import { communicatorBoot } from "./app/communicator";
import { transactionMinerBoot } from "./app/transaction-miner";
import { blockchainBoot } from "./blockchain";
import { walletBoot } from "./wallet";

blockchainBoot();

walletBoot();

communicatorBoot();

transactionMinerBoot();

apiBoot();

appBoot();
