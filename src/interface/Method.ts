
import { Method as ImpMethod } from './index';
import ParamHandler from '../handler/ParamHandler';
import Param from './Param';

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
    const paramHandler = new ParamHandler();
    const { list: params } = await paramHandler.getList({ id: this.id });
    return params.map((p) => { return new Param(p); });
  }
}
