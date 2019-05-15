import isIPFS from "is-ipfs";
import {config} from "../config/config";
import {escapeHtml} from "xss";
import {getAvatarPath} from "./getAvatarPath";

export const getUserLink = (userId: string, userName: string) => {
    let linkHTML = escapeHtml(userName);
    if (isIPFS.cid(userId)) {
        linkHTML = `<a class="link" href="${config.homePath}?id=${userId}">
        ${escapeHtml(userName)}
    </a>`;
    }
    return linkHTML
};


export const getUserAvatar = (userId: string, userAvatar: string, gateway:string) => {
    let linkHTML = `<img class="avatar" src="${getAvatarPath(userAvatar, gateway)}"/>`
    if (isIPFS.cid(userId)) {
        linkHTML =`<a href="${config.homePath}?id=${userId}">
        <img class="avatar" src="${getAvatarPath(userAvatar, gateway)}"/>
    </a>`;
    }
    return linkHTML
};
