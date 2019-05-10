import base64js from "base64-js";
import cryptoKeys from "libp2p-crypto/src/keys";

export const sign = async (content: string) => {
    const privateKey = base64js.toByteArray(localStorage.privateKey)
    return new Promise((resolve) => {
        cryptoKeys.unmarshalPrivateKey(Buffer.from(privateKey), (err: Error, privateKeyObj: any) => {
            privateKeyObj.sign(Buffer.from(content), (err: Error, signUint8Array: any) => {
                resolve(signUint8Array.toString('hex'));
            })
        })
    });
}

export const verify =  (content: string, publicKey: string, signature: string) => {
    const publicKeyObj: any = cryptoKeys.unmarshalPublicKey(Buffer.from(base64js.toByteArray(publicKey)))
    return new Promise((resolve) => {
        publicKeyObj.verify(Buffer.from(content), Uint8Array.from(Buffer.from(signature, 'hex')), (err: Error, isMatch: boolean) => {
            resolve(isMatch)
        })
    })
}