declare module "*.svg";

declare module "multihashing-async";

declare module "ipfs-http-client";

declare module "jdenticon/index.js";

declare module "pull-file-reader";

declare module "dayjs*";

declare module "xss";

declare module "multiaddr";

declare module "is-ipfs";

declare module "vditor";

declare module "libp2p-crypto/src/keys";

declare module "*.pug";

// tslint:disable-next-line:interface-name
interface Window {
    msgTimeout: number;
}

interface IUser {
    publicKey: string;
    signature?: string;
    id: string;
    latestCommentId: string;
    latestPostId: string;
    name: string;
    avatar: string;
}

interface IPost {
    publicKey: string;
    content: string;
    signature?: string;
    previousId: string;
    time: number;
    title: string;
    type: number; // 0-link
    userAvatar: string;
    userId: string;
    userName: string;
}

interface IComment {
    publicKey: string;
    content: string;
    signature?: string;
    previousId: string;
    time: number;
    userAvatar: string;
    userId: string;
    userName: string;
    postId: string;
}

interface IMsg {
    from: string;
    data: string;
}
