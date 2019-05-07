import {genPostItemById} from "./utils/genPostItemById";
import {publishUser} from "./utils/publishUser";
import {genCommentItemById} from "./utils/genCommentItemById";

export class PubSub {
    public ipfs: IIPFS;
    public topics: string[];

    constructor(ipfs: IIPFS) {
        this.ipfs = ipfs;
    }

    public async init() {
        const userStr = await this.ipfs.files.read(`/starfire/users/${localStorage.userId}`);
        const userJSON = JSON.parse(userStr.toString());
        this.topics = userJSON.topics
        userJSON.topics.forEach((topic: string) => {
            console.log(topic)
            this.ipfs.pubsub.subscribe(topic, this.handlerMsg.bind(this));
        })
    }

    private async handlerMsg(msg: any) {
        const id = msg.data.toString();
        if (!id) {
            return;
        }

        const topic = msg.topicIDs[0]

        if (topic === 'starfire-index') {

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
        } else if (topic.indexOf('starfire-posts-') === 0) {
            await genCommentItemById(id, this.ipfs);

            // update post file
            const postId = topic.split('-')[2]
            const postPath = `/starfire/posts/${postId}`;
            const commentsStr = await this.ipfs.files.read(postPath);
            const commentsJSON = JSON.parse(commentsStr.toString());
            commentsJSON.push(id);
            await this.ipfs.files.write(postPath, Buffer.from(JSON.stringify(commentsJSON)), {
                create: true,
                parents: true,
            });
        } else if (topic.indexOf('starfire-users') === 0) {
            // TODO
        }
    }

    public async add(topic: string) {
        const path = `/starfire/users/${localStorage.userId}`
        const userStr = await this.ipfs.files.read(path);
        const userJSON = JSON.parse(userStr.toString());
        userJSON.topics.push(topic)
        this.topics = userJSON.topics

        publishUser(userJSON, this.ipfs)
    }

    public async remove(topic: string) {
        const path = `/starfire/users/${localStorage.userId}`
        const userStr = await this.ipfs.files.read(path);
        const userJSON = JSON.parse(userStr.toString());

        debugger
        userJSON.topics.forEach((t: string, i: number) => {
            if (t === topic) {
                userJSON.topics.splice(i, 1)
            }
        })

        this.topics = userJSON.topics
        publishUser(userJSON, this.ipfs)
    }
}
