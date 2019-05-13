import "../assets/scss/index.scss";
import {config} from "./config/config";
import {PubSub} from "./PubSub";
import {genCommentItemById} from "./utils/genCommentItemById";
import {ipfs} from "./utils/initIPFS";
import {publishUser} from "./utils/publishUser";
import {sign, verify} from "./utils/sign";
import {sortObject} from "./utils/tools/sortObject";
import {getSpam} from "./utils/filterSpam";
import {renderPug} from "./utils/renderPug";
import pugTpl from "../pug/detail.pug";
import {loaded} from "./utils/loading";

const postId = location.search.split("=")[1];
const init = async () => {
    renderPug(pugTpl)

    const pubsub = new PubSub(ipfs);
    pubsub.init();

    const result = await ipfs.dag.get(postId);
    const postObj: IPost = result.value;
    const signature = postObj.signature;
    delete postObj.signature;
    const isMatch = await verify(JSON.stringify(sortObject(postObj)), postObj.publicKey, signature);
    if (!isMatch) {
        return;
    }

    document.getElementById("content").innerHTML = result.value.content;
    document.getElementById("title").innerHTML = result.value.title;
    document.getElementById("user").innerHTML = `<a href="home.html?id=${result.value.userId}">
        <img width="20" src="${result.value.userAvatar}"/> ${result.value.userName}
    </a>`;

    initAddComment();
    initComments();
    loaded()
};

const initAddComment = () => {
    document.getElementById("commentBtn").addEventListener("click", async () => {
        const userPath = `/starfire/users/${localStorage.userId}`;
        const userStr = await ipfs.files.read(userPath);
        const userJSON = JSON.parse(userStr.toString());

        const commentObj: IComment = {
            content: (document.getElementById("commentContent") as HTMLInputElement).value,
            postId,
            previousId: userJSON.latestCommentId,
            publicKey: localStorage.publicKey,
            time: new Date().getTime(),
            userAvatar: userJSON.avatar,
            userId: localStorage.userId,
            userName: userJSON.name,
        };

        const signature = await sign(JSON.stringify(sortObject(commentObj)));
        commentObj.signature = signature;

        const cid = await ipfs.dag.put(commentObj);
        const commentId = cid.toBaseEncodedString();

        // send msg
        const postStr = await ipfs.files.read(`/starfire/posts/${postId}`);
        const postJSON = JSON.parse(postStr.toString());
        postJSON.push(commentId);
        const publishObj = {
            data: {
                ids: postJSON,
                postId,
            },
            type: "comment",
        };
        ipfs.pubsub.publish(config.topic, Buffer.from(JSON.stringify(publishObj)));

        // update user file
        userJSON.latestCommentId = commentId;
        publishUser(userJSON, ipfs);
    });
};

const initComments = async () => {
    const path = `/starfire/posts/${postId}`
    try {
        const blackList = await getSpam()
        const commentsStr = await ipfs.files.read(path);
        const commentsJSON = JSON.parse(commentsStr.toString());
        commentsJSON.forEach((async (commentId: string, i:number) => {
            const blacklistId = await genCommentItemById(commentId, ipfs, blackList);
            if (blacklistId) {
                commentsJSON.splice(i, 1)
            }
        }));

        await ipfs.files.rm(path)
        ipfs.files.write(path, Buffer.from(JSON.stringify(commentsJSON)), {
            create: true,
            parents: true,
        });
    } catch (e) {
        ipfs.files.write(path,
            Buffer.from("[]"), {
                create: true,
                parents: true,
            });
    }
};

init();
