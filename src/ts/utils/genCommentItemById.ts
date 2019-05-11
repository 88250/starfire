import {verify} from "./sign";
import {sortObject} from "./tools/sortObject";

export const genCommentItemById = async (id: string, ipfs: IIPFS) => {
    if (!id) {
        return;
    }
    const result = await ipfs.dag.get(id);
    const commentObj = result.value;
    const signature = commentObj.signature;
    delete commentObj.signature;
    const isMatch = await verify(JSON.stringify(sortObject(commentObj)), commentObj.publicKey, signature);
    let commentHTML = "数据被串改";
    if (isMatch) {
        commentHTML = `<li>
    <a href="home.html?id=${result.value.userId}">
        <img width="20" src="${result.value.userAvatar}"/> ${result.value.userName}
    </a>:
    <div>${result.value.content}</div>
    ${result.value.time}
</li>`;
    }

    document.getElementById("comments").insertAdjacentHTML("beforeend", commentHTML);
};
