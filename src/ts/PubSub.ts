import {genCommentItemById} from "./utils/genCommentItemById";
import {genPostItemById} from "./utils/genPostItemById";
import {publishUser} from "./utils/publishUser";

export class PubSub {
    public ipfs: IIPFS;
    public topics: string[];

    constructor(ipfs: IIPFS) {
        this.ipfs = ipfs;
    }

    public async init() {
        const userStr = await this.ipfs.files.read(`/starfire/users/${localStorage.userId}`);
        const userJSON = JSON.parse(userStr.toString());
        this.topics = userJSON.topics;
        userJSON.topics.forEach((topic: string) => {
            this.ipfs.pubsub.subscribe(topic, this.handlerMsg.bind(this));
        });
    }

    public async add(topic: string) {
        const path = `/starfire/users/${localStorage.userId}`;
        const userStr = await this.ipfs.files.read(path);
        const userJSON = JSON.parse(userStr.toString());
        userJSON.topics.push(topic);
        this.topics = userJSON.topics;

        this.ipfs.pubsub.subscribe(topic, this.handlerMsg.bind(this));
        publishUser(userJSON, this.ipfs);
    }

    public async remove(topic: string) {
        const path = `/starfire/users/${localStorage.userId}`;
        const userStr = await this.ipfs.files.read(path);
        const userJSON = JSON.parse(userStr.toString());

        userJSON.topics.forEach((t: string, i: number) => {
            if (t === topic) {
                userJSON.topics.splice(i, 1);
            }
        });

        this.topics = userJSON.topics;

        this.ipfs.pubsub.unsubscribe(topic)
        publishUser(userJSON, this.ipfs);
    }

    private async handlerMsg(msg: any) {
        const id = msg.data.toString();
        if (!id) {
            return;
        }

        const topic = msg.topicIDs[0];

        if (topic === "starfire-index") {
            // merge data
            const indexStr = await this.ipfs.files.read("/starfire/index");
            const indexJSON: string[] = JSON.parse(indexStr.toString());
            const uniqueIndex = indexJSON.concat(JSON.parse(id)).filter((v, i, a) => a.indexOf(v) === i);
            if (uniqueIndex.length > 1024) {
                uniqueIndex.splice(0, uniqueIndex.length - 1024);
            }

            // render post list
            document.getElementById("indexList").innerHTML = "";
            uniqueIndex.forEach(async (postId) => {
                await genPostItemById(postId, this.ipfs);
            });

            // update index file
            this.ipfs.files.write("/starfire/index", Buffer.from(JSON.stringify(uniqueIndex)), {
                create: true,
                parents: true,
            });
        } else if (topic.indexOf("starfire-posts-") === 0) {
            const postPath = `/starfire/posts/${topic.split("-")[2]}`;
            const commentsStr = await this.ipfs.files.read(postPath);
            const commentsJSON: string[] = JSON.parse(commentsStr.toString());
            const uniqueComments = commentsJSON.concat(JSON.parse(id)).filter((v, i, a) => a.indexOf(v) === i);

            // render post list
            document.getElementById("comments").innerHTML = "";
            uniqueComments.forEach(async (commentId) => {
                await genCommentItemById(commentId, this.ipfs);
            });

            // update post file
            this.ipfs.files.write(postPath, Buffer.from(JSON.stringify(uniqueComments)), {
                create: true,
                parents: true,
            });
        }
    }
}
