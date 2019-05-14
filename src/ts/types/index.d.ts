declare module "*.svg" {
    const content: string;
    export default content;
}

declare module "ipfs-http-client";

declare module "jdenticon/index.js";

declare module "pull-file-reader";

declare module "dayjs*";

declare module "libp2p-crypto/src/keys";

declare module "*.pug";

interface Window {
    publishTimeout: any;
}

interface IUser {
    publicKey: string;
    signature?: any;
    id: string;
    latestCommentId: string;
    latestPostId: string;
    name: string;
    avatar: string;
}

interface IPost {
    publicKey: string;
    content: string;
    signature?: any;
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
    signature?: any;
    previousId: string;
    time: number;
    userAvatar: string;
    userId: string;
    userName: string;
    postId: string;
}
