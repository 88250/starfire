declare module "*.svg" {
    const content: string;
    export default content;
}

declare module "ipfs-http-client";

interface IUser {
    id: string
    latestCommentId: string
    latestPostId: string
    name: string
    avatar: string
}
