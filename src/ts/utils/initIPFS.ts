import ipfsClient from "ipfs-http-client";

if (!localStorage.APIAddress) {
    localStorage.APIAddress = location.protocol.replace(":", "") + "://" + location.hostname
        + ":5001";
}
const addressList = localStorage.APIAddress.split(":");
export const ipfs = ipfsClient(addressList[1].replace(/\/\//, ""), addressList[2], {protocol: addressList[0]});
