import Handler from './Handler';

class HostHandler extends Handler{
  constructor() {
    super();
  }

  /**
  * 获取Host列表
  * @param params 请求参数
  */
  private async getHostList(params: any): Promise<any> {

    return new Promise(async (resolve, reject) => {
      const {
        page = 1,
        size = 10,
        query = '%',
        online = -1,
        id: projectId,
      } = params;
      const offset = (page - 1) * size;

      const sql = this.getQuerySQL('hosts', [
        { type: this.queryType.eq, key: 'projectId', value: projectId },
        { type: this.queryType.like, key: 'name', value: query },
        { type: this.queryType.like, key: 'host', value: query },
        ...(online > -1
          ? [{ type: this.queryType.eq, key: 'online', value: online }]
          : []),
      ]);

      try {
        const [list, total, protocolDict] = await Promise.all([
          this.queryTask(sql, size, offset),
          this.countTask(sql),
          this.getDict('protocol'),
        ]);
        const recordData = await this.recordTask(
          'hostId',
          list.map(itm => itm.id),
        );
        const recordMap = {};
        recordData.forEach((r) => {
          recordMap[r.projectId] = r.COUNT;
        });
        const rows = list.map((itm) => {
          const { protocol } = itm;
          return {
            ...itm,
            protocolName: protocolDict[protocol].name,
            recordCount: recordMap[itm.id] || 0,
          };
        });
        resolve({ total, page, size, list: rows  });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  public handle(action: string, params: any): Promise<any> {
    let runner = null;
    switch (action) {
      case 'getList':
        runner = this.getHostList(params);
        break;
      default:
        runner = new Promise((resolve, reject) => reject());
        break;
    }
    return runner;
  }
}

export default HostHandler;
