export interface Host {
    id: number,
    name: string,
    host: string,
    path: string,
    protocol: number,
    online: boolean,
    crDate: Date,
}

export interface Api {
    id: number,
    hostId: number,
    name: string,
    url: string,
    type: number,
    crDate: Date,
}

export interface Method {
    id: number,
    apiId: number,
    name: string,
    method: number,
    result: string,
    crDate: Date,
}

export interface Param {
    id: number,
    methodId: number,
    key: string,
    name: string,
    type: number,
    info: string,
    mandatory: boolean,
    crDate: Date,
}

