import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Vditor from "vditor";
import {escapeHtml} from "xss";
import pugTpl from "../pug/detail.pug";
import {config} from "./config/config";
import {getSpam} from "./utils/filterSpam";
import {genCommentItemById} from "./utils/genCommentItemById";
import {getIPFSGateway} from "./utils/getIPFSGateway";
import {getUserAvatar, getUserLink} from "./utils/getUserHTML";
import {getVditorConfig} from "./utils/getVditorConfig";
import {ipfs} from "./utils/initIPFS";
import {loaded} from "./utils/initPage";
import {mdParse, mdRender} from "./utils/mdRender";
import {showMsg} from "./utils/msg";
import {publishUser} from "./utils/publishUser";
import {renderPug} from "./utils/renderPug";
import {sign, verify} from "./utils/sign";
import {sortObject} from "./utils/tools/sortObject";

dayjs.extend(relativeTime);

const postId = location.search.split("=")[1];
let editor: any;

const init = async () => {
    renderPug(pugTpl);
    editor = new Vditor("commentContent", getVditorConfig());

    const result = await ipfs.dag.get(postId);
    const postObj: IPost = result.value;
    const signature = postObj.signature;
    delete postObj.signature;
    const isMatch = await verify(JSON.stringify(sortObject(postObj)), postObj.publicKey, signature);
    if (!isMatch) {
        return;
    }

    document.getElementById("title").innerHTML = escapeHtml(result.value.title || "No Title");
    document.getElementById("meta").innerHTML = `${getUserLink(result.value.userId, result.value.userName)}
    <time class="gray">
        ${dayjs().to(dayjs(result.value.time))}
    </time>`;

    const contentHTML = await mdParse(result.value.content);
    document.getElementById("content").innerHTML = contentHTML || "No Content";
    mdRender(document.getElementById("content"));

    const gateway = await getIPFSGateway(ipfs);
    document.getElementById("user").innerHTML = getUserAvatar(result.value.userId, result.value.userAvatar, gateway);

    document.getElementById("currentUser").innerHTML = getUserAvatar("", localStorage.userAvatar, gateway);

    let currentUserNameHTML = `<a class="link" href="${config.settingPath}">
       Please go Setting Account
    </a>`;
    if (localStorage.userName) {
        currentUserNameHTML = `<a class="link" href="${config.homePath}">
        ${escapeHtml(localStorage.userName || "No Name")}
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
            content: editor.getValue(),
            postId,
            previousId: userJSON.latestCommentId,
            publicKey: localStorage.publicKey,
            time: new Date().getTime(),
            userAvatar: userJSON.avatar,
            userId: localStorage.userId,
            userName: userJSON.name,
        };

        if (commentObj.content.length > 1048576 || commentObj.content.length < 4) {
            showMsg("Content is error(4-1048576 characters)");
            return;
        }

        const signature = await sign(JSON.stringify(sortObject(commentObj)));
        if (!signature) {
            return;
        }
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
        editor.setValue("");
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

        mdRender(document.getElementById("comments"));

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
