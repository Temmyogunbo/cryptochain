const Transaction = require('../wallet/transaction')
class TransactionMiner {
  constructor( { blockchain, transactionPool, wallet, pubsub }) {
    this.blockchain = blockchain
    this.tranasactionPool = transactionPool
    this.wallet = wallet
    this.pubsub = pubsub
  }
  mineTransaction() {
    // get valid transactions
    const validTransactions = this.tranasactionPool.validTransactions()

    //generate miners reward
    validTransactions.push(

      Transaction.rewardTransaction({ minerWallet: this.wallet})
    )

    //add a block consisting of the transactions to the blochchain
    this.blockchain.addBlock({ data: validTransactions})

    //broadchact the updated blockchain
    this.pubsub.broadcastChain()

    //clear the pool
    this.tranasactionPool.clear()

  }
}

module.exports = TransactionMiner