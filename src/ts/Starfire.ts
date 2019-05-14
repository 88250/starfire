import pugTpl from "../pug/index.pug";
import {Post} from "./Post";
import {getSpam} from "./utils/filterSpam";
import {genPostItemById} from "./utils/genPostItemById";
import {ipfs} from "./utils/initIPFS";
import {loaded} from "./utils/initPage";
import {renderPug} from "./utils/renderPug";

class Starfire {
    public ipfs: IIPFS;

    constructor() {
        this.ipfs = ipfs;

        this.init();

        const post = new Post(this.ipfs);
        post.init();
    }

    public async init() {
        renderPug(pugTpl);
        let indexStr = '[]'

        try {
            indexStr = await this.ipfs.files.read("/starfire/index");
        } catch (e) {
            console.warn(e);
        }

        const indexJSON = JSON.parse(indexStr.toString());
        const blackList = await getSpam();
        indexJSON.forEach(async (id: string, i: number) => {
            const blacklistId = await genPostItemById(id, this.ipfs, blackList);
            if (blacklistId) {
                indexJSON.splice(i, 1);
            }
        });

        this.ipfs.files.write("/starfire/index", Buffer.from(JSON.stringify(indexJSON)), {
            create: true,
            parents: true,
            truncate: true
        });

        loaded(this.ipfs);
    }
}

export default Starfire;
