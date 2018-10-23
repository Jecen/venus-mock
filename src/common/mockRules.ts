import DB from "./db"
import dbHelper from "./dbHelper"
import * as appConfig from '../../config'
// interface
import {Host, Api, Method} from '../interface'

let proxyRules = new Set()

/**
 *  查询数据库 并生成规则名单列表
 */
async function  generateRules() {
  const db: any = new DB()

  const queryType = dbHelper.queryType
  const hostSql = dbHelper.getQuerySql("hosts", [
    { type: queryType.eq, key: "online", value: 1 } // 查询全部 online 的 host
  ])
	const sqlTask:(sql: any) => Promise<Array<any>> = (sql) => new Promise((resolve, reject) => {
		db.all(sql.sqlQuery, [100, 0], function(err, rows) {
			if (err) reject(err)
			resolve(rows)
		})
	})

	const getDict = async (name) => {
		const [d] = await sqlTask(dbHelper.getDict(name))
		const arr = d ? await sqlTask(dbHelper.getDictOption(d.id)) : []
		const dict = {}
		arr.length > 0 && arr.forEach(op =>{
			dict[op.id] = op
		})
		return dict
	}

	proxyRules.clear()

	try {
		const protocolDict = await getDict("protocol")
		const methodDict = await getDict("method")
		const mockTypeDict = await getDict("mockType")

		let hosts = await sqlTask(hostSql)
		for (let host of hosts) {
			const apiSql = dbHelper.getQuerySql("apis", [
				{ type: queryType.eq, key: "hostId", value: host.id }, // 查询全部 online 的 host
				{ type: queryType.eq, key: "type", value: 7 } // 查询全部 online 的 host
			])
			let apis = await sqlTask(apiSql)
			for (let api of apis) {
				const methodSql = dbHelper.getQuerySql("methods", [
					{ type: queryType.eq, key: "apiId", value: api.id } // 查询全部 online 的 host
				])
				let methods = await sqlTask(methodSql)
				methods.forEach(m => {
					const { method } = m
					const { protocol, host: hostUrl, path } = host
					const { url } = api
					proxyRules.add({
						url: `${protocolDict[protocol].name}://${hostUrl}${path}${url}`,
						method: methodDict[method].name.toUpperCase(),
						host,
						api,
						mtd: m
					})
				})
			}
		}
	} catch (error) {
		console.log(error, '!!!!')
	}
}

module.exports = {
   *beforeSendRequest(req) {
	console.log(req.url)
  	for (let rule of proxyRules) {
  		if (req.url.indexOf(rule.url) === 0
  			&& rule.method === req.requestOptions.method) {

  			const newReqOptions = req.requestOptions
  			newReqOptions.hostname = 'localhost'
  			newReqOptions.port = appConfig.httpPort
  			newReqOptions.path = `/mockapi${newReqOptions.path}`
  			return {
  				requestOptions: newReqOptions
  			}
  		}
  	}
	},
	get rules() {
		return proxyRules
	},
  /**
   * 增删改文件之后需重新生成 proxyRules 和 configs
   */
  update() {
    generateRules()
  }
}
