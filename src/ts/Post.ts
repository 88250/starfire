import Vditor from "vditor";
import {config} from "./config/config";
import {getVditorConfig} from "./utils/getVditorConfig";
import {isNodeIdPost} from "./utils/isNodeIdPost";
import {showMsg} from "./utils/msg";
import {publishUser} from "./utils/publishUser";
import {sign, verify} from "./utils/sign";
import {sortObject} from "./utils/tools/sortObject";

export class Post {
    private ipfs: IIPFS;
    private editor: IVditorConstructor;

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

        const isMatchNodeId = isNodeIdPost(localStorage.publicKey, localStorage.userId);
        if (!isMatchNodeId) {
            showMsg("用户身份校验失败");
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

        if (postObj.content.length > 1048576 || postObj.content.length < 4) {
            showMsg("内容长度限制 4-1048576 字符");
            return;
        }

        if (postObj.title.length > 512 || postObj.title.length < 4) {
            showMsg("标题长度限制 4-512 字符");
            return;
        }

        const signature = await sign(JSON.stringify(sortObject(postObj)));
        if (!signature) {
            showMsg("该密钥对不可用");
            return;
        }

        const isMatch = await verify(JSON.stringify(sortObject(postObj)), postObj.publicKey, signature);
        if (!isMatch) {
            showMsg("该密钥对不可用");
            return;
        }
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
