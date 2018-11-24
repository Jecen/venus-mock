
import { Param as ImpParam } from './index';

export default class Param implements ImpParam {
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

  constructor(param: Param) {
    Object.keys(param).forEach((key) => {
      this[key] = param[key];
    });
  }
}
