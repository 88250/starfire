import {config} from "./config/config";
import {Post} from "./Post";
import {PubSub} from "./PubSub";
import {genPostItemById} from "./utils/genPostItemById";
import {ipfs} from "./utils/initIPFS";
import {getSpam} from "./utils/filterSpam";

class Starfire {
    public ipfs: IIPFS;

    constructor() {
        this.ipfs = ipfs;

        this.init();

        const pubsub = new PubSub(this.ipfs);
        pubsub.init();

        const post = new Post(this.ipfs);
        post.init();
    }

    public async init() {
        try {
            const indexStr = await this.ipfs.files.read("/starfire/index");
            const indexJSON = JSON.parse(indexStr.toString());
            const blackList = await getSpam()
            indexJSON.forEach(async (id: string, i: number) => {
                const blacklistId = await genPostItemById(id, this.ipfs, blackList);
                if (blacklistId) {
                    indexJSON.splice(i, 1)
                }
            });

            await this.ipfs.files.rm("/starfire/index")
            this.ipfs.files.write("/starfire/index", Buffer.from(JSON.stringify(indexJSON)), {
                create: true,
                parents: true,
            });

        } catch (e) {
            this.ipfs.files.write("/starfire/index", Buffer.from(JSON.stringify([])), {
                create: true,
                parents: true,
            });
        }
    }
}

export default Starfire;
