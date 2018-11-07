import * as faker from 'faker'
import * as fs from 'fs-extra'
import * as path from 'path'
import DB from '../common/db'
import dbHelper from '../common/dbHelper'
import Log from '../common/log'
import rspHelper from '../common/responseHelper'

import { Api, Host, Method, Param } from '../interface'

interface IMockRule {
  url: string;
  method: string;
  host: Host;
  api: Api;
  mtd: Method;
}
interface IApiQuery {
  project: string;
  api: string;
}

class SApi {
  /*
   * 数据库查询任务
   */
  static sqlTask: (
    sql: any,
    size?: number,
    offset?: number
  ) => Promise<any[]> = (sql, size = 100, offset = 0) =>
    new Promise((resolve, reject) => {
      const db: any = new DB()
      db.all(sql.sqlQuery, [size, offset], (err, rows) => {
        if (err) {
          reject(err)
        }
        resolve(rows)
      })
    })

  /*
   * 数据库查询任务
   */
  static sqlCountTask: (sql: any) => Promise<any[]> = (sql) =>
    new Promise((resolve, reject) => {
      const db: any = new DB()
      db.all(sql.sqlCount, [], (err, rows) => {
        if (err) {
          reject(err)
        }
        resolve(rows[0].COUNT)
      })
    })

  /*
   * 根据不同类型id查询 mock 的记录
   * @param key 查询字段名
   * @param ids ids
   */
  static sqlRecordTask: (key: string, ids: number[]) => Promise<any[]> = (
    key,
    ids
  ) =>
    new Promise((resolve, reject) => {
      const db: any = new DB()
      const sql: string = `SELECT ${key}, COUNT(*) as COUNT FROM records WHERE ${key} IN (${ids.join(
        ', '
      )}) GROUP BY ${key}`
      db.all(sql, (err, rows) => {
        if (err) {
          reject(err)
        }
        resolve(rows)
      })
    })

  /*
   * sql 查询任务
   */
  static sqlQueryTask: (sql: string) => Promise<any[]> = (sql) =>
    new Promise((resolve, reject) => {
      const db: any = new DB()
      db.all(sql, (err, rows) => {
        if (err) {
          reject(err)
        }
        resolve(rows)
      })
    })

  /*
   * 获取字典项数据
   */
  private static async getDict(name) {
    const [d] = await this.sqlTask(dbHelper.getDict(name))
    const arr = d ? await this.sqlTask(dbHelper.getDictOption(d.id)) : []
    const dict = {}
    if (arr.length > 0) {
      arr.forEach((op) => {
        dict[op.id] = op
      })
    }
    return dict
  }

  /**
   * 根据methodId获取请求阐述列表
   * @param id methodId
   */
  private static async getParams(id: number): Promise<Param[]> {
    const sql = dbHelper.getQuerySql('params', [
      { type: dbHelper.queryType.eq, key: 'methodId', value: id } // 查询全部 online 的 host
    ])
    try {
      return await this.sqlTask(sql)
    } catch (error) {
      return []
    }
  }
  db: any

  constructor() {
    faker.locale = 'zh_CN'
    const db: any = new DB()
    this.db = db
    Log.sysInfo('API SERVICE IS READY')
  }

  public async handler(ctx): Promise<object> {
    return new Promise((resolve, reject) => {
      const {
        params: { action, type },
        query,
        request: { method, body }
      } = ctx
      const args = method === 'GET' || method === 'DELETE' ? query : body
      let res: object = {}
      let handler = null
      switch (type) {
        case 'host':
          handler = this.hostHandler(action, args)
          break
        case 'project':
          handler = this.projectHandler(action, args)
          break
        case 'common':
          handler = this.commonHandler(action, args)
          break
        default:
          resolve(null)
          break
      }
      if (handler) {
        handler
          .then((result) => {
            res = rspHelper.newResponse(result)
            resolve(res)
          })
          .catch((e) => {
            res = rspHelper.newResponse(
              null,
              false,
              e || '服务端出错，请联系管理员'
            )
            resolve(res)
          })
      } else {
        resolve(null)
      }
    })
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
        id: projectId
      } = params
      const offset = (page - 1) * size

