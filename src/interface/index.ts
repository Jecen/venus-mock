import { GraphQLObjectType, GraphQLString, buildSchema } from 'graphql';

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
}

type Method {
  id: ID!
  projectId: Int!
  hostId: Int!
  apiId: Int!
  name: String!
  method: Int!
  disable: Boolean!
  result: String
  params: [Param!]
  crDate: String!
}

type Api {
  id: ID!
  projectId: Int!
  hostId: Int!
  name: String!
  url: String!
  type: Int!
  methods: [Method!]
  crDate: String!
}

type Host {
  id: ID!
  projectId: Int!
  name: String!
  host: String!
  port: Int!
  path: String
  protocol: Int!
  online: Boolean!
  apis: [Api!]
  crDate: String!
}

type Project {
  id: ID!
  name: String!
  description: String
  img: String
  crDate: String!
  hosts: [Host!]
}

type Query {
  param(id: Int!): Param
  method(id: Int!): Method
  api(id: Int!): Api
  host(id: Int!): Host
  project(id: Int!): Project
  projectList: [Project!]
}
`);
