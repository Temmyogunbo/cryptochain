const redis = require('redis');

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION'
}
class PubSub {
  constructor({ blockchain, transactionPool, wallet }) {
    // we we have publisher and subscriber in the same class so it can perform both
    this.publisher = redis.createClient('redis://localhost:6379');
    this.subscriber = redis.createClient('redis://localhost:6379');
    this.blockchain = blockchain
    this.transactionPool = transactionPool
    this.wallet = wallet

    this.subscribeToChannels()

    this.subscriber.on('message',  (channel, message) => this.handleMessage(channel,message))
  }

  handleMessage(channel, message) {
    console.log(`Message received. Channel: ${channel}. Message: ${message}`);

    const parsedMessage = JSON.parse(message);

    switch(channel) {
      case CHANNELS.BLOCKCHAIN:
        this.blockchain.replaceChain(parsedMessage, true, () => {
          this.transactionPool.clearBlockchainTransactions({
            chain: parsedMessage
          })
        })
        break
      case CHANNELS.TRANSACTION:
        if(!this.transactionPool.existingTransaction({
          inputAddress: this.wallet.publicKey
        })) {
          this.transactionPool.setTransaction(parsedMessage)
        }
        break
      default:
        return

    }
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach(channel => {
      this.subscriber.subscribe(channel)
    })
  }

  publish({ channel, message }){
    this.subscriber.unsubscribe(channel, () => {
      this.publisher.publish(channel, message, () => {
        this.subscriber.subscribe(channel);
      })
    })
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      // we can only send string
      message: JSON.stringify(this.blockchain.chain)
    })
  }

  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction)

    })
  }
}

module.exports = PubSub