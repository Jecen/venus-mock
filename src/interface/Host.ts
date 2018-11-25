import { Host as ImHost } from './index';
import { handler as apiHandler } from '../handler/ApiHandler';
import Api from './Api';
import List from './List';
import { handler as commonHandler } from '../handler/CommonHandler';

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
    const data = await apiHandler.getList({ id: hostId });
    const { list } = data;
    return new List({...data, list: list.map((a) => {
      return new Api(a);
    })});
  }

  async protocolName() {
    const protocol = this.protocol;
    const dictMap = await commonHandler.obtainDict('protocol');
    return dictMap[protocol].name;
  }
}
