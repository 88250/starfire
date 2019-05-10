import {ipfs} from "./utils/initIPFS";
import {Post} from "./Post";
import {PubSub} from "./PubSub";
import {genPostItemById} from "./utils/genPostItemById";

class Starfire {
    public ipfs: IIPFS;

    constructor() {
        this.ipfs = ipfs
        this.isInit();

        this.init();

        const pubsub = new PubSub(this.ipfs);
        pubsub.init();

        const post = new Post(this.ipfs);
        post.init();
    }

    public isInit() {
        if (!localStorage.userId) {
            window.location.href = "init.html";
        }
    }

    public async init() {
        try {
            const indexStr = await this.ipfs.files.read("/starfire/index");
            const indexJSON = JSON.parse(indexStr.toString());
            indexJSON.forEach(async (id: string) => {
                await genPostItemById(id, this.ipfs);
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
