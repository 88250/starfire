import "../assets/scss/index.scss";
import {PubSub} from "./PubSub";
import {genCommentItemById} from "./utils/genCommentItemById";
import {ipfs} from "./utils/initIPFS";
import {publishUser} from "./utils/publishUser";
import {verify} from "./utils/sign";
import {sortObject} from "./utils/tools/sortObject";
import {config} from "./config/config"

const postId = location.search.split("=")[1];
const init = async () => {
    if (!localStorage.userId) {
        window.location.href = `${config.publicPath}init.html`;
        return;
    }

    const result = await ipfs.dag.get(postId);
    const postObj: IPost = result.value;
    const signature = postObj.signature;
    delete postObj.signature;
    const isMatch = await verify(JSON.stringify(sortObject(postObj)), postObj.publicKey, signature);

    if (!isMatch) {
        alert("数据被串改");
        return;
    }

    document.getElementById("content").innerHTML = result.value.content;
    document.getElementById("title").innerHTML = result.value.title;
    document.getElementById("user").innerHTML = `<a href="home.html?id=${result.value.userId}">
        <img width="20" src="${result.value.userAvatar}"/> ${result.value.userName}
    </a>`;

    initAddComment();
    initComments();
    initPubSub();

};

const initAddComment = () => {
    document.getElementById("commentBtn").addEventListener("click", async () => {
        const userPath = `/starfire/users/${localStorage.userId}`;
        const userStr = await ipfs.files.read(userPath);
        const userJSON = JSON.parse(userStr.toString());

        const cid = await ipfs.dag.put({
            content: (document.getElementById("commentContent") as HTMLInputElement).value,
            postId,
            previousId: userJSON.latestCommentId,
            time: new Date().getTime(),
            userAvatar: userJSON.avatar,
            userId: localStorage.userId,
            userName: userJSON.name,
        });
        const commentId = cid.toBaseEncodedString();

        // send msg
        const postStr = await ipfs.files.read(`/starfire/posts/${postId}`);
        const postJSON = JSON.parse(postStr.toString());
        postJSON.push(commentId);
        ipfs.pubsub.publish(config.topic, Buffer.from(JSON.stringify(postJSON)));

        // update user file
        userJSON.latestCommentId = commentId;
        publishUser(userJSON, ipfs);
    });
};

const initPubSub = async () => {
    const pubsub = new PubSub(ipfs);
    await pubsub.init();
};

const initComments = async () => {
    try {
        const commentsStr = await ipfs.files.read(`/starfire/posts/${postId}`);
        const commentsJSON = JSON.parse(commentsStr.toString());
        commentsJSON.forEach((async (commentId: string) => {
            genCommentItemById(commentId, ipfs);
        }));
    } catch (e) {
        ipfs.files.write(`/starfire/posts/${postId}`,
            Buffer.from(JSON.stringify([])), {
                create: true,
                parents: true,
            });
    }
};

init();
