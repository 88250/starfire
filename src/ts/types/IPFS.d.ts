type Callback<T> = (error: Error, result?: T) => void;

interface IIPFS {
    key: any;
    name: any;
    get: any;
    types: ITypes;
    repo: IRepoAPI;
    bootstrap: any;
    config: any;
    block: any;
    object: IObjectAPI;
    dag: IDagAPI;
    libp2p: any;
    swarm: ISwarmAPI;
    files: IFilesAPI;
    bitswap: any;
    pubsub: any;

    init(options: IInitOptions, callback: Callback<boolean>): void;

    init(callback: Callback<boolean>): void;

    preStart(callback: Callback<any>): void;

    start(callback?: Callback<any>): void;

    stop(callback?: (error?: Error) => void): void;

    isOnline(): boolean;

    version(options: any, callback: (error: Error, version: IVersion) => void): void;

    version(options?: any): Promise<IVersion>;

    version(callback: (error: Error, version: IVersion) => void): void;

    id(options: any, callback: (error: Error, version: IId) => void): void;

    id(options?: any): Promise<IId>;

    id(callback: (error: Error, version: IId) => void): void;

    ping(callback: (error: Error) => void): void;

    ping(): Promise<void>;
}

interface IOptions {
    init?: boolean;
    start?: boolean;
    EXPERIMENTAL?: any;
    repo?: string;
    config?: any;
}

interface IInitOptions {
    emptyRepo?: boolean;
    bits?: number;
    log?: () => void;
}

interface IMultiaddr {
    buffer: Uint8Array;
}

interface ITypes {
    Buffer: any;
    PeerId: any;
    PeerInfo: any;
    multiaddr: IMultiaddr;
    multihash: string;
    CID: string;
}

interface IVersion {
    version: string;
    repo: string;
    commit: string;
}

interface IId {
    id: string;
    publicKey: string;
    addresses: IMultiaddr[];
    agentVersion: string;
    protocolVersion: string;
}

interface IRepoAPI {
    init(bits: number, empty: boolean, callback: Callback<any>): void;

    version(options: any, callback: Callback<any>): void;

    version(callback: Callback<any>): void;

    gc(): void;

    path(): string;
}

type FileContent = object | Blob | string;

interface IPFSFile {
    path: string;
    hash: string;
    size: number;
    content?: FileContent;
}

interface IFilesAPI {
    rm(path: string): void

    createAddStream(options: any, callback: Callback<any>): void;

    createAddStream(callback: Callback<any>): void;

    createPullStream(options: any): any;

    add(data: FileContent, options: any, callback: Callback<IPFSFile[]>): void;

    add(data: FileContent, options?: any): Promise<IPFSFile[]>;

    add(data: FileContent, callback: Callback<IPFSFile[]>): void;

    cat(hash: string, callback: Callback<FileContent>): void;

    cat(hash: string): Promise<FileContent>;

    get(hash: string, callback: Callback<IPFSFile>): void;

    get(hash: string): Promise<IPFSFile>;

    getPull(hash: string, callback: Callback<any>): void;

    stat(path: string, callback?: Callback<IObjectStat>): IObjectStat;

    write(path: string, content: Buffer, options?: any, callback?: Callback<string>): void;

    read(path: string, callback?: Callback<string>): string;
}

interface IPeersOptions {
    v?: boolean;
    verbose?: boolean;
}

type PeerId = any;

interface IPeerInfo {
    id: PeerId;
    multiaddr: IMultiaddr;
    multiaddrs: IMultiaddr[];

    distinctIMultiaddr(): IMultiaddr[];
}

interface IPeer {
    addr: IMultiaddr;
    peer: IPeerInfo;
}

interface ISwarmAPI {
    peers(options: IPeersOptions, callback: Callback<IPeer[]>): void;

    peers(options?: IPeersOptions): Promise<IPeer[]>;

    peers(callback: Callback<IPeer[]>): void;

    addrs(callback: Callback<IPeerInfo[]>): void;

    addrs(): Promise<IPeerInfo[]>;

