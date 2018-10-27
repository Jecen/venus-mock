import * as faker from 'faker'
import DB from '../common/db'
import dbHelper from "../common/dbHelper"

const mockModule: any = require('../common/mockRules')
const appConfig = require('../config').default
import {Host, Api, Method, Param} from '../interface'
interface MockRule {
	url: string,
	method: string,
	host: Host,
	api: Api,
	mtd: Method
}
class S_mock {
	db: any
	
	constructor() {
		faker.locale = 'zh_CN'

		const db: any = new DB()
		this.db = db

		db.serialize(() => {
			const updateRules = () => mockModule.update()
			let tableCount = 0
			const cb = () => {
				tableCount += 1
				if (tableCount === 7) {
					updateRules()
				} 
			}
			db.run(`CREATE TABLE IF NOT EXISTS dicts (
				id          INTEGER   PRIMARY KEY AUTOINCREMENT
									  NOT NULL
									  UNIQUE,
				name        VARCHAR   NOT NULL
				                      UNIQUE,
				crDate      TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
			)`, cb)

			db.run(`CREATE TABLE IF NOT EXISTS options (
				id          INTEGER   PRIMARY KEY AUTOINCREMENT
									  NOT NULL
									  UNIQUE,
				dictId      INT       NOT NULL,
				name        VARCHAR   NOT NULL,
				crDate      TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
			)`, cb)

			db.run(`CREATE TABLE IF NOT EXISTS projects (
			    id          INTEGER   PRIMARY KEY AUTOINCREMENT
			  						  NOT NULL
									  UNIQUE,
			    name        VARCHAR   NOT NULL,
				description VARCHAR   NOT NULL,
				img         VARCHAR   NOT NULL,
			    crDate      TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
			)`, cb)

			db.run(`CREATE TABLE IF NOT EXISTS hosts (
			    id          INTEGER   PRIMARY KEY AUTOINCREMENT
			  						  NOT NULL
									  UNIQUE,
				projectId   INT       NOT NULL,
			    name        VARCHAR   NOT NULL,
			    host        VARCHAR   NOT NULL,
			    path        VARCHAR,
			    protocol    VARCHAR   NOT NULL,
				online      BOOLEAN   NOT NULL
									  DEFAULT (0),
			    crDate      TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
			)`, cb)

			db.run(`CREATE TABLE IF NOT EXISTS apis (
			    id          INTEGER   PRIMARY KEY AUTOINCREMENT
			  			     	      UNIQUE
									  NOT NULL,
				projectId   INT       NOT NULL,
			    hostId      INT       NOT NULL,
			    name        VARCHAR   NOT NULL,
			    url         VARCHAR   NOT NULL,
			    type        INT       NOT NULL
			    		     		  DEFAULT (0),
			    crDate      TIMESTAMP DEFAULT (CURRENT_TIMESTAMP) 
			)`, cb)

			db.run(`CREATE TABLE IF NOT EXISTS methods (
			    id          INTEGER   PRIMARY KEY AUTOINCREMENT
			  			   		      NOT NULL
										   UNIQUE,
				projectId   INT       NOT NULL,
			    hostId      INT       NOT NULL,
				apiId       INT       NOT NULL,
			    name        VARCHAR   NOT NULL,
				method      INT       NOT NULL,
				result      VARCHAR,
			    crDate      TIMESTAMP NOT NULL
								      DEFAULT (CURRENT_TIMESTAMP) 
			)`, cb)
			
			db.run(`CREATE TABLE IF NOT EXISTS params (
				id          INTEGER   PRIMARY KEY AUTOINCREMENT
						   		      NOT NULL
						   		      UNIQUE,
				methodId    INT       NOT NULL,
				key         VARCHAR   NOT NULL,
				name        VARCHAR   NOT NULL,
				type        INT       NOT NULL,
				info        VARCHAR,
				mandatory   BOOLEAN   NOT NULL
				                      DEFAULT (0),
				crDate      TIMESTAMP NOT NULL
								      DEFAULT (CURRENT_TIMESTAMP) 
			)`, cb)

			db.run(`CREATE TABLE IF NOT EXISTS records (
				id          INTEGER   PRIMARY KEY AUTOINCREMENT
						   		      NOT NULL
										 UNIQUE,
				projectId   INT       NOT NULL,
				methodId    INT       NOT NULL,
				hostId		INT		  NOT NULL,
				apiId       INT       NOT NULL,
				url			VARCHAR   NOT NULL,
				success     INT       NOT NULL
									  DEFAULT (1),
				msg			VARCHAR,
				crDate      TIMESTAMP NOT NULL
								      DEFAULT (CURRENT_TIMESTAMP) 
			)`, cb)

			// TODO 字典项初始化
			// db.run(`INSERT INTO hosts(name,host,path,protocol,online) VALUES ("venus-mock","api.venus-mock.com","/web/v1/api",1,1)`)
			// db.run(`INSERT INTO apis(hostId,name,url,type) VALUES (2,"获取Venus-Mock信息","/info",7)`)
			// db.run(`INSERT INTO methods(apiId,name,method,result) VALUES (1,"GET:获取Venus-Mock信息",3,"VenusMock是一个能够提供mock功能的应用工具")`)

		})

		console.log('init mock service')
	}

