import {sign} from "./sign";
import {sortObject} from "./tools/sortObject";

export const publishUser = async (userJSON: IUser, ipfs: IIPFS) => {
    const path = `/starfire/users/${localStorage.userId}`;
    delete userJSON.signature;
    userJSON.signature = await sign(JSON.stringify(sortObject(userJSON)));
    await ipfs.files.write(path, Buffer.from(JSON.stringify(userJSON)), {
        create: true,
        parents: true,
        truncate: true,
    });
    const stats = await ipfs.files.stat(path);

    clearTimeout(window.publishTimeout);
    window.publishTimeout = setTimeout(() => {
        ipfs.name.publish(`/ipfs/${stats.hash}`);
    }, 10000);

};
