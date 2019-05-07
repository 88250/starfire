export class PubSub {
    public ipfs: IIPFS;

    constructor(ipfs: IIPFS) {
        this.ipfs = ipfs;
    }

    public init() {
        const topic = 'index'
        const receiveMsg = (msg: any) => console.log(msg.data.toString())

        this.ipfs.pubsub.subscribe(topic, receiveMsg, (err: Error) => {
            if (err) {
                return console.error(`failed to subscribe to ${topic}`, err)
            }
            console.log(`subscribed to ${topic}`)
        })
    }
}
