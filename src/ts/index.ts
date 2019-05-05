import ipfsClient from "ipfs-http-client";
import "../assets/scss/index.scss";
import {IPFSFile} from "./types/IPFS";

// leaving out the arguments will default to these values
const ipfs = ipfsClient("localhost", "5001", {protocol: "http"});

const add = async () => {
    const files = [
        {
            content: ipfsClient.Buffer.from("ABC"),
            path: "webpack.config.js",
        },
    ];

    const results = await ipfs.add(files);

    console.log(results);
};

// add();

const get = () => {
    ipfs.get("QmNz1UBzpdd4HfZ3qir3aPiRdX5a93XwTuDNyXRc6PKhWW", function(err: Error, files: IPFSFile[]) {
        files.forEach((file: IPFSFile) => {
            console.log(file);
            console.log(file.content.toString());
        });
    });
};

get();
