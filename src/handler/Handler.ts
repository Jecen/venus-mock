import db from '../common/db';
import dbHelper from '../common/dbHelper';
import config from '../config';

abstract class Handler {
  dataBase: any;
  queryType: any;
  appConf: any;

  constructor() {
    this.dataBase = new db();
    this.queryType = dbHelper.queryType;
    this.appConf = config;
  }

  /**
   * 获取sql语句
   * @param table 表名
   * @param condition 查询条件
   */
  public getQuerySQL(table: string, condition: any[] = []): any {
    return dbHelper.getQuerySQL(table, condition);
  }

  public checkParams(params: any, paramKeys: string[]): any {
    return dbHelper.checkParams(params, paramKeys);
  }

  /**
   * 数据库查询任务
   * @param sql dbHelper 获取的 sql 语句对象
   * @param size 查询量
   * @param offset 偏移量
   */
  public queryTask(sql: any, size: number = 100, offset: number = 0): Promise<any> {
    return this.task(sql.sqlQuery, [size, offset]);
  }

  /*
   * 数据库查询总数任务
   */
  public countTask(sql: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.task(sql.sqlCount)
        .then(rows => resolve(rows[0].COUNT))
        .catch(reject);
    });
  }

  /*
   * 列表组合查询
   */
  public listTask(sql: any, page: number = 1, size: number = 100) {
    const offset = (page - 1) * size;
    return Promise.all([
      this.queryTask(sql, size, offset),
      this.countTask(sql),
    ]);
  }

  /*
   * 根据不同类型id查询 mock 的记录
   * @param key 查询字段名
   * @param ids id集合
   */
  public recordTask (key: string, ids: number[]): Promise<any> {
    const sql: string = `
        SELECT ${key}, COUNT(*) as COUNT
        FROM records
        WHERE ${key} IN (${ids.join(', ')})
        GROUP BY ${key}`;
    return this.task(sql);
  }

  /*
   * sql 查询任务 返回所有数据
   */
  public task(sql: string, params:any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataBase.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });
    });
  }

  /*
   * sql 查询任务 返回影响数据
   */
  public run(sql: string, params:any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataBase.run(sql, params, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
    });
  }

  /*
   * 获取字典项数据
   */
  public async getDict(name) {
    const [d] = await this.queryTask(dbHelper.getDict(name));
    const arr = d ? await this.queryTask(dbHelper.getDictOption(d.id)) : [];
    const dict = {};
    if (arr.length > 0) {
      arr.forEach((op) => {
        dict[op.id] = op;
      });
    }
    return dict;
  }

  public abstract handle(action: string, params: any): Promise<any>;
}

export default Handler;
