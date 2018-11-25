
export default class Record {
  id: number;
  projectId: number;
  hostId: number;
  apiId: number;
  methodId: number;
  url: string;
  success: boolean;
  msg: String;
  crDate: string;

  constructor(param: any) {
    const props = [
      'id', 'projectId', 'hostId', 'apiId', 'methodId',
      'url', 'success', 'msg',
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
}
