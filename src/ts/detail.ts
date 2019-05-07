import ipfsClient from "ipfs-http-client";
import "../assets/scss/index.scss";

const ipfs = ipfsClient("localhost", "5001", {protocol: "http"});
const postId = location.search.split('=')[1]
const init = async () => {
    if (!localStorage.userId) {
        window.location.href = 'init.html'
        return
    }

    const result = await ipfs.dag.get(postId)
    document.getElementById('content').innerHTML = result.value.content
    document.getElementById('title').innerHTML = result.value.title
    document.getElementById('user').innerHTML = result.value.userId


    document.getElementById('commentBtn').addEventListener('click', async () => {
        const userPath = `/starfire/users/${localStorage.userId}`
        const userStr = await ipfs.files.read(userPath)
        const userJSON = JSON.parse(userStr.toString())

        const cid = await ipfs.dag.put({
            content: (document.getElementById('commentContent') as HTMLInputElement).value,
            userId: localStorage.userId,
            time: new Date().getTime(),
            postId: postId,
            previousId: userJSON.latestCommentId
        })
        const commentId = cid.toBaseEncodedString()

        const postPath = `/starfire/posts/${postId}`
        const commentsStr = await ipfs.files.read(postPath)
        const commentsJSON = JSON.parse(commentsStr.toString())
        commentsJSON.push(commentId)
        await ipfs.files.write(postPath, Buffer.from(JSON.stringify(commentsJSON)), {
            create: true,
            parents: true,
            truncate: true,
        })

        userJSON.latestCommentId = commentId
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
    const commentsStr = await ipfs.files.read(`/starfire/posts/${postId}`)
    const commentsJSON = JSON.parse(commentsStr.toString())
    commentsJSON.forEach((async (commentId: string) => {
        const result = await ipfs.dag.get(commentId)
        document.getElementById('comments').insertAdjacentHTML('beforeend',
            `<li>
    <a href="">${result.value.userId}</a>:
    <div>${result.value.content}</div>
</li>`)
    }))
}

init()