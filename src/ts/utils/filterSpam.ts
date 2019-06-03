import {ipfs} from "./initIPFS";

const difference = (newArray: string[], oldArray: string[]) => {
    const oldSet = new Set(oldArray);
    return newArray.filter((key: string) => !oldSet.has(key));
};

export const getSpam = async () => {
    let blackJSON = [];
    try {
        const blackStr = await ipfs.files.read("/starfire/blacklist");
        blackJSON = blackStr.toString().trim().split("\n");
    } catch (e) {
        console.warn(e);
    }
    return blackJSON;
};

export const idIsInBlacklist = async (id: string) => {
    let isIn = false;
    const blackJSON = await getSpam();
    blackJSON.forEach((blackId: string) => {
        if (blackId === id) {
            isIn = true;
        }
    });

    return {
        blacklist: blackJSON,
        isIn,
    };
};

export const filterSpam = (newList: string[], oldList: string[]) => {
    const uniqueNewList = difference(newList, oldList);
    return uniqueNewList;
};
