import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "../assets/scss/detail.scss";
import pugTpl from "../pug/detail.pug";
import {config} from "./config/config";
import {getSpam} from "./utils/filterSpam";
import {genCommentItemById} from "./utils/genCommentItemById";
import {getIPFSGateway} from "./utils/getIPFSGateway";
import {ipfs} from "./utils/initIPFS";
import {loaded} from "./utils/initPage";
import {publishUser} from "./utils/publishUser";
import {renderPug} from "./utils/renderPug";
import {sign, verify} from "./utils/sign";
import {sortObject} from "./utils/tools/sortObject";

dayjs.extend(relativeTime);

const postId = location.search.split("=")[1];
const init = async () => {
    renderPug(pugTpl);

    const result = await ipfs.dag.get(postId);
    const postObj: IPost = result.value;
    const signature = postObj.signature;
    delete postObj.signature;
    const isMatch = await verify(JSON.stringify(sortObject(postObj)), postObj.publicKey, signature);
    if (!isMatch) {
        return;
    }

    document.getElementById("title").innerHTML = result.value.title;
    document.getElementById("meta").innerHTML = `<a class="name" href="${config.homePath}?id=${result.value.userId}">
        ${result.value.userName}
    </a>
    <time class="time">
        ${dayjs().to(dayjs(result.value.time))}
    </time>`;
    document.getElementById("content").innerHTML = result.value.content || "No Content";
    const gateway = await getIPFSGateway(ipfs);
    document.getElementById("user").innerHTML = `<a href="${config.homePath}?id=${result.value.userId}">
        <img class="avatar" src="${gateway}/ipfs/${result.value.userAvatar}"/>
    </a>`;

    document.getElementById("currentUser").innerHTML = `<a href="${config.homePath}">
        <img class="avatar" src="${gateway}/ipfs/${localStorage.userAvatar || config.defaultAvatar}"/>
    </a>`;

    let currentUserNameHTML = `<a class="name" href="${config.settingPath}">
       Please go Setting Account
    </a>`;
    if (localStorage.userName) {
        currentUserNameHTML = `<a class="name" href="${config.homePath}">
        ${localStorage.userName}
    </a>`;
    }
    document.getElementById("currentUserName").innerHTML = currentUserNameHTML;

    initAddComment();
    initComments();
    loaded(ipfs);
};

const initAddComment = () => {
    document.getElementById("commentBtn").addEventListener("click", async () => {
        if (!localStorage.userId) {
            window.location.href = config.settingPath;
            return;
        }
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
        let postStr = "[]";
        try {
            postStr = await ipfs.files.read(`/starfire/posts/${postId}`);
        } catch (e) {
            console.warn(e);
        }
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

        // clear input
        (document.getElementById("commentContent") as HTMLInputElement).value = "";
        (document.getElementById("privateKey") as HTMLInputElement).value = "";
    });
};

const initComments = async () => {
    const path = `/starfire/posts/${postId}`;
    try {
        const blackList = await getSpam();
        const commentsStr = await ipfs.files.read(path);
        const commentsJSON = JSON.parse(commentsStr.toString());
        commentsJSON.forEach((async (commentId: string, i: number) => {
            const blacklistId = await genCommentItemById(commentId, ipfs, blackList);
            if (blacklistId) {
                commentsJSON.splice(i, 1);
            }
        }));

        ipfs.files.write(path, Buffer.from(JSON.stringify(commentsJSON)), {
            create: true,
            parents: true,
            truncate: true,
        });
    } catch (e) {
        console.warn(e);
    }
};

init();
