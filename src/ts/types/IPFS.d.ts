import { EventEmitter } from "events";

export as namespace ipfs;

type Callback<T> = (error: Error, result?: T) => void;

declare class IPFS extends EventEmitter {

    public types: ITypes;

    public repo: IRepoAPI;
    public bootstrap: any;
    public config: any;
    public block: any;
    public object: IObjectAPI;
    public dag: IDagAPI;
    public libp2p: any;
    public swarm: ISwarmAPI;
    public files: IFilesAPI;
    public bitswap: any;

    public pubsub: any;
    constructor(options: IOptions);

    public init(options: IInitOptions, callback: Callback<boolean>): void;
    public init(callback: Callback<boolean>): void;

    public preStart(callback: Callback<any>): void;
    public start(callback?: Callback<any>): void;
    public stop(callback?: (error?: Error) => void): void;
    public isOnline(): boolean;

    public version(options: any, callback: (error: Error, version: IVersion) => void): void ;
    public version(options?: any): Promise<IVersion>;
    public version(callback: (error: Error, version: IVersion) => void): void ;

    public id(options: any, callback: (error: Error, version: IId) => void): void ;
    public id(options?: any): Promise<IId>;
    public id(callback: (error: Error, version: IId) => void): void ;

    public ping(callback: (error: Error) => void): void;
    public ping(): Promise<void>;
}

export interface IOptions {
        init?: boolean;
        start?: boolean;
        EXPERIMENTAL?: any;
        repo?: string;
        config?: any;
    }

export interface IInitOptions {
        emptyRepo?: boolean;
        bits?: number;
        log?: () => void;
    }

export interface IMultiaddr {
        buffer: Uint8Array;
    }

export type Multihash = any | string;
export type CID = any;

export interface ITypes {
        Buffer: any;
        PeerId: any;
        PeerInfo: any;
        multiaddr: IMultiaddr;
        multihash: Multihash;
        CID: CID;
    }

export interface IVersion {
        version: string;
        repo: string;
        commit: string;
    }

export interface IId {
        id: string;
        publicKey: string;
        addresses: IMultiaddr[];
        agentVersion: string;
        protocolVersion: string;
    }

export interface IRepoAPI {
        init(bits: number, empty: boolean, callback: Callback<any>): void;

        version(options: any, callback: Callback<any>): void;
        version(callback: Callback<any>): void;

        gc(): void;
        path(): string;
    }

export type FileContent = object | Blob | string;

export interface IPFSFile {
        path: string;
        hash: string;
        size: number;
        content?: FileContent;
    }

export interface IFilesAPI {
        createAddStream(options: any, callback: Callback<any>): void;
        createAddStream(callback: Callback<any>): void;

        createPullStream(options: any): any;

        add(data: FileContent, options: any, callback: Callback<IPFSFile[]>): void;
        add(data: FileContent, options?: any): Promise<IPFSFile[]>;
        add(data: FileContent, callback: Callback<IPFSFile[]>): void;

        cat(hash: Multihash, callback: Callback<FileContent>): void;
        cat(hash: Multihash): Promise<FileContent>;

        get(hash: Multihash, callback: Callback<IPFSFile>): void;
        get(hash: Multihash): Promise<IPFSFile>;

        getPull(hash: Multihash, callback: Callback<any>): void;
    }

export interface IPeersOptions {
        v?: boolean;
        verbose?: boolean;
    }

export type PeerId = any;

export interface IPeerInfo {
        id: PeerId;
        multiaddr: IMultiaddr;
        multiaddrs: IMultiaddr[];
        distinctIMultiaddr(): IMultiaddr[];
    }

export interface IPeer {
        addr: IMultiaddr;
        peer: IPeerInfo;
    }

