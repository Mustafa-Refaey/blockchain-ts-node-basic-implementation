import { Blockchain } from "../blockchain";
import { Wallet } from "../wallet";
const blockchain = new Blockchain();

blockchain.addBlock([new Wallet().createTransaction("foo-recipient", 10)]);

const times = [];

for (let i = 0; i < 1000; i++) {
    const prevBlock = blockchain.chain[blockchain.chain.length - 1];

    blockchain.addBlock([new Wallet().createTransaction("foo-recipient", 10)]);
    const newBlock = blockchain.chain[blockchain.chain.length - 1];

    const miningDuration = Math.round(newBlock.timestamp - prevBlock.timestamp);
    times.push(miningDuration);

    const totalTime = times.reduce((total: number, currTime: number) => total + currTime);
    const averageTime = Math.round(totalTime / times.length);

    console.log(
        `Mining duration: [${miningDuration}]ms. Difficulty: [${
            newBlock.difficulty
        }]. Mining average time: [${averageTime}]ms`
    );
}
