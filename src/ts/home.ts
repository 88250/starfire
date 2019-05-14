import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "../assets/scss/home.scss";
import {escapeHtml} from "xss";
import * as xss from "xss";
import pugTpl from "../pug/home.pug";
import {config} from "./config/config";
import {getIPFSGateway} from "./utils/getIPFSGateway";
import {ipfs} from "./utils/initIPFS";
import {loaded} from "./utils/initPage";
import {renderPug} from "./utils/renderPug";
import {verify} from "./utils/sign";
import {sortObject} from "./utils/tools/sortObject";

dayjs.extend(relativeTime);

const userId = location.search.split("=")[1] || localStorage.userId;

const syncOtherUser = () => {
    if (userId !== localStorage.userId) {
        document.getElementById("loading").style.display = "block";
        ipfs.name.resolve(`/ipns/${userId}`, (nameErr: Error, name: string) => {
            document.getElementById("loading").style.display = "none";
            if (!name) {
                render(JSON.parse('{"signature":1}'));
                return;
            }
            ipfs.get(name, (err: Error, files: IPFSFile []) => {
                if (!files) {
                    render(JSON.parse('{"signature":1}'));
                    return;
                }
                files.forEach(async (file) => {
                    ipfs.files.write(`/starfire/users/${userId}`, Buffer.from(file.content.toString()), {
                        create: true,
                        parents: true,
                        truncate: true,
                    });

                    render(JSON.parse(file.content.toString()));
                });
            });
        });
    }
};

const init = async () => {
    renderPug(pugTpl);

    if (location.search.split("=")[1]) {
        document.querySelector(".header__item--current").className = "header__item";
    }

    const postBtn = document.getElementById("postBtn");
    const commentBtn = document.getElementById("commentBtn");
    const postList = document.getElementById("postList");
    const commentList = document.getElementById("commentList");
    postBtn.addEventListener("click", () => {
        postBtn.className = "current";
        commentBtn.className = "";
        postList.style.display = "block";
        commentList.style.display = "none";
    });
    commentBtn.addEventListener("click", () => {
        postBtn.className = "";
        commentBtn.className = "current";
        postList.style.display = "none";
        commentList.style.display = "block";
    });

    let userStr = "{}";
    try {
        userStr = await ipfs.files.read(`/starfire/users/${userId}`);
        syncOtherUser();
    } catch (e) {
        syncOtherUser();
    }

    render(JSON.parse(userStr.toString()));
    loaded(ipfs);
};

const render = async (userJSON: IUser) => {
    const signature = userJSON.signature;
    const gateway = await getIPFSGateway(ipfs);
    // ipns 失败
    if (signature === 1) {
        document.getElementById("user").innerHTML = `
<img class="avatar--big avatar" src="${gateway}/ipfs/${config.defaultAvatar}">
<div class="flex1 meta">
    <div class="username">This node is offline</div>
    <div class="id">This node is offline</div>
</div>`;
        return;
    }

    delete userJSON.signature;
    const isMatch = await verify(JSON.stringify(sortObject(userJSON)), userJSON.publicKey, signature);
    if (!isMatch) {
        return;
    }

    const postList = document.getElementById("postList");
    const commentList = document.getElementById("commentList");

    const latestPostId = userJSON.latestPostId;
    const latestCommentId = userJSON.latestCommentId;

    document.getElementById("user").innerHTML = `
<img class="avatar--big avatar" src="${gateway}/ipfs/${userJSON.avatar}">
<div class="flex1 meta">
    <div class="username">${userJSON.name}</div>
    <div class="id">${userJSON.id}</div>
</div>`;

    if (latestPostId) {
        postList.innerHTML = "";
        traverseIds(latestPostId, (id: string, post: IPost) => {
            postList.insertAdjacentHTML("beforeend", `
<li class="flex item">
    <img class="avatar avatar--small" src="${gateway}/ipfs/${post.userAvatar}"/>
    <div class="flex1">
        <span class="name">
            ${post.userName}
        </span>
        <time class="time">
            ${dayjs().to(dayjs(post.time))}
        </time>
        <a class="content" href="${config.detailPath}?id=${id}">
            ${escapeHtml(post.title)}
        </a>
    </div>
</li>`);
        });
    }

    if (latestCommentId) {
        commentList.innerHTML = "";
        traverseIds(latestCommentId, (id: string, comment: IComment) => {
            document.getElementById("commentList").insertAdjacentHTML("beforeend", `
<li class="item flex">
    <img class="avatar" src="${gateway}/ipfs/${comment.userAvatar}"/>
    <div class="module flex1">
        <div class="module__header">
            <a href="${config.detailPath}?id=${comment.postId}#${id}" class="name">${comment.postId}</a>
            <time class="time">${dayjs().to(dayjs(comment.time))}</time>
        </div>
        <div class="module__body reset">${xss(comment.content)}</div>
    </div>
</li>`);
        });
    }
};

const traverseIds = async (id: string, renderCB: any) => {
    while (id) {
        const current = await ipfs.dag.get(id);
        renderCB(id, current.value);
        const previousId = current.value.previousId;
        if (previousId) {
            id = previousId;
        } else {
            return;
        }
    }
};

init();
