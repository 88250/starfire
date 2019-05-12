import {verify} from "./sign";
import {sortObject} from "./tools/sortObject";

export const genCommentItemById = async (id: string, ipfs: IIPFS, blackList: string[]) => {
    if (!id) {
        return false;
    }
    const result = await ipfs.dag.get(id);
    const commentObj = result.value;

    let isInBlacklist = false
    blackList.forEach((blackId: string) => {
        if (commentObj.userId === blackId) {
            isInBlacklist = true
        }
    })
    if (isInBlacklist) {
        return commentObj.userId
    }

    const signature = commentObj.signature;
    delete commentObj.signature;
    const isMatch = await verify(JSON.stringify(sortObject(commentObj)), commentObj.publicKey, signature);
    let commentHTML = "Invalid data";
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
    return false
};
