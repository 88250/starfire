import {config} from "./config/config";
import {filterSpam, idIsInBlacklist} from "./utils/filterSpam";
import {genCommentItemById} from "./utils/genCommentItemById";
import {genPostItemById} from "./utils/genPostItemById";
import {verify} from "./utils/sign";

export class PubSub {
    public ipfs: IIPFS;

    constructor(ipfs: IIPFS) {
        this.ipfs = ipfs;
    }

    public async init() {
        this.ipfs.pubsub.subscribe(config.topic, this.handlerMsg.bind(this));
    }

    private async handlerMsg(msg: IMsg) {
        const result = await idIsInBlacklist(msg.from);
        if (result.isIn) {
            return;
        }

        const data = JSON.parse(msg.data.toString());
        if (data.type === "index") {
            // merge data
            const oldIndexStr = await this.ipfs.files.read("/starfire/index");
            const oldIndexJSON: string[] = JSON.parse(oldIndexStr.toString());
            const newIndex = filterSpam(data.data, oldIndexJSON);
            const indexJSON = oldIndexJSON.concat(newIndex);

            // remove surplus index item
            if (indexJSON.length > 1024) {
                indexJSON.splice(0, indexJSON.length - 1024);
            }

            // update index file
            this.ipfs.files.write("/starfire/index", Buffer.from(JSON.stringify(indexJSON)), {
                create: true,
                parents: true,
                truncate: true,
            });

            // render post list
            if (!document.getElementById("indexList")) {
                return;
            }

            // add new index item
            newIndex.forEach(async (postId) => {
                await genPostItemById(postId, this.ipfs, result.blacklist);
            });
        } else if (data.type === "comment") {
            const postPath = `/starfire/posts/${data.data.postId}`;

            let oldCommentsStr = "[]";
            try {
                oldCommentsStr = await this.ipfs.files.read(postPath);
            } catch (e) {
                console.warn(e);
            }

            const oldCommentsJSON: string[] = JSON.parse(oldCommentsStr.toString());
            const newComment = filterSpam(data.data.ids, oldCommentsJSON);
            const commentsJSON = oldCommentsJSON.concat(newComment);

            // update post file
            this.ipfs.files.write(postPath, Buffer.from(JSON.stringify(commentsJSON)), {
                create: true,
                parents: true,
                truncate: true,
            });

            // render comment list
            if (!document.getElementById("comments") ||
                location.search.split("=")[1] !== data.data.postId) {
                return;
            }

            newComment.forEach(async (commentId) => {
                await genCommentItemById(commentId, this.ipfs, result.blacklist);
            });
        } else if (data.type === "blacklist") {
            const isMatch = await verify(data.data, config.moderatePubKey, data.sign);
            if (!isMatch) {
                return;
            }
            const blacklistStr = await this.ipfs.cat(data.data);
            const blacklistJSON = blacklistStr.toString().split("\n");

            this.ipfs.swarm.peers((err, peerInfos) => {
                peerInfos.forEach((info: IPeer) => {
                    blacklistJSON.forEach((blackId: string) => {
                        if (blackId === info.peer._idB58String) {
                            let maddr = info.addr.toString().replace("/p2p-circuit", "");
                            if (info.addr.toString().indexOf("/ipfs/") !== 0) {
                                maddr = `${maddr}/ipfs/${info.peer._idB58String}`;
                            }
                            this.ipfs.swarm.disconnect(maddr);
                        }
                    });
                });
            });

            await this.ipfs.files.write("/starfire/blacklist", Buffer.from(blacklistStr.toString()), {
                create: true,
                parents: true,
                truncate: true,
            });
        }
    }
}
