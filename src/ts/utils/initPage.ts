import {config} from "../config/config";
import {PubSub} from "../PubSub";
import {ipfs} from "./initIPFS";

const closeLoading = () => {
    document.getElementById("pageLoading").remove();
};

const pullModerate = async (ipfs: IIPFS, type: string) => {
    ipfs.name.resolve(`/ipns/${config.moderateId}/${type}`, (nameErr: Error, name: string) => {
        ipfs.get(name, (err: Error, files: IPFSFile []) => {
            files.forEach(async (file) => {
                try {
                    await ipfs.files.rm(`/starfire/${type}`);
                } catch (e) {
                    console.warn(e);
                }

                ipfs.files.write(`/starfire/${type}`, Buffer.from(file.content.toString()), {
                    create: true,
                    parents: true,
                });
            });
        });
    });
};

const initPubSub = (ipfs: IIPFS) => {
    const pubsub = new PubSub(ipfs);
    pubsub.init();
};

const updateNewestVersion = async () => {
    if (config.env !== 'product') {
        return
    }
    const versionStr = await ipfs.files.read("/starfire/version");
    const versionId = versionStr.toString()
    if (location.pathname.indexOf(`/ipfs/${versionId}`) === 0) {
        return
    }
    window.location.href = `/ipfs/${versionId}`
};

export const loaded = (ipfs: IIPFS) => {
    initPubSub(ipfs);
    closeLoading();
    updateNewestVersion();
    pullModerate(ipfs, "version");
    pullModerate(ipfs, "blacklist");
};
