import log from '../common/log';
import responseHelper from '../common/responseHelper';

import Param from '../interface/Param';
import Method from '../interface/Method';
import Api from '../interface/Api';
import Host from '../interface/Host';
import Project from '../interface/Project';
import List from '../interface/List';

import { handler as projectHandler, ProjectHandler } from '../handler/ProjectHandler';
import { handler as hostHandler, HostHandler } from '../handler/HostHandler';
import { handler as commonHandler, CommonHandler } from '../handler/CommonHandler';
import { handler as apiHandler, ApiHandler } from '../handler/ApiHandler';
import { handler as methodHandler, MethodHandler } from '../handler/MethodHandler';
import { handler as paramHandler, ParamHandler } from '../handler/ParamHandler';
import { schema } from '../interface';
import { graphql } from 'graphql';

class GraphQLService {

  projectHandler: ProjectHandler;
  hostHandler: HostHandler;
  commonHandler: CommonHandler;
  apiHandler: ApiHandler;
  methodHandler: MethodHandler;
  paramHandler: ParamHandler;

  root: any;

  constructor() {
    this.projectHandler = projectHandler;
    this.hostHandler = hostHandler;
    this.commonHandler = commonHandler;
    this.apiHandler = apiHandler;
    this.methodHandler = methodHandler;
    this.paramHandler = paramHandler;

    this.root = this.initGraphQLRootValue();
    log.sysInfo('GRAPHQL SERVICE IS READY');
  }

  private initGraphQLRootValue() {
    return {
      // Query
      param: async ({ id }) =>  {
        const param = await this.paramHandler.obtain({ id: id || '' });
        return new Param(param);
      },
      paramList: async (params) => {
        const data = await this.paramHandler.getList(params || {});
        const { list } = data;
        return new List({...data, list: list.map((p) => {
          return new Param(p);
        })});
      },
      method: async ({ id }) =>  {
        const method = await this.methodHandler.obtain({ id: id || '' });
        return new Method(method);
      },
      methodList: async (params) => {
        const data = await this.methodHandler.getList(params || {});
        const { list } = data;
        return new List({...data, list: list.map((m) => {
          return new Method(m);
        })});
      },
      api: async ({ id }) => {
        const api = await this.apiHandler.obtain({ id: id || '' });
        return new Api(api);
      },
      apiList: async (params) => {
        const data = await this.apiHandler.getList(params || {});
        const { list } = data;
        return new List({...data, list: list.map((a) => {
          return new Api(a);
        })});
      },
      host: async ({ id }) => {
        const host = await this.hostHandler.obtain({ id: id || '' });
        return new Host(host);
      },
      hostList: async (params) => {
        const data = await this.hostHandler.getList(params || {});
        const { list } = data;
        return new List({...data, list: list.map((h) => {
          return new Host(h);
        })});
      },
      project: async ({ id }) => {
        const project = await this.projectHandler.obtain({ id: id || '' });
        return new Project(project);
      },
      projectList: async (params) => {
        const data = await this.projectHandler.getList(params || {});
        const { list } = data;
        return new List({...data, list: list.map((p) => {
          return new Project(p);
        })});
      },
      // Mutation
      insertProject: async ({ project }) => {
        return (await this.projectHandler.insert(project)).id;
      },
      updateProject: async ({ project }) => {
        const data = await this.projectHandler.update(project);
        return data.id;
      },
      deleteProject: async ({ id }) => {
        const data = await this.projectHandler.del({ id });
        return data.id;
      },
      insertHost: async ({ host }) => {
        return (await this.hostHandler.insert(host)).id;
      },
      updateHost: async({ host }) => {
        const rst = await this.hostHandler.update(host);
        return rst.id === 0 || !!rst.id;
      },
      insertApi: async ({ api }) => {
        return (await this.apiHandler.insert(api)).id;
      },
      updateApi: async({ api }) => {
        const rst = await this.apiHandler.update(api);
        return rst.id === 0 || !!rst.id;
      },
      insertMethod: async ({ method }) => {
        return (await this.methodHandler.insert(method)).id;
      },
      insertParams: async ({ params }) => {
        return await this.paramHandler.batchInsert(params);
      },
    };
  }

  public async handler(ctx): Promise<object> {
    return new Promise(async (resolve, reject) => {
      const { request: { body: { query, variable } } } = ctx;

      const { data, errors } = await graphql(
        schema,
        query,
        this.root,
        null,
        variable,
      );
      let msg = '';
      if (errors && errors.length > 0) {
        errors.forEach((error) => {
          log.sysError(error.message);
          msg += `${error.message} `;
        });
        resolve(responseHelper.newResponse(null, false, `服务端错误，请联系管理员。<br> [${msg}]`));
      } else {
        resolve(responseHelper.newResponse(data));
      }
    });
  }
}

const service: GraphQLService = new GraphQLService();

export { service };
