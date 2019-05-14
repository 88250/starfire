import {verify} from "./sign";
import {sortObject} from "./tools/sortObject";
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {config} from "../config/config";

dayjs.extend(relativeTime)

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
    let commentHTML = "Invalid data";
    if (isMatch) {
        commentHTML = `<div class="item flex">
    <a href="${config.homePath}?id=${result.value.userId}">
        <img class="avatar" src="${result.value.userAvatar}"/> 
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
