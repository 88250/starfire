import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {escapeHtml} from "xss";
import {config} from "../config/config";
import {getIPFSGateway} from "./getIPFSGateway";
import {getAvatarPath} from "./getAvatarPath";

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
        `<li class="flex item">
    <a href="${config.homePath}?id=${result.value.userId}">
        <img class="avatar avatar--small" src="${getAvatarPath(result.value.userAvatar, gateway)}"/>
    </a>
    <div class="flex1">
        <a href="${config.homePath}?id=${result.value.userId}" class="name">
            ${xss(result.value.userName)}
        </a>
        <time class="time">
            ${dayjs().to(dayjs(result.value.time))}
        </time>
        <a class="content" href="${config.detailPath}?id=${id}">
            ${escapeHtml(result.value.title)}
        </a>
    </div>
</li>`);
    return false;
};
