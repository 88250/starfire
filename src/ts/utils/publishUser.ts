import {showMsg} from "./msg";
import {sign, verify} from "./sign";
import {sortObject} from "./tools/sortObject";

export const publishUser = async (userJSON: IUser, ipfs: IIPFS) => {
    const path = `/starfire/users/${localStorage.userId}`;
    delete userJSON.signature;

    if (userJSON.name.length > 24 || userJSON.name.length === 0) {
        showMsg("昵称长度限制 1-24 字符");
        return false;
    }

    const signature  = await sign(JSON.stringify(sortObject(userJSON)));
    if (!signature) {
        showMsg("该密钥对不可用");
        return;
    }

    const isMatch = await verify(JSON.stringify(sortObject(userJSON)), userJSON.publicKey, signature);
    if (!isMatch) {
        showMsg("该密钥对不可用");
        return;
    }

    userJSON.signature = signature;

    await ipfs.files.write(path, Buffer.from(JSON.stringify(userJSON)), {
        create: true,
        parents: true,
        truncate: true,
    });

    return true;
};
