import {genPostItemById} from "./utils/genPostItemById";

export class PubSub {
    public ipfs: IIPFS;
    private topic: string;

    constructor(ipfs: IIPFS) {
        this.ipfs = ipfs;
    }

    public init(topic: string) {
        this.topic = topic;

        this.ipfs.pubsub.subscribe(topic, async (msg: any) => {
            const id = msg.data.toString();
            if (!id) {
                return;
            }

            await genPostItemById(id, this.ipfs);

            const indexStr = await this.ipfs.files.read("/starfire/index");
            const indexJSON = JSON.parse(indexStr.toString());

            // TODO: index filter the same id, same link domain
            indexJSON.push(id);
            if (indexJSON.length > 1024) {
                indexJSON.splice(0, indexJSON.length - 1024);
            }

            this.ipfs.files.write("/starfire/index", Buffer.from(JSON.stringify(indexJSON)), {
                create: true,
                parents: true,
            });
        });
    }
}
