import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {config} from "../config/config";
import {getIPFSGateway} from "./getIPFSGateway";
import {getUserAvatar, getUserLink} from "./getUserHTML";
import {mdParse} from "./mdRender";
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
        <div class="module__body vditor-reset">Invalid data</div>
    </div>
</div>`;
    if (isMatch) {
        const contentHTML = await mdParse(result.value.content);

        commentHTML = `<div class="comment__item" id="${id}">
    ${getUserAvatar(result.value.userId, result.value.userAvatar, gateway)}
    <div class="module flex1">
        <div class="module__header">
            ${getUserLink(result.value.userId, result.value.userName)}
            <time class="gray">${dayjs().to(dayjs(result.value.time))}</time>
        </div>
        <div class="module__body vditor-reset">${contentHTML || "No Content"}</div>
    </div>
</div>`;
    }

    document.getElementById("comments").insertAdjacentHTML("beforeend", commentHTML);
    return false;
};