    localAddrs(callback: Callback<IMultiaddr[]>): void;

    localAddrs(): Promise<IMultiaddr[]>;

    connect(maddr: IMultiaddr | string, callback: Callback<any>): void;

    connect(maddr: IMultiaddr | string): Promise<any>;

    disconnect(maddr: IMultiaddr | string, callback: Callback<any>): void;

    disconnect(maddr: IMultiaddr | string): Promise<any>;

    filters(callback: Callback<void>): never;
}

type DAGNode = any;
type DAGLink = any;
type DAGLinkRef = DAGLink | any;
type Obj = BufferSource | object;

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

interface IPutObjectOptions {
    enc?: any;
}

interface IGetObjectOptions {
    enc?: any;
}

interface IObjectPatchAPI {
    addLink(multihash: string, link: DAGLink, options: IGetObjectOptions, callback: Callback<any>): void;

    addLink(multihash: string, link: DAGLink, options?: IGetObjectOptions): Promise<any>;

    addLink(multihash: string, link: DAGLink, callback: Callback<any>): void;

    rmLink(multihash: string, linkRef: DAGLinkRef, options: IGetObjectOptions, callback: Callback<any>): void;

    rmLink(multihash: string, linkRef: DAGLinkRef, options?: IGetObjectOptions): Promise<any>;

    rmLink(multihash: string, linkRef: DAGLinkRef, callback: Callback<any>): void;

    appendData(multihash: string, data: any, options: IGetObjectOptions, callback: Callback<any>): void;

    appendData(multihash: string, data: any, options?: IGetObjectOptions): Promise<any>;

    appendData(multihash: string, data: any, callback: Callback<any>): void;

    setData(multihash: string, data: any, options: IGetObjectOptions, callback: Callback<any>): void;

    setData(multihash: string, data: any, options?: IGetObjectOptions): Promise<any>;

    setData(multihash: string, data: any, callback: Callback<any>): void;
}

interface IObjectAPI {

    patch: IObjectPatchAPI;

    "new"(template: "unixfs-dir", callback: Callback<DAGNode>): void;

    "new"(callback: Callback<DAGNode>): void;

    "new"(): Promise<DAGNode>;

    put(obj: Obj, options: IPutObjectOptions, callback: Callback<any>): void;

    put(obj: Obj, options?: IPutObjectOptions): Promise<any>;

    put(obj: Obj, callback: Callback<any>): void;

    get(multihash: string, options: IGetObjectOptions, callback: Callback<any>): void;

    get(multihash: string, options?: IGetObjectOptions): Promise<any>;

    get(multihash: string, callback: Callback<any>): void;

    data(multihash: string, options: IGetObjectOptions, callback: Callback<any>): void;

    data(multihash: string, options?: IGetObjectOptions): Promise<any>;

    data(multihash: string, callback: Callback<any>): void;

    links(multihash: string, options: IGetObjectOptions, callback: Callback<DAGLink[]>): void;

    links(multihash: string, options?: IGetObjectOptions): Promise<DAGLink[]>;

    links(multihash: string, callback: Callback<DAGLink[]>): void;

    stat(multihash: string, options: IGetObjectOptions, callback: Callback<IObjectStat>): void;

    stat(multihash: string, options?: IGetObjectOptions): Promise<IObjectStat>;

    stat(multihash: string, callback: Callback<IObjectStat>): void;
}

interface IDagAPI {
    put(dagNode: any, options: any, callback: Callback<any>): void;

    put(dagNode: any, options: any): Promise<any>;

    get(cid: string, path: string, options: any, callback: Callback<any>): void;

    get(cid: string, path?: string, options?: any): Promise<any>;

    get(cid: string, path: string, callback: Callback<any>): void;

    get(cid: string, callback: Callback<any>): void;

    tree(cid: string, path: string, options: any, callback: Callback<any>): void;

    tree(cid: string, path?: string, options?: any): Promise<any>;

    tree(cid: string, path: string, callback: Callback<any>): void;

    tree(cid: string, options: any): Promise<any>;

    tree(cid: string, callback: Callback<any>): void;
}