	/**
	 * 根据代理过的请求进行匹配，并返回规则对象
	 * @param path 路径
	 * @param method 请求方法
	 */
	matchRule(path: string, method: string): object {
		path = path.indexOf('?') > -1 ? path.substr(0, path.indexOf('?')) : path
		path = path.replace(appConfig.proxyHandlePath, '')
		for (let rule of mockModule.rules) {
			const { host, api } = rule
			if (`${host.path}${api.url}` === path && method === rule.method) {
				return rule
			}
		}
		return null
	}
	/**
	 * 数据库查询任务
	 */
	static sqlTask:(sql: any) => Promise<Array<any>> = (sql) => new Promise((resolve, reject) => {
		const db: any = new DB()
		db.all(sql.sqlQuery, [100, 0], function(err, rows) {
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
	 * 验证mock api参数的方法
	 * @param id 方法id
	 * @param params 参数对象
	 */
	private static async checkParams(id: number, params: any, isQuery: boolean):Promise<any> {
		const paramsDict = await this.getDict("paramsType")
		const paramsRules = await this.getParams(id)
		const error = []
		const isNumber = (val, isQuery) => {
			const regPos = /^\d+(\.\d+)?$/; //非负浮点数
			const regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
			if ((isQuery && (regPos.test(val) || regNeg.test(val))) || typeof val === 'number') {
				return true
			} else {
				return false
			}
		}
		const isBoolean = (val, isQuery) => {
			if ((isQuery && typeof val === "boolean") || (typeof val === "string" && (val === "true" || val === "false"))) {
				return true
			}else {
				return false
			}
		}
		paramsRules.forEach(rule => {
			if (rule.mandatory) {
				if (!params[rule.key]) {
					error.push(`${rule.name}不能为空!`)
				} else {
					const paramType = paramsDict[rule.type]
					switch(paramType.name){
						case "String":
							if (typeof params[rule.key] !== 'string') {
								error.push(`${rule.name}参数需为字符串!`)
							}
							break;
						case "Number":
							if (!isNumber(params[rule.key], isQuery)) {
								error.push(`${rule.name}参数需为数字!`)
							}
							break;
						case "Boolean":
							if (!isBoolean(params[rule.key], isQuery)) {
								error.push(`${rule.name}参数需为Boolean类型!`)
							}
							break;
						default: 
							break;
					}
				}
			}
		})
		return {
			success: error.length === 0,
			msg: error.length > 0 ? error.join(',') : ''
		}
	}

	/**
	 * 记录mock次数
	 * @param rule 匹配的mock规则
	 */
	private static recordMock(rule: MockRule, msg = "", success = true) {
		console.log(rule)
		const db: any = new DB()
		const { host, api, mtd: method, url } = rule
		const params = {
			projectId: host.projectId,
			methodId: method.id,
			hostId: host.id,
			apiId: api.id,
			url,
			success: success ? 1 : 0,
			msg
		}
		const sql = `INSERT INTO records(
			projectId, methodId, hostId, apiId, url, success, msg
		  ) VALUES(?, ?, ?, ?, ?, ?, ?)`
		const paramKeys = ['projectId', 'methodId', 'hostId', 'apiId', 'url', 'success', 'msg']
		db.serialize(() => {
			db.run(sql, [...paramKeys.map(key => params[key])], function (e) {
				console.log("mock 记录成功！", e)
			})
		})
	}
	
	/**
	 * 获取mock api 的 response
	 * @param rule api 匹配的rule 对象
	 * @param ctx 请求的上下文
	 */
	public static async getResponse(rule: MockRule, ctx: any): Promise<object> {
		const { mtd } = rule
		const { params, query, request: { method, body }} = ctx
		// 验证 mock api 的参数
		let checkRst = await this.checkParams(mtd.id, method === "GET" ? query : body,  method === "GET")
		if (!checkRst.success) {
			this.recordMock(rule, checkRst.msg, false)
			return {
				"success": false,
				"errorMessage": checkRst.msg,
				"data": null
			}
		}
		try {
			const data = JSON.parse(rule.mtd.result)
			this.recordMock(rule)
			return {
				"success": true,
				"errorMessage": '',
				"data": data
			}
		} catch (error) {
			this.recordMock(rule)
			return {
				"success": true,
				"errorMessage": '',
				"data": rule.mtd.result
			}
		}
	}
}

const s_mock: S_mock = new S_mock()

export { s_mock, S_mock as mockService }