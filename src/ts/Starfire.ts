import ipfsClient from "ipfs-http-client";
import {Post} from './Post'

class Starfire {
    public ipfs: IIPFS;

    constructor() {
        this.ipfs = ipfsClient("localhost", "5001", {protocol: "http"});
        this.isInit()

        const post = new Post(this.ipfs)
        post.init()
    }

    async initList(id: string) {
        if (!id) {
            return
        }
        const result = await this.ipfs.dag.get(id)
        document.getElementById('list').insertAdjacentHTML('beforeend',
            `<li>
    <a href="home.html?id=${result.value.userId}">${result.value.userId}</a>:
    <a href="detail.html?id=${id}">${result.value.title}</a>
</li>`)
    }

    async isInit() {
        if (!localStorage.userId) {
            window.location.href = 'init.html'
        }

        try {
            const userStr: string = await this.ipfs.files.read(`/starfire/users/${localStorage.userId}`)
            this.initList(JSON.parse(userStr.toString()).latestPostId)
        } catch (e) {
            window.location.href = 'init.html'
        }
    }
}

export default Starfire;