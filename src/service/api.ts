import * as faker from 'faker'
import * as fs from 'fs-extra'
import * as path from 'path'
import DB from '../common/db'
import dbHelper from "../common/dbHelper"
import rspHelper from '../common/responseHelper'

const mockModule: any = require('../common/mockRules')
const appConfig = require('../../config').default
import {Host, Api, Method, Param} from '../interface'

interface MockRule {
	url: string,
	method: string,
	host: Host,
	api: Api,
	mtd: Method
}
interface ApiQuery {
	project: string,
	api: string
}

class S_api {
	db: any
	
	constructor() {
		faker.locale = 'zh_CN'
		const db: any = new DB()
        this.db = db
        
		console.log('init api service')
	}

	/**
	 * 数据库查询任务
	 */
	static sqlTask:(sql: any, size?: number, offset?: number) => Promise<Array<any>> = (sql, size = 100, offset = 0) => new Promise((resolve, reject) => {
        const db: any = new DB()
		db.all(sql.sqlQuery, [size, offset], function(err, rows) {
			if (err) reject(err)
			resolve(rows)
		})
    })
    
    /**
	 * 数据库查询任务
	 */
	static sqlCountTask:(sql: any) => Promise<Array<any>> = (sql) => new Promise((resolve, reject) => {
        const db: any = new DB()
		db.all(sql.sqlCount, [], function(err, rows) {
            if (err) reject(err)
			resolve(rows[0].COUNT)
		})
    })
    
    /**
     * 根据不同类型id查询 mock 的记录
     * @param key 查询字段名
     * @param ids ids
     */
    static sqlRecordTask:(key: string, ids: Array<number>) => Promise<Array<any>> = (key, ids) => new Promise((resolve, reject) => {
        const db: any = new DB()
        const sql: string = `SELECT ${key}, COUNT(*) as COUNT FROM records WHERE ${key} IN (${ids.join(', ')}) GROUP BY ${key}`
        db.all(sql, function (err, rows) {
            console.log(rows, '!!sqlRecordTask!!')
            if (err) reject(err)
            resolve(rows)
        })
    })

    static sqlQueryTask:(sql: string) => Promise<Array<any>> = (sql) => new Promise((resolve, reject) => {
        const db: any = new DB()
        db.all(sql, function (err, rows) {
            if (err) reject(err)
            resolve(rows)
        })
    })

	/**
	 * 获取字典项数据
	 */
	private static async getDict(name) {
		const [d] = await this.sqlTask(dbHelper.getDict(name))
		const arr = d ? await this.sqlTask(dbHelper.getDictOption(d.id)) : []
		const dict = {}
		arr.length > 0 && arr.forEach(op =>{
			dict[op.id] = op
		})
		return dict
	}

	/**
	 * 根据methodId获取请求阐述列表
	 * @param id methodId
	 */
	private static async getParams(id: number): Promise<Array<Param>> {
		const sql = dbHelper.getQuerySql("params", [
			{ type: dbHelper.queryType.eq, key: "methodId", value: id } // 查询全部 online 的 host
		])
		try {
			return await this.sqlTask(sql)
		} catch (error) {
			return []
		}
    }
    
