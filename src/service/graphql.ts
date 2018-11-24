import log from '../common/log';
import responseHelper from '../common/responseHelper';

import Param from '../interface/Param';
import Method from '../interface/Method';
import Api from '../interface/Api';

import ProjectHandler from '../handler/ProjectHandler';
import HostHandler from '../handler/HostHandler';
import CommonHandler from '../handler/CommonHandler';
import ApiHandler from '../handler/ApiHandler';
import MethodHandler from '../handler/MethodHandler';
import ParamHandler from '../handler/ParamHandler';
import { schema } from '../interface';

import {
  graphql,
} from 'graphql';
import Host from '../interface/Host';
import Project from '../interface/Project';

class GraphQLService {

  projectHandler: ProjectHandler;
  hostHandler: HostHandler;
  commonHandler: CommonHandler;
  apiHandler: ApiHandler;
  methodHandler: MethodHandler;
  paramHandler: ParamHandler;

  resolver: any;
  schema: any;

  constructor() {
    this.projectHandler = new ProjectHandler();
    this.hostHandler = new HostHandler();
    this.commonHandler = new CommonHandler();
    this.apiHandler = new ApiHandler();
    this.methodHandler = new MethodHandler();
    this.paramHandler = new ParamHandler();

    log.sysInfo('GRAPHQL SERVICE IS READY');
  }

  public async handler(ctx): Promise<object> {
    return new Promise(async (resolve, reject) => {
      const { request: { body: { query, variable } } } = ctx;

      const { data } = await graphql(
        schema,
        query,
        {
          param: async ({ id }) =>  {
            const param = await this.paramHandler.obtain({ id });
            return new Param(param);
          },
          method: async ({ id }) =>  {
            const method = await this.methodHandler.obtain({ id });
            return new Method(method);
          },
          api: async ({ id }) => {
            const api = await this.apiHandler.obtain({ id });
            return new Api(api);
          },
          host: async ({ id }) => {
            const host = await this.hostHandler.obtain({ id });
            return new Host(host);
          },
          project: async ({ id }) => {
            const project = await this.projectHandler.obtain({ id });
            return new Project(project);
          },
          projectList: async () => {
            const { list: data } = await this.projectHandler.getList({});
            return data.map((p) => {
              return new Project(p);
            });
          },
        },
        null,
        variable,
      );
      resolve(responseHelper.newResponse(data));
    });
  }
}

const service: GraphQLService = new GraphQLService();

export { service };
