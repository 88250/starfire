import {config} from "../config/config";
import {PubSub} from "../PubSub";

const closeLoading = () => {
    document.getElementById("pageLoading").remove();
};

const pullModerate = async (ipfs: IIPFS, type: string) => {
    ipfs.name.resolve(`/ipns/${config.moderateId}/${type}`, (nameErr: Error, name: string) => {
        if (!name) {
            return
        }
        ipfs.get(name, (err: Error, files: IPFSFile []) => {
            if (!files) {
                return
            }
            files.forEach(async (file) => {

                ipfs.files.write(`/starfire/${type}`, Buffer.from(file.content.toString()), {
                    create: true,
                    parents: true,
                    truncate: true
                });
            });
        });
    });
};

const initPubSub = (ipfs: IIPFS) => {
    const pubsub = new PubSub(ipfs);
    pubsub.init();
};

const updateNewestVersion = async (ipfs: IIPFS) => {
    if (config.env !== "product") {
        return;
    }
    const versionStr = await ipfs.files.read("/starfire/version");
    const versionId = versionStr.toString();
    if (location.pathname.indexOf(`/ipfs/${versionId}`) === 0) {
        return;
    }
    window.location.href = `/ipfs/${versionId}`;
};

export const loaded = (ipfs: IIPFS) => {
    initPubSub(ipfs);
    closeLoading();
    updateNewestVersion(ipfs);
    pullModerate(ipfs, "version");
    pullModerate(ipfs, "blacklist");
};
