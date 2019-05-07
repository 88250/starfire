import ipfsClient from "ipfs-http-client";
import "../assets/scss/index.scss";

const ipfs = ipfsClient("localhost", "5001", {protocol: "http"});
const postCid = location.search.split('=')[1]
const init = async () => {
    if (!localStorage.userId) {
        window.location.href = 'init.html'
        return
    }

    const result = await ipfs.dag.get(postCid)
    document.getElementById('content').innerHTML = result.value.content
    document.getElementById('title').innerHTML = result.value.title
    document.getElementById('user').innerHTML = result.value.userId


    document.getElementById('commentBtn').addEventListener('click', async () => {
        const cid = await ipfs.dag.put({
            content: (document.getElementById('commentContent') as HTMLInputElement).value,
            userId: localStorage.userId,
            time: new Date().getTime(),
            postId: postCid
        })
        const commentCid = cid.toBaseEncodedString()

        const postPath = `/starfire/posts/${postCid}`
        const commentsStr = await ipfs.files.read(postPath)
        const commentsJSON = JSON.parse(commentsStr.toString())
        commentsJSON.push(commentCid)
        await ipfs.files.write(postPath, Buffer.from(JSON.stringify(commentsJSON)), {
            create: true,
            parents: true,
            truncate: true,
        })

        const userPath = `/starfire/users/${localStorage.userId}`
        const userStr = await ipfs.files.read(userPath)
        const userJSON = JSON.parse(userStr.toString())
        userJSON.comments.push(commentCid)
        await ipfs.files.write(userPath, Buffer.from(JSON.stringify(userJSON)), {
            create: true,
            parents: true,
            truncate: true,
        })

        window.location.reload()
    })

    initComments()
}

const initComments = async () => {
    const commentsStr = await ipfs.files.read(`/starfire/posts/${postCid}`)
    const commentsJSON = JSON.parse(commentsStr.toString())
    commentsJSON.forEach((async (commentCid: string) => {
        const result = await ipfs.dag.get(commentCid)
        document.getElementById('comments').insertAdjacentHTML('beforeend',
            `<li>
    <a href="">${result.value.userId}</a>:
    <div>${result.value.content}</div>
</li>`)
    }))
}

init()