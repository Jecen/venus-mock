import log from '../common/log';
import responseHelper from '../common/responseHelper';

import { handler as projectHandler, ProjectHandler } from '../handler/ProjectHandler';
import { handler as hostHandler, HostHandler } from '../handler/HostHandler';
import { handler as commonHandler, CommonHandler } from '../handler/CommonHandler';
import { handler as apiHandler, ApiHandler } from '../handler/ApiHandler';
import { handler as methodHandler, MethodHandler } from '../handler/MethodHandler';
import { handler as paramHandler, ParamHandler } from '../handler/ParamHandler';

class ApiService {

  projectHandler: ProjectHandler;
  hostHandler: HostHandler;
  commonHandler: CommonHandler;
  apiHandler: ApiHandler;
  methodHandler: MethodHandler;
  paramHandler: ParamHandler;

  constructor() {
    this.projectHandler = projectHandler;
    this.hostHandler = hostHandler;
    this.commonHandler = commonHandler;
    this.apiHandler = apiHandler;
    this.methodHandler = methodHandler;
    this.paramHandler = paramHandler;
    log.sysInfo('API SERVICE IS READY');
  }

  public async handler(ctx): Promise<object> {
    return new Promise((resolve, reject) => {
      const {
        params: { action, type },
        query,
        request: { method, body },
      } = ctx;
      const args = method === 'GET' || method === 'DELETE' ? query : body;
      let res: object = {};
      let handler = null;

      switch (type) {
        case 'host':
          handler = this.hostHandler.handle(action, args);
          break;
        case 'project':
          handler = this.projectHandler.handle(action, args);
          break;
        case 'api':
          handler = this.apiHandler.handle(action, args);
          break;
        case 'method':
          handler = this.methodHandler.handle(action, args);
          break;
        case 'param':
          handler = this.paramHandler.handle(action, args);
          break;
        case 'common':
          handler = this.commonHandler.handle(action, args);
          break;
        default:
          resolve(null);
          break;
      }
      if (handler) {
        handler
          .then((result) => {
            res = responseHelper.newResponse(result);
            resolve(res);
          })
          .catch((e) => {
            res = responseHelper.newResponse(
              null,
              false,
              e || '服务端出错，请联系管理员',
            );
            resolve(res);
          });
      } else {
        resolve(null);
      }
    });
  }
}

const service: ApiService = new ApiService();

export { service, ApiService as apiService };
