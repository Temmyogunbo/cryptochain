const PubNub = require('pubnub');

const credentials = {
  publishKey: 'pub-c-189195b9-3fa5-4702-80bf-594b3dc0b5b1',
  subscribeKey: 'sub-c-2ed3fdfa-f5f0-11ea-afa2-4287c4b9a283',
  secretKey: 'sec-c-OGZhNzBlMDMtNmIzMS00MGY3LTk0NDctYTk3OWJhOWJmMzY3'

}

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
}
class PubSub {
  constructor() {
    this.pubnub = new PubNub(credentials);

    this.pubnub.subscribe({ channels: Object.values(CHANNELS)});

    this.pubnub.addListener(this.listener())
  }

  listener() {
    return {
      message:  messageObject => {
        const { channel, message } = messageObject;

        console.log(`Message received. Channels: ${channel}. Message: ${message}`)
      }
    }
  }

  publish({channel, message }) {
    this.pubnub.publish({ channel, message })
  }
}

module.exports = PubSub