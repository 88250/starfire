import "../assets/scss/index.scss";
import pugTpl from "../pug/home.pug";
import {ipfs} from "./utils/initIPFS";
import {loaded} from "./utils/initPage";
import {renderPug} from "./utils/renderPug";
import {verify} from "./utils/sign";
import {sortObject} from "./utils/tools/sortObject";

const userId = location.search.split("=")[1] || localStorage.userId;

const syncOtherUser = () => {
    if (userId !== localStorage.userId) {
        document.getElementById("loading").innerHTML = "refreshing ipns";

        ipfs.name.resolve(`/ipns/${userId}`, (nameErr: Error, name: string) => {
            ipfs.get(name, (err: Error, files: IPFSFile []) => {
                files.forEach(async (file) => {
                    try {
                        await ipfs.files.rm(`/starfire/users/${userId}`);
                    } catch (e) {
                        console.warn(e);
                    }

                    render(JSON.parse(file.content.toString()));

                    ipfs.files.write(`/starfire/users/${userId}`, Buffer.from(file.content.toString()), {
                        create: true,
                        parents: true,
                    });
                });
            });
            document.getElementById("loading").innerHTML = "";
        });
    }
};

const init = async () => {
    renderPug(pugTpl);

    let userStr = "{}";
    try {
        userStr = await ipfs.files.read(`/starfire/users/${userId}`);
        syncOtherUser();
    } catch (e) {
        syncOtherUser();
    }

    render(JSON.parse(userStr.toString()));

};

const render = async (userJSON: IUser) => {
    const signature = userJSON.signature;
    delete userJSON.signature;
    const isMatch = await verify(JSON.stringify(sortObject(userJSON)), userJSON.publicKey, signature);
    if (!isMatch) {
        return;
    }

    const latestPostId = userJSON.latestPostId;
    const latestCommentId = userJSON.latestCommentId;

    document.getElementById("user").innerHTML = `<img src="${userJSON.avatar}"> ${userJSON.name}`;

    if (latestPostId) {
        const postResult = await traverseIds(latestPostId);
        let postHTML = "";
        postResult.values.forEach((post, index) => {
            postHTML += `<li>
    <a href="detail.html?id=${postResult.ids[index]}">${post.title}</a>
</li>`;
        });
        document.getElementById("postList").innerHTML = postHTML;
    }

    if (latestCommentId) {
        const commentResult = await traverseIds(latestCommentId);
        let commentHTML = "";
        commentResult.values.forEach((comment) => {
            commentHTML += `<li>
    <a href="detail.html?id=${comment.postId}">${comment.content}</a>
</li>`;
        });
        document.getElementById("commentList").innerHTML = commentHTML;
    }
    loaded(ipfs);
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
