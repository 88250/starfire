import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {config} from "../config/config";
import {getIPFSGateway} from "./getIPFSGateway";
import {verify} from "./sign";
import {sortObject} from "./tools/sortObject";

dayjs.extend(relativeTime);

export const genCommentItemById = async (id: string, ipfs: IIPFS, blackList: string[]) => {
    if (!id) {
        return false;
    }
    const result = await ipfs.dag.get(id);
    const commentObj = result.value;

    let isInBlacklist = false;
    blackList.forEach((blackId: string) => {
        if (commentObj.userId === blackId) {
            isInBlacklist = true;
        }
    });
    if (isInBlacklist) {
        return commentObj.userId;
    }

    const signature = commentObj.signature;
    delete commentObj.signature;
    const isMatch = await verify(JSON.stringify(sortObject(commentObj)), commentObj.publicKey, signature);

    const gateway = await getIPFSGateway(ipfs);
    let commentHTML = `<div class="item flex">
    <img class="avatar" src="${gateway}/ipfs/${config.defaultAvatar}"/>
    <div class="module flex1">
        <div class="module__header">
            <a class="name">
                Invalid data
            </a>
            <time class="time">Invalid data</time>
        </div>
        <div class="module__body reset">Invalid data</div>
    </div>
</div>`;
    if (isMatch) {
        commentHTML = `<div class="item flex" id="${id}">
    <a href="${config.homePath}?id=${result.value.userId}">
        <img class="avatar" src="${gateway}/ipfs/${result.value.userAvatar}"/>
    </a>
    <div class="module flex1">
        <div class="module__header">
            <a class="name" href="${config.homePath}?id=${result.value.userId}">
                ${result.value.userName}
            </a>
            <time class="time">${dayjs().to(dayjs(result.value.time))}</time>
        </div>
        <div class="module__body reset">${result.value.content}</div>
    </div>
</div>`;
    }

    document.getElementById("comments").insertAdjacentHTML("beforeend", commentHTML);
    return false;
};
