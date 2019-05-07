export class Post {
    private ipfs: IIPFS;

    constructor(ipfs: IIPFS) {
        this.ipfs = ipfs;
    }

    public init() {
        document.getElementById("postBtn").addEventListener("click", () => {
            this.add();
        });
    }

    public async add() {
        const path = `/starfire/users/${localStorage.userId}`;
        const userStr = await this.ipfs.files.read(path);
        const userJSON = JSON.parse(userStr.toString());

        this.ipfs.dag.put({
            content: (document.getElementById("postContent") as HTMLInputElement).value,
            previousId: userJSON.latestPostId,
            time: new Date().getTime(),
            title: (document.getElementById("postTitle") as HTMLInputElement).value,
            type: 0,
            userId: localStorage.userId,
            userName: userJSON.name,
            userAvatar: userJSON.avatar
        }, async (err: Error, cid: any) => {
            const postId = cid.toBaseEncodedString();

            // send msg
            this.ipfs.pubsub.publish('starfire-index', Buffer.from(postId))

            // update post file
            this.ipfs.files.write(`/starfire/posts/${postId}`,
                Buffer.from(JSON.stringify([])), {
                    create: true,
                    parents: true,
                });

            // update user file
            userJSON.latestPostId = postId;
            await this.ipfs.files.write(path, Buffer.from(JSON.stringify(userJSON)), {
                create: true,
                parents: true,
                truncate: true,
            });
            const stats = await this.ipfs.files.stat(path)
            await this.ipfs.name.publish(`/ipfs/${stats.hash}`)
        });
    }
}
