const Blockchain = require('../blockchain');

const blockchain = new Blockchain();

blockchain.addBlock({ data: 'initial' });
console.log('first block', blockchain.chain[blockchain.chain.length - 1])

let prevTimestamp, nextTimestamp, nextBlock, timeDifff, average

const times = [];

for(let i = 0; i < 10000; i++) {
  prevTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp;

  blockchain.addBlock({data: `block ${i}`});

  nextBlock = blockchain.chain[blockchain.chain.length - 1];

  nextTimestamp = nextBlock.timestamp;
  timeDifff = nextTimestamp - prevTimestamp;
  times.push(timeDifff);

  average = times.reduce((total, num) => (total + num))/times.length

  console.log(`Time to mine block: ${timeDifff}ms. Difficulty: ${nextBlock.difficulty}. Average time ${average}ms`)
}