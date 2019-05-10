declare module "*.svg" {
    const content: string;
    export default content;
}

declare module "ipfs-http-client";

declare module "base64-js";
declare module "libp2p-crypto/src/keys";

interface Window {
    publishTimeout: any;
}

interface IUser {
    publicKey: string;
    signature?: any;
    topics: string[];
    id: string;
    latestCommentId: string;
    latestPostId: string;
    name: string;
    avatar: string;
}
