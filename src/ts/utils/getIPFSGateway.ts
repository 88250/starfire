export const getIPFSGateway = async (ipfs: IIPFS) => {
    const config = await ipfs.config.get();
    return `http://127.0.0.1:${config.Addresses.Gateway.split("/").pop()}`;
};
