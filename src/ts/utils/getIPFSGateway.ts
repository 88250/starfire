export const getIPFSGateway = async (ipfs: IIPFS) => {
    const sessionGatewar = sessionStorage.getItem('gateway')
    if (sessionGatewar) {
        return sessionGatewar
    }
    const config = await ipfs.config.get();
    const gateway = `http://127.0.0.1:${config.Addresses.Gateway.split("/").pop()}`
    sessionStorage.setItem('gateway', gateway)
    return gateway
};
