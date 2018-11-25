import { Project as ImProject } from './index';
import HostHandler from '../handler/HostHandler';
import CommonHandler from '../handler/CommonHandler';
import Host from './Host';

import { GraphQLError } from 'graphql';
import List from './List';
import Record from './Record';

export default class Project implements ImProject {
  id: number;
  name: string;
  description: string;
  img: string;
  crDate: Date;

  constructor(param: ImProject) {
    const props = [
      'id', 'name', 'description', 'img', 'crDate',
    ];
    Object.keys(param).forEach((key) => {
      if (props.indexOf(key) > -1) {
        // if (!param[key]) {
        //   throw new GraphQLError('test GraphQl');
        // }
        this[key] = param[key];
      }
    });
  }

  async hosts() {
    const projectId = this.id;
    const data = await new HostHandler().getList({ id: projectId });
    const { list } = data;
    return new List({...data, list: list.map((p) => {
      return new Host(p);
    })});
  }

  async records(params) {
    const projectId = this.id;
    const data = await new CommonHandler().getMockRecords({
      target: 'project',
      id: projectId,
      ...params,
    });
    const { list } = data;
    return new List({...data, list: list.map((r) => {
      return new Record(r);
    })});
  }
}
