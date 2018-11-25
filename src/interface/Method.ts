
import { Method as ImpMethod } from './index';
import { handler as paramHandler } from '../handler/ParamHandler';
import { handler as commonHandler } from '../handler/CommonHandler';
import Param from './Param';
import List from './List';
export default class Method implements ImpMethod {
  id: number;
  projectId: number;
  hostId: number;
  apiId: number;
  name: string;
  method: number;
  disable: number;
  result: string;
  crDate: Date;

  constructor(param: Method) {
    const props = [
      'id', 'projectId', 'hostId', 'apiId', 'name',
      'method', 'disable', 'result', 'crDate',
    ];
    Object.keys(param).forEach((key) => {
      if (props.indexOf(key) > -1) {
        this[key] = param[key];
      }
    });
  }

  async params() {
    const apiId = this.id;
    const data = await paramHandler.getList({ id: apiId });
    return new List({...data, list: data.list.map((p) => {
      return new Param(p);
    })});
  }

  async methodName() {
    const method = this.method;
    const dictMap = await commonHandler.obtainDict('method');
    return dictMap[method].name;
  }
}
