import {ipfs} from "./utils/initIPFS";
import "../assets/scss/index.scss";
import {publishUser} from "./utils/publishUser";


const init = async () => {
    let oldUserJSON: IUser;
    const identity = await ipfs.id();

    try {
        const oldUserStr = await ipfs.files.read(`/starfire/users/${identity.id}`);
        oldUserJSON = JSON.parse(oldUserStr.toString());
        (document.getElementById("avatar") as HTMLInputElement).value = oldUserJSON.avatar;
    } catch (e) {
        console.warn(e);
    }

    (document.getElementById("name") as HTMLInputElement).value = (oldUserJSON && oldUserJSON.name) || '';;


    (document.getElementById("privateKey") as HTMLInputElement).value = localStorage.privateKey || '';

    document.getElementById("init").addEventListener("click", async () => {
        const privateKey = `${(document.getElementById("privateKey") as HTMLInputElement).value}`

        localStorage.userId = identity.id;
        localStorage.publicKey = identity.publicKey;
        localStorage.privateKey = privateKey;

        const userObj = {
            avatar: (document.getElementById("avatar") as HTMLInputElement).value,
            id: identity.id,
            latestCommentId: (oldUserJSON && oldUserJSON.latestCommentId) || "",
            latestPostId: (oldUserJSON && oldUserJSON.latestPostId) || "",
            name: (document.getElementById("name") as HTMLInputElement).value,
            publicKey: identity.publicKey,
            topics: (oldUserJSON && oldUserJSON.topics) || ["starfire-index"],
        };

        await publishUser(userObj, ipfs);
        window.location.href = "/";
    });
};

init();
