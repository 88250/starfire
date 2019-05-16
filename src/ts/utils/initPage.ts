import {config} from "../config/config";
import {PubSub} from "../PubSub";
import {getIPFSGateway} from "./getIPFSGateway";

const closeLoading = () => {
    document.getElementById("pageLoading").remove();
};

const pullModerate = async (ipfs: IIPFS, type: string) => {
    const name = await ipfs.name.resolve(`/ipns/${config.moderateId}/${type}`);
    if (!name) {
        return false;
    }
    const files = await ipfs.get(name);
    if (!files) {
        return false;
    }
    if (!files[0].content) {
        return false;
    }
    await ipfs.files.write(`/starfire/${type}`, Buffer.from(files[0].content.toString()), {
        create: true,
        parents: true,
        truncate: true,
    });
    return true;
};

const initPubSub = (ipfs: IIPFS) => {
    const pubsub = new PubSub(ipfs);
    pubsub.init();
};

const updateNewestVersion = async (ipfs: IIPFS) => {
    let versionId = config.version;
    if (config.env !== "product") {
        return;
    }
    try {
        const versionStr = await ipfs.files.read("/starfire/version");
        versionId = versionStr.toString();
    } catch (e) {
        console.warn(e);
    }

    if (location.pathname.indexOf(`/ipfs/${versionId}`) === 0) {
        return;
    }
    window.location.href = `/ipfs/${versionId}`;
};

export const loaded = async (ipfs: IIPFS) => {
    initPubSub(ipfs);
    closeLoading();

    const gateway = await getIPFSGateway(ipfs);
    document.getElementById("logo").setAttribute("src",
        `${gateway}/ipfs/${config.defaultAvatar}`);

    if (!localStorage.lastTime) {
        const isUpdate = await namePR(ipfs);
        if (isUpdate) {
            localStorage.lastTime = (new Date()).getTime();
        }
    } else if ((new Date()).getTime() - localStorage.lastTime > config.nameInterval) {
        const isUpdate = await namePR(ipfs);
        if (isUpdate) {
            localStorage.lastTime = (new Date()).getTime();
        }
    }

    updateNewestVersion(ipfs);
};

const namePR = async (ipfs: IIPFS) => {
    const updatedVersion = await pullModerate(ipfs, "version");
    const updatedBlacklist = await pullModerate(ipfs, "blacklist");
    if (localStorage.userId) {
        const stats = await ipfs.files.stat(`/starfire/users/${localStorage.userId}`);
        ipfs.name.publish(`/ipfs/${stats.hash}`);
    }

    return updatedVersion && updatedBlacklist;
};
