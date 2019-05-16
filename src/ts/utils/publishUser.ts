import {showMsg} from "./msg";
import {sign} from "./sign";
import {sortObject} from "./tools/sortObject";

export const publishUser = async (userJSON: IUser, ipfs: IIPFS) => {
    const path = `/starfire/users/${localStorage.userId}`;
    delete userJSON.signature;

    if (userJSON.name.length > 24 || userJSON.name.length === 0) {
        showMsg("Username is error(1-24 characters)");
        return false;
    }

    userJSON.signature = await sign(JSON.stringify(sortObject(userJSON)));
    if (!userJSON.signature) {
        return;
    }
    await ipfs.files.write(path, Buffer.from(JSON.stringify(userJSON)), {
        create: true,
        parents: true,
        truncate: true,
    });

    return true;
};
