import cryptoKeys from "libp2p-crypto/src/keys";
import {showMsg} from "./msg";

interface IPrivateKeyObj {
    sign(content: Buffer, cb: (error: Error, sing: Uint8Array) => void): string;

    verify(content: Buffer, sing: Uint8Array, cb: (err: Error, isMatch: boolean) => void): string;
}

export const sign = async (content: string) => {
    return new Promise<string>((resolve) => {
        try {
            cryptoKeys.unmarshalPrivateKey(
                Buffer.from(Buffer.from((document.getElementById("privateKey") as HTMLInputElement).value,
                    "base64")),
                (err: Error, privateKeyObj: IPrivateKeyObj) => {
                    privateKeyObj.sign(Buffer.from(content), (signErr: Error, signUint8Array: Buffer) => {
                        resolve(signUint8Array.toString("hex"));
                    });
                });
        } catch (e) {
            resolve("");
            showMsg("密钥对移除");
        }
    });
};

export const verify = (content: string, publicKey: string, signature: string) => {
    try {
        const publicKeyObj: IPrivateKeyObj = cryptoKeys.unmarshalPublicKey(
            Buffer.from(Buffer.from(publicKey, "base64")));
        return new Promise((resolve) => {
            publicKeyObj.verify(Buffer.from(content), Uint8Array.from(Buffer.from(signature, "hex")),
                (err: Error, isMatch: boolean) => {
                    resolve(isMatch);
                });
        });
    } catch (e) {
        return false;
    }
};
