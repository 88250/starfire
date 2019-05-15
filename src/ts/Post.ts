import Vditor from "vditor";
import {config} from "./config/config";
import {getVditorConfig} from "./utils/getVditorConfig";
import {publishUser} from "./utils/publishUser";
import {sign} from "./utils/sign";
import {sortObject} from "./utils/tools/sortObject";

export class Post {
    private ipfs: IIPFS;
    private editor: any;

    constructor(ipfs: IIPFS) {
        this.ipfs = ipfs;
    }

    public init() {
        this.initVditor();
        document.getElementById("postBtn").addEventListener("click", () => {
            this.add();
        });
    }

    public initVditor() {
        this.editor = new Vditor("postContent", getVditorConfig());
    }

    public async add() {
        if (!localStorage.userId) {
            window.location.href = config.settingPath;
            return;
        }
        const path = `/starfire/users/${localStorage.userId}`;
        const userStr = await this.ipfs.files.read(path);
        const userJSON = JSON.parse(userStr.toString());

        const postObj: IPost = {
            content: this.editor.getValue(),
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
        this.ipfs.pubsub.publish(config.topic, Buffer.from(JSON.stringify(publishObj)));

        // add post file
        this.ipfs.files.write(`/starfire/posts/${postId}`,
            Buffer.from("[]"), {
                create: true,
                parents: true,
                truncate: true,
            });

        // update user file
        userJSON.latestPostId = postId;
        publishUser(userJSON, this.ipfs);

        // clear input
        this.editor.setValue("");
        (document.getElementById("postTitle") as HTMLInputElement).value = "";
        (document.getElementById("privateKey") as HTMLInputElement).value = "";
    }
}
