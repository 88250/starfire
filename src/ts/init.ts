import ipfsClient from "ipfs-http-client";
import "../assets/scss/index.scss";
import {publishUser} from "./utils/publishUser";

const ipfs = ipfsClient("localhost", "5001", {protocol: "http"});

const init = async () => {
    const selectElement = document.getElementById("list") as HTMLSelectElement;

    ipfs.key.list(async (err: Error, keys: any []) => {
        let optionsHTML = "";
        keys.forEach((item) => {
            optionsHTML += `<option value="${item.id}">${item.name}</option>`;
        });
        selectElement.innerHTML = optionsHTML;

        try {
            const userStr = await ipfs.files.read(`/starfire/users/${selectElement.value}`);
            (document.getElementById("avatar") as HTMLInputElement).value = JSON.parse(userStr.toString()).avatar;
        } catch (e) {
            console.warn(e);
        }
    });

    document.getElementById("add").addEventListener("click", () => {
        ipfs.key.gen((document.getElementById("name") as HTMLInputElement).value, {
            size: 2048,
            type: "rsa",
        }, () => {
            window.location.reload();
        });
    });

    document.getElementById("remove").addEventListener("click", async () => {
        await ipfs.key.rm(selectElement.options[selectElement.selectedIndex].text);

        const path = `/starfire/users/${selectElement.value}`;
        await ipfs.files.rm(path);
        window.location.reload();
    });

    selectElement.onchange = async () => {
        try {
            const userStr = await ipfs.files.read(`/starfire/users/${selectElement.value}`);
            (document.getElementById("avatar") as HTMLInputElement).value = JSON.parse(userStr.toString()).avatar;
        } catch (e) {
            console.warn(e);
        }
    };

    document.getElementById("init").addEventListener("click", async () => {
        const id = selectElement.value;

        const path = `/starfire/users/${id}`;
        let userJSON: IUser;

        try {
            const oldUserStr = await ipfs.files.read(path);
            userJSON = JSON.parse(oldUserStr.toString());
        } catch (e) {
            console.warn(e);
        }

        const userObj = {
            avatar: (document.getElementById("avatar") as HTMLInputElement).value,
            id,
            latestCommentId: (userJSON && userJSON.latestCommentId) || "",
            latestPostId: (userJSON && userJSON.latestCommentId) || "",
            name: selectElement.options[selectElement.selectedIndex].text,
            topics: (userJSON && userJSON.topics) || ["starfire-index"],
        };
        localStorage.userId = id;

        await publishUser(userObj, ipfs);
        window.location.href = "/";
    });
};

init();
