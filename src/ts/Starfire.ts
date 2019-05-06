import ipfsClient from "ipfs-http-client";
import {Post} from './Post'

// const add = async () => {
//     const files = [
//         {
//             content: ipfsClient.Buffer.from("ABCD"),
//             path: "/Users/Vanessa/Work/Code/starfire/webpack.config.js",
//         },
//     ];
//
//     const results = await ipfs.add(files);
//
//     console.log(results);
//
// };
//
// // add();
//
// const get = () => {
//     ipfs.get("QmZV7wx99NoBPvYGRoi2XY9SDpp4B7TTYQs1GFJAPDoZjP", function (err: Error, files: any[]) {
//         files.forEach((file: any) => {
//             console.log(file);
//             console.log(file.content.toString());
//         });
//     });
//
//     // // const addr = '/ipfs/QmNz1UBzpdd4HfZ3qir3aPiRdX5a93XwTuDNyXRc6PKhWW' // ABC https://gateway.ipfs.io/ipns/QmZV7wx99NoBPvYGRoi2XY9SDpp4B7TTYQs1GFJAPDoZjP
//     // const addr = '/ipfs/QmZ655k2oftYnsocBxqTWzDer3GNui2XQTtcA4ZUbhpz5N' // ABCD
//     //

// };
// // get();
//
//
// const test = () => {
//     // ipfs.name.resolve('/ipns/QmZV7wx99NoBPvYGRoi2XY9SDpp4B7TTYQs1GFJAPDoZjP', function (err: Error, name: string) {
//     //     console.log(name)
//     //     // /ipfs/QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm
//     // })
//
//     ipfs.files.ls('/', (error: Error, buf: string) => {
//         console.log(buf)
//     })
//     // ipfs.files.stat('/c', (err: Error, s: string) => {
//     //     console.error(err, s)
//     // })
//     ipfs.files.read('/d', (error: Error, buf: string) => {
//         console.log(buf.toString())
//     })
// }
//
// test()

class Starfire {
    public ipfs: IIPFS;

    constructor() {
        this.ipfs = ipfsClient("localhost", "5001", {protocol: "http"});
        this.isInit()

        const post = new Post(this.ipfs)
        post.init()
    }

    initList(files: IPFSFile[]) {
        files.forEach((file: IPFSFile) => {
            const list = JSON.parse(file.content.toString()).posts
            list.forEach(async (post: string) => {
                const result = await this.ipfs.dag.get(post)
                document.getElementById('list').insertAdjacentHTML('beforeend',
                    `<li>${result.value.content}</li>`)

            })
        })
    }

    async isInit() {
        if (!localStorage.userId) {
            window.location.href = 'init.html'
        }

        try {
            this.ipfs.files.stat(`/starfire/${localStorage.userId}`, (err: Error, stat: IObjectStat) => {
                this.ipfs.get(stat.hash, (err: Error, files: IPFSFile[]) => {
                    this.initList(files)
                })
            })
        } catch (e) {
            window.location.href = 'init.html'
        }
    }
}

export default Starfire;