export interface ISwarmAPI {
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

export type DAGNode = any;
export type DAGLink = any;
export type DAGLinkRef = DAGLink | any;
export type Obj = BufferSource | object;

export interface IObjectStat {
        Hash: Multihash;
        NumLinks: number;
        BlockSize: number;
        LinksSize: number;
        DataSize: number;
        CumulativeSize: number;
    }

export interface IPutObjectOptions {
        enc?: any;
    }

export interface IGetObjectOptions {
        enc?: any;
    }

export interface IObjectPatchAPI {
        addLink(multihash: Multihash, link: DAGLink, options: IGetObjectOptions, callback: Callback<any>): void;
        addLink(multihash: Multihash, link: DAGLink, options?: IGetObjectOptions): Promise<any>;
        addLink(multihash: Multihash, link: DAGLink, callback: Callback<any>): void;

        rmLink(multihash: Multihash, linkRef: DAGLinkRef, options: IGetObjectOptions, callback: Callback<any>): void;
        rmLink(multihash: Multihash, linkRef: DAGLinkRef, options?: IGetObjectOptions): Promise<any>;
        rmLink(multihash: Multihash, linkRef: DAGLinkRef, callback: Callback<any>): void;

        appendData(multihash: Multihash, data: any, options: IGetObjectOptions, callback: Callback<any>): void;
        appendData(multihash: Multihash, data: any, options?: IGetObjectOptions): Promise<any>;
        appendData(multihash: Multihash, data: any, callback: Callback<any>): void;

        setData(multihash: Multihash, data: any, options: IGetObjectOptions, callback: Callback<any>): void;
        setData(multihash: Multihash, data: any, options?: IGetObjectOptions): Promise<any>;
        setData(multihash: Multihash, data: any, callback: Callback<any>): void;
    }

export interface IObjectAPI {

        patch: IObjectPatchAPI;
        "new"(template: "unixfs-dir", callback: Callback<DAGNode>): void;
        "new"(callback: Callback<DAGNode>): void;
        "new"(): Promise<DAGNode>;

        put(obj: Obj, options: IPutObjectOptions, callback: Callback<any>): void;
        put(obj: Obj, options?: IPutObjectOptions): Promise<any>;
        put(obj: Obj, callback: Callback<any>): void;

        get(multihash: Multihash, options: IGetObjectOptions, callback: Callback<any>): void;
        get(multihash: Multihash, options?: IGetObjectOptions): Promise<any>;
        get(multihash: Multihash, callback: Callback<any>): void;

        data(multihash: Multihash, options: IGetObjectOptions, callback: Callback<any>): void;
        data(multihash: Multihash, options?: IGetObjectOptions): Promise<any>;
        data(multihash: Multihash, callback: Callback<any>): void;

        links(multihash: Multihash, options: IGetObjectOptions, callback: Callback<DAGLink[]>): void;
        links(multihash: Multihash, options?: IGetObjectOptions): Promise<DAGLink[]>;
        links(multihash: Multihash, callback: Callback<DAGLink[]>): void;

        stat(multihash: Multihash, options: IGetObjectOptions, callback: Callback<IObjectStat>): void;
        stat(multihash: Multihash, options?: IGetObjectOptions): Promise<IObjectStat>;
        stat(multihash: Multihash, callback: Callback<IObjectStat>): void;
    }

export interface IDagAPI {
        put(dagNode: any, options: any, callback: Callback<any>): void;
        put(dagNode: any, options: any): Promise<any>;

        get(cid: string | CID, path: string, options: any, callback: Callback<any>): void;
        get(cid: string | CID, path?: string, options?: any): Promise<any>;
        get(cid: string | CID, path: string, callback: Callback<any>): void;
        get(cid: string | CID, callback: Callback<any>): void;

        tree(cid: string | CID, path: string, options: any, callback: Callback<any>): void;
        tree(cid: string | CID, path?: string, options?: any): Promise<any>;
        tree(cid: string | CID, path: string, callback: Callback<any>): void;
        tree(cid: string | CID, options: any): Promise<any>;
        tree(cid: string | CID, callback: Callback<any>): void;
    }

export function createNode(options: IOptions): IPFS;
