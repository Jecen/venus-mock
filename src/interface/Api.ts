import MethodHandler from '../handler/MethodHandler';
import { Api as ImApi } from './index';
import Method from './Method';

export default class Api implements ImApi {
  id: number;
  projectId: number;
  hostId: number;
  name: string;
  url: string;
  type: number;
  crDate: Date;

  constructor(param: ImApi) {
    const props = [
      'id', 'projectId', 'hostId', 'name', 'url', 'type', 'crDate',
    ];
    Object.keys(param).forEach((key) => {
      if (props.indexOf(key) > -1) {
        this[key] = param[key];
      }
    });
  }

  async methods() {
    const apiId = this.id;
    const { list: data } = await new MethodHandler().getList({ id: apiId });
    const methods = data.map((itm) => {
      return new Method(itm);
    });
    return methods;
  }
}
