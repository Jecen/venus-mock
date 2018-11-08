import Handler from './Handler';
import * as fs from 'fs-extra';
import * as path from 'path';

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
      default:
        break;
    }
    return runner;
  }
}

export default CommonHandler;
