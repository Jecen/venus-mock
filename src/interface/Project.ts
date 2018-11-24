import { Project as ImProject } from './index';
import HostHandler from '../handler/HostHandler';
import Host from './Host';

import { GraphQLError } from 'graphql';

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
        if (!param[key]) {
          throw new GraphQLError('test GraphQlError');
        }
        this[key] = param[key];
      }
    });
  }

  async hosts() {
    const projectId = this.id;
    const { list: data } = await new HostHandler().getList({ id: projectId });
    const hosts = data.map((itm) => {
      return new Host(itm);
    });
    return hosts;
  }
}
