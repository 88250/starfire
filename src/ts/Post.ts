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
            content: (document.getElementById('postInput') as HTMLInputElement).value,
            userId: localStorage.userId,
            time: new Date().getTime()
        }, (err: Error, cid: any) => {
            const path = `/starfire/${localStorage.userId}`
            this.ipfs.files.read(path, (error, buf) => {
                let userJSON = JSON.parse(buf.toString())
                userJSON.posts.push(cid.toBaseEncodedString())
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