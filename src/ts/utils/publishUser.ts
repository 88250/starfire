export const publishUser = async (userJSON: IUser, ipfs: IIPFS) => {
    const path = `/starfire/users/${localStorage.userId}`
    await ipfs.files.rm(path)
    await ipfs.files.write(path, Buffer.from(JSON.stringify(userJSON)), {
        create: true,
        parents: true,
        truncate: true,
    });
    const stats = await ipfs.files.stat(path);
    await ipfs.name.publish(`/ipfs/${stats.hash}`);
}