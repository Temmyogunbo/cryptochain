const { GENESIS_DATA, MINE_RATE } = require('../config')
const { cryptoHash } = require('../util');
const hexToBinary = require('hex-to-binary');

class Block {
  constructor({ timestamp, lastHash, hash, data, difficulty, nonce }) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.difficulty = difficulty;
    this.nonce = nonce;
  }

  static genesis(){
    return new Block(GENESIS_DATA)
  }

  static mineBlock({lastBlock, data}) {
    let hash, timestamp, difficulty;
    const lastHash = lastBlock.hash;
    let nonce = 0;

    // each block goes through a level of difficulty before mined
    // the higher the difficulty it more computational time it takes to mine a block
    do{
      nonce ++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp })
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
    }while(hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty))

    return new Block({
      timestamp,
      lastHash,
      data,
      nonce,
      difficulty,
      hash,
    })
  }

  static adjustDifficulty({originalBlock, timestamp}) {
    const { difficulty } = originalBlock;
    const difference = timestamp - originalBlock.timestamp;
    if (difficulty < 1) return 1;
    if (difference > MINE_RATE) return difficulty - 1
    return difficulty + 1
  }
}

module.exports = Block