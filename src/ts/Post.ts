export class Post {
    private ipfs: IIPFS

    constructor(ipfs: IIPFS) {
        this.ipfs = ipfs
    }

    init() {
        document.getElementById('postBtn').addEventListener('click', () => {
            this.add()
        })
    }

    add() {
        this.ipfs.dag.put({
            type: 0,
            title: (document.getElementById('postTitle') as HTMLInputElement).value,
            content: (document.getElementById('postContent') as HTMLInputElement).value,
            userId: localStorage.userId,
            time: new Date().getTime()
        }, (err: Error, cid: any) => {
            const path = `/starfire/users/${localStorage.userId}`
            const postCid = cid.toBaseEncodedString()

            this.ipfs.files.write(`/starfire/posts/${postCid}`,
                Buffer.from(JSON.stringify([])), {
                create: true,
                parents: true
            })

            this.ipfs.files.read(path, (error, buf) => {
                let userJSON = JSON.parse(buf.toString())
                userJSON.posts.push(postCid)
                this.ipfs.files.write(path, Buffer.from(JSON.stringify(userJSON)), {
                    create: true,
                    parents: true,
                    truncate: true,
                }, () => {
                    window.location.href = '/'
                })
            })
        })
    }
}