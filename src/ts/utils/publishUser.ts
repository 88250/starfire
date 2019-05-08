export const publishUser = async (userJSON: IUser, ipfs: IIPFS) => {
    const path = `/starfire/users/${localStorage.userId}`;
    try {
        await ipfs.files.rm(path);
    } catch (e) {
        console.warn(e);
    }

    await ipfs.files.write(path, Buffer.from(JSON.stringify(userJSON)), {
        create: true,
        parents: true,
    });
    const stats = await ipfs.files.stat(path);
    ipfs.name.publish(`/ipfs/${stats.hash}`);
};
