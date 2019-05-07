export class PubSub {
    public ipfs: IIPFS;
    private topic: string

    constructor(ipfs: IIPFS) {
        this.ipfs = ipfs;
    }

    public init(topic: string) {
        this.topic = topic

        this.ipfs.pubsub.subscribe(topic, async (msg: any) => {
            const id = msg.data.toString()
            if (!id) {
                return
            }
            const result = await this.ipfs.dag.get(id);
            document.getElementById("list").insertAdjacentHTML("beforeend",
                `<li>
    <a href="home.html?id=${result.value.userId}">${result.value.userId}</a>:
    <a href="detail.html?id=${id}">${result.value.title}</a>
</li>`)
        })
    }
}
