type Callback<T> = (error: Error, result?: T) => void;

interface IObjectStat {
    blocks: number;
    cumulativeSize: number;
    hash: string;
    local?: string;
    size: number;
    sizeLocal?: string;
    type: string;
    withLocality: boolean;
}

interface IFilesAPI {
    write(path: string, content: Buffer, options?: any, callback?: Callback<string>): void;

    read(path: string, callback?: Callback<string>): string;

    stat(path: string, callback?: Callback<IObjectStat>): IObjectStat;
}

interface INameAPI {
    publish(path: string): void;

    resolve(path: string): string;
}

interface IPFSFile {
    path: string;
    hash: string;
    size: number;
    content?: object | Blob | string;
}

interface IDagAPI {
    put(dagNode: any, options?: any, callback?: Callback<any>): Promise<any>;

    get(cid: string, path?: string, options?: any): Promise<any>;
}

interface IMultiaddr {
    buffer: Uint8Array;
}

interface IPeerInfo {
    multiaddr: IMultiaddr;
    multiaddrs: IMultiaddr[];
    _idB58String: string;

    distinctIMultiaddr(): IMultiaddr[];
}

interface IPeer {
    addr: IMultiaddr;
    peer: IPeerInfo;
}

interface ISwarmAPI {
    peers(callback: Callback<IPeer[]>): void;

    disconnect(maddr: string): void;
}

interface IPubsubAPI {
    subscribe(topic: string, callback: Callback<IMsg>): void;

    publish(topic: string, buffer: Buffer): void;
}

interface IIPFS {
    config: {
        get: () => {
            Addresses: {
                Gateway: string,
            },
        },
    };

    files: IFilesAPI;
    name: INameAPI;
    dag: IDagAPI;
    swarm: ISwarmAPI;
    pubsub: IPubsubAPI;

    cat(id: string): string;

    get(name: string): IPFSFile[];
}
