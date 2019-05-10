import ipfsClient from "ipfs-http-client";

export const ipfs = ipfsClient("127.0.0.1", "5001", {protocol: "http"});