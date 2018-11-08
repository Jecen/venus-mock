import log from '../common/log';
import responseHelper from '../common/responseHelper';

import ProjectHandler from '../handler/ProjectHandler';
import HostHandler from '../handler/HostHandler';
import CommonHandler from '../handler/CommonHandler';

class ApiService {

  projectHandler: ProjectHandler;
  hostHandler: HostHandler;
  commonHandler: CommonHandler;

  constructor() {
    this.projectHandler = new ProjectHandler();
    this.hostHandler = new HostHandler();
    this.commonHandler = new CommonHandler();
    log.sysInfo('API SERVICE IS READY');
  }

  public async handler(ctx): Promise<object> {
    return new Promise((resolve, reject) => {
      const {
        params: { action, type },
        query,
        request: { method, body },
      } = ctx;
      console.log(ctx.request.body, query);
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
