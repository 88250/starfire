import isIPFS from "is-ipfs";
import {escapeHtml} from "xss";
import {config} from "../config/config";
import {getAvatarPath} from "./getAvatarPath";

export const getUserLink = (userId: string, userName: string) => {
    let linkHTML = escapeHtml(userName);
    if (isIPFS.cid(userId)) {
        linkHTML = `<a class="link" href="${config.homePath}?id=${userId}">
        ${linkHTML}
    </a>`;
    }
    return linkHTML;
};

export const getTitleLink = (postId: string, postTitle: string) => {
    let titleHTML = escapeHtml(postTitle);
    if (isIPFS.cid(postId)) {
        titleHTML = `<a class="post__title" href="${config.detailPath}?id=${postId}">
        ${titleHTML}
    </a>`;
    }
    return titleHTML;
};

export const getUserAvatar = (userId: string, userAvatar: string, gateway: string, className: string = "avatar") => {
    let linkHTML = `<img class="${className}" src="${getAvatarPath(userAvatar, gateway)}"/>`;
    if (isIPFS.cid(userId)) {
        linkHTML = `<a href="${config.homePath}?id=${userId}">
        ${linkHTML}
    </a>`;
    }
    return linkHTML;
};
