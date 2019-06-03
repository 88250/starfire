import bs58 from "bs58";
import Multihashing from "multihashing-async";

export const isNodeIdPost = async (publicKey: string, nodeId: string) => {
    const buf = await Multihashing(Buffer.from(publicKey, "base64"), "sha2-256");
    return nodeId === bs58.encode(buf)
};