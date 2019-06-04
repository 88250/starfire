import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {getIPFSGateway} from "./getIPFSGateway";
import {getTitleLink, getUserAvatar, getUserLink} from "./getUserHTML";
import {isNodeIdPost} from "./isNodeIdPost";
import {verify} from "./sign";
import {sortObject} from "./tools/sortObject";

dayjs.extend(relativeTime);

export const genPostItemById = async (id: string, ipfs: IIPFS, blackList: string[]) => {
    const result = await ipfs.dag.get(id);
    const postObj: IPost = result.value;
    let isInBlacklist = false;
    blackList.forEach((blackId: string) => {
        if (postObj.userId === blackId) {
            isInBlacklist = true;
        }
    });
    if (isInBlacklist) {
        return postObj.userId;
    }

    const isMatchNodeId = await isNodeIdPost(postObj.publicKey, postObj.userId);
    if (!isMatchNodeId) {
        return;
    }

    const signature = postObj.signature;
    delete postObj.signature;
    const isMatch = await verify(JSON.stringify(sortObject(postObj)), postObj.publicKey, signature);

    if (!isMatch) {
        return;
    }

    const gateway = await getIPFSGateway(ipfs);
    document.getElementById("indexList").insertAdjacentHTML("afterbegin",
        `<li class="post__item">
    ${getUserAvatar(result.value.userId, result.value.userAvatar, gateway, "avatar avatar--small")}
    <div class="flex1">
        ${getUserLink(result.value.userId, result.value.userName)}
        <time class="gray">
            ${dayjs().to(dayjs(result.value.time))}
        </time>
        ${getTitleLink(id, result.value.title || "No Title")}
    </div>
</li>`);
    return false;
};
