import multiaddr from "multiaddr";

export const getIPFSGateway = async (ipfs: IIPFS) => {
    const sessionGatewar = sessionStorage.getItem("gateway");
    if (sessionGatewar) {
        return sessionGatewar;
    }
    const config = await ipfs.config.get();
    const addr = multiaddr(config.Addresses.Gateway).nodeAddress();
    const gateway = `http://${addr.address}:${addr.port}`;
    sessionStorage.setItem("gateway", gateway);
    return gateway;
};
