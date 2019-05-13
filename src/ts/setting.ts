import "../assets/scss/index.scss";
import pugTpl from "../pug/setting.pug";
import {ipfs} from "./utils/initIPFS";
import {loaded} from "./utils/initPage";
import {publishUser} from "./utils/publishUser";
import {renderPug} from "./utils/renderPug";

const setting = async () => {
    renderPug(pugTpl);

    let oldUserJSON: IUser;
    const identity = await ipfs.id();

    try {
        const oldUserStr = await ipfs.files.read(`/starfire/users/${identity.id}`);
        oldUserJSON = JSON.parse(oldUserStr.toString());
        (document.getElementById("avatar") as HTMLInputElement).value = oldUserJSON.avatar;
    } catch (e) {
        console.warn(e);
    }

    (document.getElementById("name") as HTMLInputElement).value = (oldUserJSON && oldUserJSON.name) || "";

    document.getElementById("init").addEventListener("click", async () => {
        localStorage.userId = identity.id;
        localStorage.publicKey = identity.publicKey;

        const userObj = {
            avatar: (document.getElementById("avatar") as HTMLInputElement).value,
            id: identity.id,
            latestCommentId: (oldUserJSON && oldUserJSON.latestCommentId) || "",
            latestPostId: (oldUserJSON && oldUserJSON.latestPostId) || "",
            name: (document.getElementById("name") as HTMLInputElement).value,
            publicKey: identity.publicKey,
        };

        await publishUser(userObj, ipfs);
        window.location.href = `init.html`;
    });

    loaded(ipfs);
};

setting();
