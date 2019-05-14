import cryptoKeys from "libp2p-crypto/src/keys";

export const sign = async (content: string) => {
    return new Promise((resolve) => {
        cryptoKeys.unmarshalPrivateKey(
            Buffer.from(Buffer.from((document.getElementById("privateKey") as HTMLInputElement).value,
                'base64')),
            (err: Error, privateKeyObj: any) => {
                privateKeyObj.sign(Buffer.from(content), (signErr: Error, signUint8Array: any) => {
                    resolve(signUint8Array.toString("hex"));
                });
            });
    });
};

export const verify = (content: string, publicKey: string, signature: string) => {
    try {
        const publicKeyObj: any = cryptoKeys.unmarshalPublicKey(Buffer.from(Buffer.from(publicKey, 'base64')));
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
