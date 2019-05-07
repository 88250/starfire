import ipfsClient from "ipfs-http-client";
import "../assets/scss/index.scss";

const ipfs = ipfsClient("localhost", "5001", {protocol: "http"});
const userId = location.search.split("=")[1] || localStorage.userId;

const init = async () => {
    if (!localStorage.userId) {
        window.location.href = "init.html";
    }

    const userStr: string = await ipfs.files.read(`/starfire/users/${userId}`);
    const usreJSON = JSON.parse(userStr.toString());
    const latestPostId = usreJSON.latestPostId;
    const latestCommentId = usreJSON.latestCommentId;

    const postResult = await traverseIds(latestPostId);
    let postHTML = "";
    postResult.values.forEach((post, index) => {
        postHTML += `<li>
    <a href="detail.html?id=${postResult.ids[index]}">${post.title}</a>
</li>`;
    });
    document.getElementById("postList").innerHTML = postHTML;

    const commentResult = await traverseIds(latestCommentId);
    let commentHTML = "";
    commentResult.values.forEach((comment) => {
        commentHTML += `<li>
    <a href="detail.html?id=${comment.postId}">${comment.content}</a>
</li>`;
    });
    document.getElementById("commentList").innerHTML = commentHTML;
};

const traverseIds = async (id: string) => {
    const result = {ids: Array(0), values: Array(0)};
    while (id) {
        const current = await ipfs.dag.get(id);
        result.ids.push(id);
        result.values.push(current.value);
        const previousId = current.value.previousId;
        if (previousId) {
            id = previousId;
        } else {
            return result;
        }
    }
};

init();
