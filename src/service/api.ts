import * as faker from 'faker'
import DB from '../common/db'
import dbHelper from "../common/dbHelper"
import rspHelper from '../common/responseHelper'

const mockModule: any = require('../common/mockRules')
const appConfig = require('../../config').default
import {Host, Api, Method, Param} from '../interface'
import apiHandler from '../routers/api';
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
                    const rows = list.map(itm => {
                        const { protocol } = itm
                        return {
                            ...itm,
                            protocolName: protocolDict[protocol].name
                        }
                    })
                    resolve({list: rows, total, page, size})
                })
                .catch((err) => {
                    resolve(err)
                })
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

	public async handler(ctx): Promise<Object> {
        return new Promise((resolve, reject) => {
            const {params: {action, type}, query, request: {method, body}} = ctx
            const args = method === 'GET' || method === 'DELETE' ? query : body
            let res: object = {}

            switch (type) {
                case 'host':
                    this.hostHandler(action, args)
                        .then(result => {
                            res = rspHelper.newResponse(result)
                            resolve(res)
                        }).catch(e => {
                            res = rspHelper.newResponse(null, false, e)
                            resolve(res)
                        })
                    break;
                default:
                    break;
            }
        })
	}
}

const s_api: S_api = new S_api()

export { s_api, s_api as apiService }