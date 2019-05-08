import ipfsClient from "ipfs-http-client";
import "../assets/scss/index.scss";
import {PubSub} from "./PubSub";
import {genCommentItemById} from "./utils/genCommentItemById";
import {publishUser} from "./utils/publishUser";

const ipfs = ipfsClient("localhost", "5001", {protocol: "http"});
const postId = location.search.split("=")[1];
const init = async () => {
    if (!localStorage.userId) {
        window.location.href = "init.html";
        return;
    }

    const result = await ipfs.dag.get(postId);
    document.getElementById("content").innerHTML = result.value.content;
    document.getElementById("title").innerHTML = result.value.title;
    document.getElementById("user").innerHTML = `<a href="home.html?id=${result.value.userId}">
        <img width="20" src="${result.value.userAvatar}"/> ${result.value.userName}
    </a>`;

    initAddComment();
    initComments();
    initPubSub(result.value.userId);

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
            userId: localStorage.userId,
            userAvatar: userJSON.avatar,
            userName: userJSON.name,
        });
        const commentId = cid.toBaseEncodedString();

        // send msg
        const postStr = await ipfs.files.read(`/starfire/posts/${postId}`);
        const postJSON = JSON.parse(postStr.toString());
        postJSON.push(commentId)
        ipfs.pubsub.publish(`starfire-posts-${postId}`, Buffer.from(postJSON));

        // update user file
        userJSON.latestCommentId = commentId;
        publishUser(userJSON, ipfs);
    });
};

const initPubSub = async (userId: string) => {
    const pubsub = new PubSub(ipfs);
    await pubsub.init();
    const subscribeElement = document.getElementById("subscribe");

    if (userId === localStorage.userId) {
        subscribeElement.style.display = "none";
        return;
    }

    let hasSubscribe = false;
    const currentTopic = `starfire-posts-${postId}`;
    pubsub.topics.forEach((topic) => {
        if (topic == currentTopic) {
            hasSubscribe = true;
        }
    });

    if (hasSubscribe) {
        subscribeElement.setAttribute("data-subscribe", "true");
        subscribeElement.innerText = "取消订阅";
    } else {
        subscribeElement.setAttribute("data-subscribe", "false");
        subscribeElement.innerText = "订阅";
    }

    subscribeElement.addEventListener("click", async () => {
        if (subscribeElement.getAttribute("data-subscribe") === "true") {
            await pubsub.remove(currentTopic);
            subscribeElement.setAttribute("data-subscribe", "false");
            subscribeElement.innerText = "订阅";
        } else {
            await pubsub.add(currentTopic);
            subscribeElement.setAttribute("data-subscribe", "true");
            subscribeElement.innerText = "取消订阅";
        }
    });
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
