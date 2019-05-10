import ipfsClient from "ipfs-http-client";
import "../assets/scss/index.scss";
import {publishUser} from "./utils/publishUser";

const ipfs = ipfsClient("127.0.0.1", "5001", {protocol: "http"});

const init = async () => {
    let userName: string;
    let oldUserJSON: IUser;
    const identity = await ipfs.id();

    try {
        const oldUserStr = await ipfs.files.read(`/starfire/users/${identity.id}`);
        oldUserJSON = JSON.parse(oldUserStr.toString());
        (document.getElementById("avatar") as HTMLInputElement).value = oldUserJSON.avatar;
    } catch (e) {
        console.warn(e);
    }

    const keys = await ipfs.key.list();
    console.log(keys)
    userName = (oldUserJSON && oldUserJSON.name) || keys[0].name;
    (document.getElementById("name") as HTMLInputElement).value = userName;


    (document.getElementById("privateKey") as HTMLInputElement).value = localStorage.privateKey || '';

    document.getElementById("init").addEventListener("click", async () => {
        const newUserName = (document.getElementById("name") as HTMLInputElement).value;
        const privateKey = `${(document.getElementById("privateKey") as HTMLInputElement).value}`
        let error = false

        if (userName !== newUserName) {
            try {
                await ipfs.key.rename(userName, newUserName);
            } catch (e) {
                error = true
                alert(e)
            }
            if (error) {
                return
            }
        }

        localStorage.userId = identity.id;
        localStorage.publicKey = identity.publicKey;
        localStorage.privateKey = privateKey;

        const userObj = {
            avatar: (document.getElementById("avatar") as HTMLInputElement).value,
            id: identity.id,
            latestCommentId: (oldUserJSON && oldUserJSON.latestCommentId) || "",
            latestPostId: (oldUserJSON && oldUserJSON.latestPostId) || "",
            name: newUserName,
            publicKey: identity.publicKey,
            topics: (oldUserJSON && oldUserJSON.topics) || ["starfire-index"],
        };

        await publishUser(userObj, ipfs);
        window.location.href = "/";
    });
};

init();
