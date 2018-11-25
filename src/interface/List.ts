import Param from './Param';
import Method from './Method';
import Api from './Api';
import Host from './Host';
import Project from './Project';

export default class List {
  page: number;
  size: number;
  total: number;
  list: [Param | Method | Api | Host | Project];

  constructor(param: any) {
    Object.keys(param).forEach((key) => {
      this[key] = param[key];
    });
  }
}
