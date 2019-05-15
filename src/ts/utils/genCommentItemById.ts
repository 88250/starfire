import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {filterXSS} from "xss";
import {config} from "../config/config";
import {getAvatarPath} from "./getAvatarPath";
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
    let commentHTML = `<div class="comment__item">
    <img class="avatar" src="${gateway}/ipfs/${config.defaultAvatar}"/>
    <div class="module flex1">
        <div class="module__header">
            <span class="link">
                Invalid data
            </span>
            <time class="gray">Invalid data</time>
        </div>
        <div class="module__body reset">Invalid data</div>
    </div>
</div>`;
    if (isMatch) {
        commentHTML = `<div class="comment__item" id="${id}">
    <a href="${config.homePath}?id=${result.value.userId}">
        <img class="avatar" src="${getAvatarPath(result.value.userAvatar, gateway)}"/>
    </a>
    <div class="module flex1">
        <div class="module__header">
            <a class="link" href="${config.homePath}?id=${result.value.userId}">
                ${filterXSS(result.value.userName)}
            </a>
            <time class="gray">${dayjs().to(dayjs(result.value.time))}</time>
        </div>
        <div class="module__body reset">${filterXSS(result.value.content)}</div>
    </div>
</div>`;
    }

    document.getElementById("comments").insertAdjacentHTML("beforeend", commentHTML);
    return false;
};