    /**
     * 获取Host列表
     * @param params 请求参数
     */
    private async getHostList(params: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let { page = 1, size = 10, query = "%", online = -1 } = params
            const offset = (page - 1) * size

            const queryType = dbHelper.queryType
            const sql = dbHelper.getQuerySql('hosts', [
                { type: queryType.like, key: 'name', value: query },
                { type: queryType.like, key: 'host', value: query },
                ...(online  > -1 ? [{ type: queryType.eq, key: 'online', value: online }] : []),
            ])

            Promise.all([
                S_api.sqlTask(sql, size, offset),
                S_api.sqlCountTask(sql),
                S_api.getDict('protocol')
            ])
                .then(([list, total, protocolDict]) => {
                    S_api.sqlRecordTask('hostId', list.map(itm => itm.id))
                        .then(data => {
                            console.log(data, '!!!')
                            const recordMap = {}
                            data.forEach(r => {
                                recordMap[r.projectId] = r.COUNT
                            })
                            const rows = list.map(itm => {
                                const { protocol } = itm
                                return {
                                    ...itm,
                                    protocolName: protocolDict[protocol].name,
                                    recordCount: recordMap[itm.id] || 0
                                }
                            })
                            resolve({list: rows, total, page, size})
                        })
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    /**
     * 获取Host列表
     * @param params 请求参数
     */
    private async getProjectList(params: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let { page = 1, size = 10, query = "%"} = params
            const offset = (page - 1) * size

            const queryType = dbHelper.queryType
            const sql = dbHelper.getQuerySql('projects', [
                { type: queryType.like, key: 'name', value: query },
                { type: queryType.like, key: 'description', value: query },
            ])

            Promise.all([
                S_api.sqlTask(sql, size, offset),
                S_api.sqlCountTask(sql)
            ])
                .then(([list, total]) => {

                    Promise.all([
                        S_api.sqlRecordTask('projectId', list.map(itm => itm.id)),
                        S_api.sqlQueryTask(`
                            SELECT projectId, COUNT(*) as COUNT FROM hosts WHERE projectId IN (${list.map(itm => itm.id).join(', ')}) GROUP BY projectId
                        `),
                        S_api.sqlQueryTask(`
                            SELECT projectId, COUNT(*) as COUNT FROM apis WHERE projectId IN (${list.map(itm => itm.id).join(', ')}) GROUP BY projectId
                        `),
                        S_api.sqlQueryTask(`
                            SELECT projectId, COUNT(*) as COUNT FROM methods WHERE projectId IN (${list.map(itm => itm.id).join(', ')}) GROUP BY projectId
                        `),
                    ])
                        .then(([rows, hosts, apis, methods]) => {
                            const mapFunc = (arr) => {
                                const map = {}
                                arr.forEach(r => {
                                    map[r.projectId] = r.COUNT
                                })
                                return map
                            }
                            const recordMap = mapFunc(rows)
                            const hostMap = mapFunc(hosts)
                            const apiMap = mapFunc(apis)
                            const methodMap = mapFunc(methods)
                            resolve({ list: list.map(itm => ({
                                ...itm,
                                recordCount: recordMap[itm.id] || 0,
                                hostCount: hostMap[itm.id] || 0,
                                apiCount: apiMap[itm.id] || 0,
                                methodCount: methodMap[itm.id] || 0
                            })), total, page, size})
                        })
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    /**
     * 新增项目
     * @param params 参数
     */
    private async insertProject(params: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let { name, description, img} = params
            const db = this.db
            const sql = `INSERT INTO projects(
                name, description, img
              ) VALUES(?, ?, ?)`

            const paramKeys = ['name', 'description']
            const checkRst = dbHelper.checkParams(params, paramKeys)

            if (checkRst.pass) {
                db.serialize(() => {
                    db.run(sql, [name, description, img], function (err) {
                        resolve({ id: this.lastID})
                    })
                })
            } else {
                reject(checkRst.message)
            }
        })
    }


    private async uploadFiles(params: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const file = params.files.file
            const date = new Date()
            const urlPath = `upload/${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay()}/`
            const dirPath: string = path.join(__dirname, `../../static/${urlPath}`)
            fs.ensureDirSync(dirPath)
            const fileName = `img-${date.getTime()}-${file.name}`
            const packagePath = path.join(dirPath, fileName)
            const reader = fs.createReadStream(file.path)
            const stream = fs.createWriteStream(packagePath)
            reader.pipe(stream)
            resolve({ url: `/${urlPath}${fileName}`})
        })
    }
    

    /**
     * host 处理器 
     * @param action 具体操作
     * @param params 请求参数
     */
    private async hostHandler(action: string, params: any): Promise<any> {
        let runner = null
        switch(action) {
            case 'getList':
                runner = this.getHostList(params)
            default: 
                break;
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
        switch(action) {
            case 'getList':
                runner = this.getProjectList(params)
                break;
            case 'insert':
                runner = this.insertProject(params)
                break;
            default:
                runner = new Promise((resolve, reject) => reject())
                break;
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
        switch(action) {
            case 'upload':
                runner = this.uploadFiles(params)
            default: 
                break;
        }
        return runner
    }

	public async handler(ctx): Promise<Object> {
        return new Promise((resolve, reject) => {
            const {params: {action, type}, query, request: {method, body}} = ctx
            const args = method === 'GET' || method === 'DELETE' ? query : body
            let res: object = {}
            let handler = null
            switch (type) {
                case 'host':
                    handler = this.hostHandler(action, args)
                    break;
                case 'project':
                    handler = this.projectHandler(action, args)
                    break;
                case 'common':
                    handler = this.commonHandler(action, args)
                    break;
                default:
                    resolve(null)
                    break;
            }
            if (handler) {
                handler.then(result => {
                    res = rspHelper.newResponse(result)
                    resolve(res)
                }).catch(e => {
                    res = rspHelper.newResponse(null, false, e || '服务端出错，请联系管理员' )
                    resolve(res)
                })
            } else {
                resolve(null)
            }
        })
	}
}

const s_api: S_api = new S_api()

export { s_api, s_api as apiService }