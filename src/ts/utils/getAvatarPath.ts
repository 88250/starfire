import isIPFS from "is-ipfs";
import {config} from "../config/config";

export const getAvatarPath = (cid: string, gateway: string) => {
    let avatarPath = `${gateway}/ipfs/${config.defaultAvatar}`;
    if (isIPFS.cid(cid)) {
        avatarPath = `${gateway}/ipfs/${cid}`;
    }
    return avatarPath;
};
