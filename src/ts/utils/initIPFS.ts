import ipfsClient from "ipfs-http-client";

const addressList = localStorage.APIAddress.split(":");
export const ipfs = ipfsClient(addressList[1].replace(/\/\//, ""), addressList[2], {protocol: addressList[0]});
