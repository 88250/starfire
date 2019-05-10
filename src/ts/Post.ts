import {publishUser} from "./utils/publishUser";
import {sign} from "./utils/sign";
import {sortObject} from "./utils/tools/sortObject";

// import JSEncrypt from 'jsencrypt'

export class Post {
    private ipfs: IIPFS;

    constructor(ipfs: IIPFS) {
        this.ipfs = ipfs;
    }

    public init() {
        document.getElementById("postBtn").addEventListener("click", () => {
            this.add();
        });
    }

    public async add() {
        const path = `/starfire/users/${localStorage.userId}`;
        const userStr = await this.ipfs.files.read(path);
        const userJSON = JSON.parse(userStr.toString());

        const postObj: IPost = {
            content: (document.getElementById("postContent") as HTMLInputElement).value,
            previousId: userJSON.latestPostId,
            publicKey: localStorage.publicKey,
            time: new Date().getTime(),
            title: (document.getElementById("postTitle") as HTMLInputElement).value,
            type: 0,
            userAvatar: userJSON.avatar,
            userId: localStorage.userId,
            userName: userJSON.name,
        };

        const signature = await sign(JSON.stringify(sortObject(postObj)));
        console.log(JSON.stringify(sortObject(postObj)))
        postObj.signature = signature;

        const cid = await this.ipfs.dag.put(postObj);
        const postId = cid.toBaseEncodedString();

        // send msg
        const indexStr = await this.ipfs.files.read("/starfire/index");
        const indexJSON = JSON.parse(indexStr.toString());
        indexJSON.push(postId);
        const publishObj = {
            data: indexJSON,
            type: "index",
        };
        this.ipfs.pubsub.publish("starfire", Buffer.from(JSON.stringify(publishObj)));

        // add post file
        this.ipfs.files.write(`/starfire/posts/${postId}`,
            Buffer.from(JSON.stringify([])), {
                create: true,
                parents: true,
            });

        // update user file
        userJSON.latestPostId = postId;
        userJSON.topics.push(`starfire-posts-${postId}`);
        publishUser(userJSON, this.ipfs);
    }
}
