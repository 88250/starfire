import {toPng} from "jdenticon/index.js";
import fileReaderPullStream from "pull-file-reader";
import pugTpl from "../pug/setting.pug";
import {config} from "./config/config";
import {getAvatarPath} from "./utils/getAvatarPath";
import {getIPFSGateway} from "./utils/getIPFSGateway";
import {ipfs} from "./utils/initIPFS";
import {loaded} from "./utils/initPage";
import {publishUser} from "./utils/publishUser";
import {renderPug} from "./utils/renderPug";

const init = async () => {
    renderPug(pugTpl);

    let oldUserJSON: IUser;
    const identity = await ipfs.id();

    try {
        const oldUserStr = await ipfs.files.read(`/starfire/users/${identity.id}`);
        oldUserJSON = JSON.parse(oldUserStr.toString());
    } catch (e) {
        console.warn(e);
    }

    const gateway = await getIPFSGateway(ipfs);

    let initAvatarHash = "";
    if (!(oldUserJSON && oldUserJSON.avatar)) {
        const file = new File([toPng(identity.id, 260, 0)], "avatar.svg", {type: "text/xml"});
        const results = await ipfs.add(fileReaderPullStream(file));
        initAvatarHash = results[0].hash;
    }

    // render html
    let avatarSrc = `${gateway}/ipfs/${initAvatarHash}`;
    if (oldUserJSON && oldUserJSON.avatar) {
        avatarSrc = getAvatarPath(oldUserJSON.avatar, gateway);
    }
    document.querySelectorAll(".avatar").forEach((element) => {
        element.setAttribute("src", avatarSrc);
    });

    (document.getElementById("avatarPath") as HTMLInputElement).value =
        (oldUserJSON && oldUserJSON.avatar) || initAvatarHash;
    (document.getElementById("name") as HTMLInputElement).value = (oldUserJSON && oldUserJSON.name) || "";
    (document.getElementById("id") as HTMLInputElement).value = identity.id;

    // bind start
    document.getElementById("start").addEventListener("click", async () => {
        localStorage.userId = identity.id;
        localStorage.publicKey = identity.publicKey;
        localStorage.userAvatar = (document.getElementById("avatarPath") as HTMLInputElement).value;
        localStorage.userName = (document.getElementById("name") as HTMLInputElement).value;

        const userObj = {
            avatar: localStorage.userAvatar,
            id: localStorage.userId,
            latestCommentId: (oldUserJSON && oldUserJSON.latestCommentId) || "",
            latestPostId: (oldUserJSON && oldUserJSON.latestPostId) || "",
            name: localStorage.userName,
            publicKey: identity.publicKey,
        };

        const publishResult =  await publishUser(userObj, ipfs);
        if (publishResult) {
           window.location.href = config.indexPath;
       }
    });

    loaded(ipfs);
};

init();
