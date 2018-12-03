import { buildSchema } from 'graphql';

export interface Project {
  id: number;
  name: string;
  description: string;
  img: string;
  crDate: Date;
}

export interface Host {
  id: number;
  projectId: number;
  name: string;
  host: string;
  port: number;
  path: string;
  protocol: number;
  online: boolean;
  crDate: Date;
}

export interface Api {
  id: number;
  projectId: number;
  hostId: number;
  name: string;
  url: string;
  type: number;
  crDate: Date;
}

export interface Method {
  id: number;
  projectId: number;
  hostId: number;
  apiId: number;
  name: string;
  method: number;
  disable: number;
  result: string;
  crDate: Date;
}

export interface Param {
  id: number;
  projectId: number;
  hostId: number;
  apiId: number;
  methodId: number;
  key: string;
  name: string;
  type: number;
  info: string;
  mandatory: boolean;
  crDate: Date;
}

// String、Int、Float、Boolean 和 ID

export const schema = buildSchema(`
  type Record {
    id: ID!
    projectId: Int!
    hostId: Int!
    apiId: Int!
    methodId: Int!
    url: String!
    success: Boolean!
    msg: String
    crDate: String!
  }

  type Param {
    id: ID!
    projectId: Int!
    hostId: Int!
    apiId: Int!
    methodId: Int!
    key: String!
    name: String!
    type:  Int!
    info: String
    mandatory: Boolean!
    crDate: String!
    records(page: Int = 1, size: Int = 10, query: String = "%"): RecordList
  }

  type Method {
    id: ID!
    projectId: Int!
    hostId: Int!
    apiId: Int!
    name: String!
    method: Int!
    methodName: String!
    disable: Boolean!
    result: String
    params (page: Int = 1, size: Int = 10, query: String = "%") : ParamList
    crDate: String!
    records(page: Int = 1, size: Int = 10, query: String = "%"): RecordList
  }

  type Api {
    id: ID!
    projectId: Int!
    hostId: Int!
    name: String!
    url: String!
    type: Int!
    methods (page: Int = 1, size: Int = 10, query: String = "%") : MethodList
    crDate: String!
    records(page: Int = 1, size: Int = 10, query: String = "%"): RecordList
  }

  type Host {
    id: ID!
    projectId: Int!
    name: String!
    host: String!
    port: Int!
    path: String
    protocol: Int!
    protocolName: String!
    online: Boolean!
    apis (page: Int = 1, size: Int = 10, query: String = "%") : ApiList
    crDate: String!
    records(page: Int = 1, size: Int = 10, query: String = "%"): RecordList
  }

  type Project {
    id: ID!
    name: String!
    description: String
    img: String
    crDate: String!
    hosts (page: Int = 1, size: Int = 10, query: String = "%") : HostList
    records(page: Int = 1, size: Int = 10, query: String = "%"): RecordList
  }

  interface List {
    page: Int!
    size: Int!
    total: Int!
  }

  type ProjectList implements List {
    page: Int!
    size: Int!
    total: Int!
    list: [Project!]
  }

  type HostList implements List {
    page: Int!
    size: Int!
    total: Int!
    list: [Host!]
  }

  type ApiList implements List {
    page: Int!
    size: Int!
    total: Int!
    list: [Api!]
  }

  type MethodList implements List {
    page: Int!
    size: Int!
    total: Int!
    list: [Method!]
  }

  type ParamList implements List {
    page: Int!
    size: Int!
    total: Int!
    list: [Param!]
  }

  type RecordList implements List {
    page: Int!
    size: Int!
    total: Int!
    list: [Record!]
  }

  type Query {
    param(id: Int!): Param
    paramList(page: Int = 1, size: Int = 10, query: String = "%"): ParamList
    method(id: Int!): Method
    methodList(page: Int = 1, size: Int = 10, query: String = "%"): MethodList
    api(id: Int!): Api
    apiList(page: Int = 1, size: Int = 10, query: String = "%"): ApiList
    host(id: Int!): Host
    hostList(page: Int = 1, size: Int = 10, query: String = "%"): HostList
    project(id: Int!): Project
    projectList(page: Int = 1, size: Int = 10, query: String = "%") : ProjectList
    records(page: Int = 1, size: Int = 10, query: String = "%"): RecordList
  }

  input projectField {
    name: String!
    description: String!
    img: String
  }

  input updateProjectField {
    id:  ID!
    name: String!
    description: String!
    img: String
  }

  input hostField {
    projectId: Int!
    name: String!
    host: String!
    path: String!
    port: Int!
    online: Boolean!
    protocol: Int!
  }

  input apiField {
    projectId: Int!
    hostId: Int!
    name: String!
    url: String!
    type: Int!
  }

  input methodField {
    projectId: Int!
    hostId: Int!
    apiId: Int!
    name: String!
    method: Int!
    disable: Boolean!
    result: String
  }

  input paramField {
    projectId: Int!
    hostId: Int!
    apiId: Int!
    methodId: Int!
    key: String!
    name: String!
    type:  Int!
    info: String
    mandatory: Boolean!
  }

  input updateHostField {
    id: Int!
    name: String
    host: String
    port: Int
    path: String
    protocol: Int
    online: Boolean
  }

  type Mutation {
    insertProject(project: projectField!): ID
    updateProject(project: updateProjectField!): ID
    deleteProject(id: ID!): ID

    insertHost(host: hostField!): ID
    updateHost(host: updateHostField!): Boolean

    insertApi(api: apiField!): ID

    insertMethod(method: methodField!): ID

    insertParams(params: [paramField]!): Boolean

  }
`);
