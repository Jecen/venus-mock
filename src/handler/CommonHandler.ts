import Handler from './Handler';
import * as fs from 'fs-extra';
import * as path from 'path';
import log from '../common/log';

class CommonHandler extends Handler {
  constructor() {
    super();
  }

  /**
   * 文件上传
   * @param params 请求参数
   */
  private async uploadFiles(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const file = params.files.file;
      const date = new Date();
      const urlPath = `upload/${date.getFullYear()}-${date.getMonth() +
        1}-${date.getDay()}/`;
      const dirPath: string = path.join(__dirname, `../../static/${urlPath}`);
      fs.ensureDirSync(dirPath);
      const fileName = `img-${date.getTime()}-${file.name}`;
      const packagePath = path.join(dirPath, fileName);
      const reader = fs.createReadStream(file.path);
      const stream = fs.createWriteStream(packagePath);
      reader.pipe(stream);
      resolve({ url: `/${urlPath}${fileName}` });
    });
  }

  public async getDictionaries(params: any): Promise<any> {
    const { name } = params;
    const dictMap = await this.getDict(name);
    return new Promise(resolve => resolve({
      dictName: name,
      options: Object.keys(dictMap).map(key => dictMap[key]),
    }));
  }

  public async getMockRecords(params: any): Promise<any> {
    const { target, id,  page = 1, size = 10, query = '%' } = params;

    const sql = this.getQuerySQL('records', [
      { type: this.queryType.like, key: `${target}Id`, value: id },
      { type: this.queryType.like, key: 'url', value: query },
    ]);

    try {
      const [list, total] = await this.listTask(sql, page, size);
      return { page, size, total, list };
    } catch (error) {
      return error;
    }
  }

  public async saveMockRecords(params: any): Promise<any>  {
    const sql = `INSERT INTO records(
			projectId, methodId, hostId, apiId, url, success, msg
		  ) VALUES(?, ?, ?, ?, ?, ?, ?)`;
    const paramKeys = [
      'projectId',
      'methodId',
      'hostId',
      'apiId',
      'url',
      'success',
      'msg',
    ];
    this.dataBase.serialize(() => {
      this.dataBase.run(sql, [...paramKeys.map(key => params[key])], (e) => {
        log.sysInfo('mock 记录成功！');
      });
    });
  }

  public obtain(params: any): Promise<any> {
    return new Promise(resolve => resolve());
  }
  public del(params: any): Promise<any> {
    return new Promise(resolve => resolve());
  }
  public update(params: any): Promise<any> {
    return new Promise(resolve => resolve());
  }
  public insert(params: any): Promise<any> {
    return new Promise(resolve => resolve());
  }
  public getList(params: any): Promise<any> {
    return new Promise(resolve => resolve());
  }

  public handle(action: string, params: any): Promise<any> {
    let runner = null;
    switch (action) {
      case 'upload':
        runner = this.uploadFiles(params);
        break;
      case 'dict':
        runner = this.getDictionaries(params);
        break;
      case 'record':
        runner = this.getMockRecords(params);
        break;
      default:
        break;
    }
    return runner;
  }
}

export default CommonHandler;
