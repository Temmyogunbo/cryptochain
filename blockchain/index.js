const Block = require('./block');
const Wallet = require('../wallet')

const Transaction = require('../wallet/transaction')
const { cryptoHash } = require('../util')
const {REWARD_INPUT, MINING_REWARD } = require('../config')

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()]
  }

  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data
    });

    this.chain.push(newBlock)
  }

  static isValidChain(chain) {
    if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false

    for (let i  = 1; i < chain.length; i++) {
      const {timestamp, data, hash, lastHash, nonce, difficulty} = chain[i];

      const actualLastHash = chain[i -1].hash;
      const lastDifficulty = chain[i - 1].difficulty;

      if(actualLastHash !== lastHash) return false

      const validatedHash = cryptoHash(data, lastHash, timestamp, nonce, difficulty);

      if(hash !== validatedHash) return false
      if(Math.abs(lastDifficulty - difficulty > 1)) return false
    }
    return true
  }

  // not static cosreplace chain base on individual instance
  replaceChain(chain, validateTransactions, onSuccess) {
    //enforce rule before replace chain
    if(chain.length <= this.chain.length) {
      console.error('Incoming chain must be longer')
      return;
    }
    if (!Blockchain.isValidChain(chain)) {
      console.error('Incoming chain must valid')
      return;
    }

    if(validateTransactions && !this.validTransactionData({ chain})) {
      console.error('The incoming chain has invalid data')
      return
    }

    if(onSuccess) onSuccess()

    console.log('Replacing chain with', this.chain)
    this.chain = chain
  }

  // this is part of the rule of crytocurrentcy
  validTransactionData({ chain }) {

    for(let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const transactionSet = new Set()
      let rewardTransactionCount = 0;

      for(const transaction of block.data) {
        //check if it's a reward transaction
        if(transaction.input.address === REWARD_INPUT.address) {
          rewardTransactionCount += 1;

          if(rewardTransactionCount > 1) {
            console.error('Miner reward exceeds limit')
            return false
          }
          //reward tranction only has one value
          if(Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
            console.error('Miner reward amount is invalid');
            return false
          }
        } else {
          if(!Transaction.validTransaction(transaction)) {
            console.error('Invalid transaction');
            return false
          }
          const trueBalance = Wallet.calculateBalance({
            chain: this.chain,
            address: transaction.input.address
          })

          if(trueBalance !== transaction.input.amount) {
            console.error('Invalid input amount')
            return false
          }

          if(transactionSet.has(transaction)) {
            console.error('An identical transaction ppears more than once in the block')
            return false
          } else {
            transactionSet.add(transaction)
          }
        }
      }
    }
    return true
  }
}

module.exports = Blockchain