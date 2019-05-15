import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {getIPFSGateway} from "./getIPFSGateway";
import {getTitleLink, getUserAvatar, getUserLink} from "./getUserHTML";

dayjs.extend(relativeTime);

export const genPostItemById = async (id: string, ipfs: IIPFS, blackList: string[]) => {
    const result = await ipfs.dag.get(id);
    let isInBlacklist = false;
    blackList.forEach((blackId: string) => {
        if (result.value.userId === blackId) {
            isInBlacklist = true;
        }
    });
    if (isInBlacklist) {
        return result.value.userId;
    }

    const gateway = await getIPFSGateway(ipfs);
    document.getElementById("indexList").insertAdjacentHTML("afterbegin",
        `<li class="post__item">
    ${getUserAvatar(result.value.userId, result.value.userAvatar, gateway, 'avatar avatar--small')}
    <div class="flex1">
        ${getUserLink(result.value.userId, result.value.userName)}
        <time class="gray">
            ${dayjs().to(dayjs(result.value.time))}
        </time>
        ${getTitleLink(id, result.value.title)}
    </div>
</li>`);
    return false;
};
