import { Host as ImHost } from './index';
import ApiHandler from '../handler/ApiHandler';
import Api from './Api';

export default class Host implements ImHost {
  id: number;
  projectId: number;
  name: string;
  host: string;
  port: number;
  path: string;
  protocol: number;
  online: boolean;
  crDate: Date;

  constructor(param: ImHost) {
    const props = [
      'id', 'projectId', 'name', 'host', 'port', 'path',
      'protocol', 'online', 'crDate',
    ];
    Object.keys(param).forEach((key) => {
      if (props.indexOf(key) > -1) {
        this[key] = param[key];
      }
    });
  }

  async apis() {
    const hostId = this.id;
    const { list: data } = await new ApiHandler().getList({ id: hostId });
    const apis = data.map((itm) => {
      return new Api(itm);
    });
    return apis;
  }
}
