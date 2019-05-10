import {genCommentItemById} from "./utils/genCommentItemById";
import {genPostItemById} from "./utils/genPostItemById";
import {config} from "./config/config";

export class PubSub {
    public ipfs: IIPFS;

    constructor(ipfs: IIPFS) {
        this.ipfs = ipfs;
    }

    public async init() {
        this.ipfs.pubsub.subscribe(config.topic, this.handlerMsg.bind(this));
    }

    private async handlerMsg(msg: any) {
        const data = JSON.parse(msg.data.toString());
        if (data.type === "index") {
            // merge data
            // TODO 新数据放最上面，单个节点虽多放 1024/节点数 个
            const indexStr = await this.ipfs.files.read("/starfire/index");
            const indexJSON: string[] = JSON.parse(indexStr.toString());
            const uniqueIndex = indexJSON.concat(data.data).filter((v, i, a) => a.indexOf(v) === i);
            if (uniqueIndex.length > 1024) {
                uniqueIndex.splice(0, uniqueIndex.length - 1024);
            }

            // update index file
            this.ipfs.files.write("/starfire/index", Buffer.from(JSON.stringify(uniqueIndex)), {
                create: true,
                parents: true,
            });

            // render post list
            if (!document.getElementById("indexList")) {
                return;
            }

            document.getElementById("indexList").innerHTML = "";
            uniqueIndex.forEach(async (postId) => {
                await genPostItemById(postId, this.ipfs);
            });

        } else if (data.type === "comment") {
            const postPath = `/starfire/posts/${data.data.postId}`;
            const commentsStr = await this.ipfs.files.read(postPath);
            const commentsJSON: string[] = JSON.parse(commentsStr.toString());

            // TODO 新数据放最上面，单个节点虽多放 1024/节点数 个
            const uniqueComments = commentsJSON.concat(data.data.ids).filter((v, i, a) => a.indexOf(v) === i);

            // update post file
            this.ipfs.files.write(postPath, Buffer.from(JSON.stringify(uniqueComments)), {
                create: true,
                parents: true,
            });

            // render post list
            if (!document.getElementById("comments")) {
                return;
            }
            document.getElementById("comments").innerHTML = "";
            uniqueComments.forEach(async (commentId) => {
                await genCommentItemById(commentId, this.ipfs);
            });
        }
    }
}
