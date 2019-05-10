import {ipfs} from "./utils/initIPFS";
import "../assets/scss/index.scss";
import {PubSub} from "./PubSub";
import {verify} from "./utils/sign";
import base64js from "base64-js";
import cryptoKeys from "libp2p-crypto/src/keys";

const userId = location.search.split("=")[1] || localStorage.userId;

const syncOtherUser = () => {
    if (userId !== localStorage.userId) {
        const addr = `/ipns/${userId}`;

        document.getElementById("loading").innerHTML = "refreshing ipns";

        ipfs.name.resolve(addr, function (nameErr: Error, name: string) {
            ipfs.get(name, function (err: Error, files: IPFSFile []) {
                files.forEach(async (file) => {
                    try {
                        await ipfs.files.rm(`/starfire/users/${userId}`);
                    } catch (e) {
                        console.warn(e);
                    }

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
    if (!localStorage.userId) {
        window.location.href = "init.html";
    }

    let userStr = "{}";
    try {
        userStr = await ipfs.files.read(`/starfire/users/${userId}`);
        syncOtherUser();
    } catch (e) {
        syncOtherUser();
    }

    const userJSON = JSON.parse(userStr.toString());
    const signature = userJSON.signature
    delete userJSON.signature

    console.log(JSON.stringify(userJSON))
    const privateKey = base64js.toByteArray('CAASpwkwggSjAgEAAoIBAQCsjhQ2OIBZsIcxAc1nD/Clpq5ubRcrz6eXdUNIQIgXvW8YcQZuDxdAZFuT30urgS8rVj/t53dIs0lM0nAwlpSPFKABe2Ylw1PSzB/mjvTLgrSxduzemeHcgB9IXTa65TfNk5ykpMxixjkxS2VyX+nU1xtz/knNF8jvRSNxp8QaZSHfORsr8ROk+BEHyKdki2IuESyWRGTxlzzQp7T1con7EGXYb3X4tahBd4NusO4NAlXetn4PPzUhr02JLlFqYgX6y1UTAeKEE1oaIZlLBpfflJ9ZRx+15z75iuF+7Ti5rLEaIBBV7YXonIzBcoULhw9T1Q4xFAS+pqDcvfpyX9Y5AgMBAAECggEAZU1oKkjTeVQ8mhXPy8C869NGNogPAWaAoldyb5mLDDznWvcH6lcrtF72sIJ4PzCxS4TwNTAdhG3VC6fDu5K7lqBqK1SRrHvW2zuBQu8MYenTQRhriWfYBIanVul6dxCYyTTu0m35m8d5zinQXexXL+A1Osy/8QsUqPvzCgePBlr/bjTkn+mKuH2wFN4JHrlWNEjzLjiFD7Zfe2aSrL1dmuQ2cThzRoGA+rVVk+3uZHDMSAfRdwcMfdlPTOIL4ms9Bz62p591wmZ+6afmdBvvMPbNcSvXTSAyrTKIOILZOsioC9hE+9fXCyD8Rg9OoJWquR024Uf1tNO4dVlXlBRqfQKBgQDk/y4Mn1v/cBiHZxhZsX+QTX4s/ZoO3PaJSZtPgAGmtqdstiCy+nQWZcgBTtOO5FJK00dIT6UxsUQt92qqzjAKY5F+Te7GlmnhaG+tVYN0K5vXH0QnMWRGVrCYKBA33ca4aC2HRmo6Swvp6WkvWTLtwPRGvFdKv4e1fDVvSPgiVwKBgQDA5xE7iTHLmEUJGgfpmLU5CBiTDcq83W0N32HXntAvncvzcuroIKuekLQJnIZHmIcofrVnI8GDSJB0wUu4TkleEYkST7CXoLDNPcanYSw4dpCrYF/yLv0YEnXA3ZYcNvRfAw21yt/xHMol0+hGVYBWChXsCo8aN3svGrYJBRAR7wKBgAoFcMp0nt4K1cf3JwWl0uNJwN/PKVLFMLTJV9aez3OwQptrTPsIItRoF9yWyoNSUpebr17mvV/zVfx8+1oGM+wAd3mDh5OBOZj3rQt01o/a6LL9V0ovyyeY25mNB0iql+uyA2wMFNIAPsE5ybScvrHQ49/Elj1bLGEw0lXQZ6t5AoGAfHWZXLxL8HwyLokpCcKJSl663EZNxEVpE0ZJLoE8+TvqVwySG2rYz9m1D256BL+YlLwL9pvPQxESgwIkBKoeFB9kPPhFi88Vw5ZUEbJUgamd9bScsvk2Os3OQ720GEgsqxChS+W1Ty+wDXAHsTmBMAIZ2s2FPvkE9YNaZ79oeukCgYEAq3uQDWXABGghV7MvLpGpi2LPHa8x7Oz4hnhykhYPIGsgtTJTJuzA+bwJdzTds8MnXe7j1IAxiQkcRhy3wanYWeNnB9naVnpKJXzcTvALXk/6T15E0UE6Rth2zlJTl5kHrZEl4RPELitwW+ynsPfXX+n7L+9m3sur1TdTyeH3GEk=')
    cryptoKeys.unmarshalPrivateKey(Buffer.from(privateKey), (err: Error, privateKeyObj: any) => {
        privateKeyObj.sign(Buffer.from(JSON.stringify(userJSON)), (err: Error, signUint8Array: any) => {
            console.log(signUint8Array.toString('hex'));
        })
    })

    verify(JSON.stringify(userJSON), userJSON.publicKey, signature)


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

    const pubsub = new PubSub(ipfs);
    await pubsub.init();
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