      const queryType = dbHelper.queryType
      const sql = dbHelper.getQuerySql('hosts', [
        { type: queryType.eq, key: 'projectId', value: projectId },
        { type: queryType.like, key: 'name', value: query },
        { type: queryType.like, key: 'host', value: query },
        ...(online > -1
          ? [{ type: queryType.eq, key: 'online', value: online }]
          : [])
      ])

      try {
        const [list, total, protocolDict] = await Promise.all([
          SApi.sqlTask(sql, size, offset),
          SApi.sqlCountTask(sql),
          SApi.getDict('protocol')
        ])
        const recordData = await SApi.sqlRecordTask(
          'hostId',
          list.map((itm) => itm.id)
        )
        const recordMap = {}
        recordData.forEach((r) => {
          recordMap[r.projectId] = r.COUNT
        })
        const rows = list.map((itm) => {
          const { protocol } = itm
          return {
            ...itm,
            protocolName: protocolDict[protocol].name,
            recordCount: recordMap[itm.id] || 0
          }
        })
        resolve({ list: rows, total, page, size })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 获取Host列表
   * @param params 请求参数
   */
  private async getProjectList(params: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const { page = 1, size = 10, query = '%' } = params
      const offset = (page - 1) * size

      const queryType = dbHelper.queryType
      const sql = dbHelper.getQuerySql('projects', [
        { type: queryType.like, key: 'name', value: query },
        { type: queryType.like, key: 'description', value: query }
      ])

      try {
        const [list, total] = await Promise.all([
          SApi.sqlTask(sql, size, offset),
          SApi.sqlCountTask(sql)
        ])
        const [rows, hosts, apis, methods] = await Promise.all([
          SApi.sqlRecordTask('projectId', list.map((itm) => itm.id)),
          SApi.sqlQueryTask(`
                        SELECT projectId, COUNT(*) as COUNT FROM hosts WHERE projectId IN (${list
                          .map((itm) => itm.id)
                          .join(', ')}) GROUP BY projectId
                    `),
          SApi.sqlQueryTask(`
                        SELECT projectId, COUNT(*) as COUNT FROM apis WHERE projectId IN (${list
                          .map((itm) => itm.id)
                          .join(', ')}) GROUP BY projectId
                    `),
          SApi.sqlQueryTask(`
                        SELECT projectId, COUNT(*) as COUNT FROM methods WHERE projectId IN (${list
                          .map((itm) => itm.id)
                          .join(', ')}) GROUP BY projectId
                    `)
        ])
        const mapFunc = (arr) => {
          const map = {}
          arr.forEach((r) => {
            map[r.projectId] = r.COUNT
          })
          return map
        }
        const recordMap = mapFunc(rows)
        const hostMap = mapFunc(hosts)
        const apiMap = mapFunc(apis)
        const methodMap = mapFunc(methods)
        resolve({
          list: list.map((itm) => ({
            ...itm,
            apiCount: apiMap[itm.id] || 0,
            hostCount: hostMap[itm.id] || 0,
            methodCount: methodMap[itm.id] || 0,
            recordCount: recordMap[itm.id] || 0
          })),
          page,
          size,
          total
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 新增项目
   * @param params 参数
   */
  private async insertProject(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const { name, description, img } = params
      const db = this.db
      const sql = `INSERT INTO projects(
                name, description, img
              ) VALUES(?, ?, ?)`

      const paramKeys = ['name', 'description']
      const checkRst = dbHelper.checkParams(params, paramKeys)

      if (checkRst.pass) {
        db.serialize(() => {
          db.run(sql, [name, description, img], function(err) {
            resolve({ id: this.lastID })
          })
        })
      } else {
        reject(checkRst.message)
      }
    })
  }

  /**
   * 获取Host列表
   * @param params 请求参数
   */
  private async getProject(params: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const { id } = params

      const queryType = dbHelper.queryType
      const sql = dbHelper.getQuerySql('projects', [
        { type: queryType.eq, key: 'id', value: id }
      ])

      try {
        const [
          [project],
          [{ COUNT: records }],
          [{ COUNT: hosts }],
          [{ COUNT: apis }],
          [{ COUNT: methods }],
          [{ COUNT: successCount }],
          [{ COUNT: failureCount }]
        ] = await Promise.all([
          SApi.sqlTask(sql),
          SApi.sqlRecordTask('projectId', [id]),
          SApi.sqlQueryTask(`
                        SELECT COUNT(*) as COUNT FROM hosts WHERE projectId = ${id}
                    `),
          SApi.sqlQueryTask(`
                        SELECT COUNT(*) as COUNT FROM apis WHERE projectId = ${id}
                    `),
          SApi.sqlQueryTask(`
                        SELECT COUNT(*) as COUNT FROM methods WHERE projectId = ${id}
                    `),
          SApi.sqlQueryTask(`
                        SELECT COUNT(*) as COUNT FROM records WHERE projectId = ${id} and success = 1
                    `),
          SApi.sqlQueryTask(`
                        SELECT COUNT(*) as COUNT FROM records WHERE projectId = ${id} and success = 0
                    `)
        ])
        resolve({
          ...project,
          apis,
          failureCount,
          hosts,
          methods,
          records,
          successCount
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 修改项目信息
   * @param params 请求参数
   */
  private async updateProject(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const { id, name, description, img } = params
      const db = this.db
      const sql = `UPDATE projects SET (name, description, img) = (?, ?, ?) WHERE id = ?`
      const paramKeys = ['name', 'description']
      const checkRst = dbHelper.checkParams(params, paramKeys)
      if (checkRst.pass) {
        db.serialize(() => {
          db.run(sql, [name, description, img, id], function(err) {
            resolve({ id: this.lastID })
          })
        })
      } else {
        reject(checkRst.message)
      }
    })
  }

  /**
   * 文件上传
   * @param params 请求参数
   */
  private async uploadFiles(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const file = params.files.file
      const date = new Date()
      const urlPath = `upload/${date.getFullYear()}-${date.getMonth() +
        1}-${date.getDay()}/`
      const dirPath: string = path.join(__dirname, `../../static/${urlPath}`)
      fs.ensureDirSync(dirPath)
      const fileName = `img-${date.getTime()}-${file.name}`
      const packagePath = path.join(dirPath, fileName)
      const reader = fs.createReadStream(file.path)
      const stream = fs.createWriteStream(packagePath)
      reader.pipe(stream)
      resolve({ url: `/${urlPath}${fileName}` })
    })
  }

  /**
   * host 处理器
   * @param action 具体操作
   * @param params 请求参数
   */
  private async hostHandler(action: string, params: any): Promise<any> {
    let runner = null
    switch (action) {
      case 'getList':
        runner = this.getHostList(params)
      default:
        break
    }
    return runner
  }

  /**
   * project 处理器
   * @param action 具体操作
   * @param params 请求参数
   */
  private async projectHandler(action: string, params: any): Promise<any> {
    let runner = null
    switch (action) {
      case 'getList':
        runner = this.getProjectList(params)
        break
      case 'insert':
        runner = this.insertProject(params)
        break
      case 'update':
        runner = this.updateProject(params)
        break
      case 'getProject':
        runner = this.getProject(params)
        break
      default:
        runner = new Promise((resolve, reject) => reject())
        break
    }
    return runner
  }

  /**
   * common 处理器
   * @param action 具体操作
   * @param params 请求参数
   */
  private async commonHandler(action: string, params: any): Promise<any> {
    let runner = null
    switch (action) {
      case 'upload':
        runner = this.uploadFiles(params)
      default:
        break
    }
    return runner
  }
}

const s_api: SApi = new SApi()

export { s_api, SApi as apiService }
