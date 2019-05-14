import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {config} from "../config/config";
import {getIPFSGateway} from "./getIPFSGateway";

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
        <img class="avatar avatar--small" src="${gateway}/ipfs/${result.value.userAvatar}"/>
    </a>
    <div class="flex1">
        <a href="${config.homePath}?id=${result.value.userId}" class="name">
            ${result.value.userName}
        </a>
        <time class="time">
            ${dayjs().to(dayjs(result.value.time))}
        </time>
        <a class="content" href="${config.detailPath}?id=${id}">
            ${result.value.title}
        </a>
    </div>
</li>`);
    return false;
};
