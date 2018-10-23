import * as path from 'path'

import * as Koa from 'koa'
import * as km_static from 'koa-static'
import * as km_ejs from 'koa-ejs'
import * as km_logger from 'koa-logger'
import * as bodyParser from 'koa-bodyparser'
import * as koaBody from 'koa-body'
import * as historyApiFallback from 'koa-history-api-fallback'


import router from './routers'
const appOption: any = require('./config').default
// const appOption = require('../config')

import * as Proxy from 'anyproxy'
const proxyOptions: any = require('./config/proxy').default
// const proxyOptions = require('../config/proxy')

const app: Koa = new Koa()

app.on('error', (err, ctx) => {
    console.log('error', err)
})

app
    .use(km_logger())
    .use(koaBody({ multipart: true, formLimit: "5mb", jsonLimit: "5mb", textLimit: "5mb" }))
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods())
    .use(historyApiFallback())
    .use(km_static(path.join(__dirname, './app/dist')))
    .use(km_static(path.join(__dirname, '../static')))
app.listen(appOption.httpPort)
console.log('bk server start at port:' + appOption.httpPort);

const proxyServer = new Proxy.ProxyServer(proxyOptions)
proxyServer.on('ready', () => {
    console.log(`proxy webInterface ready at  http://localhost:${proxyOptions.webInterface.webPort}/`)
    Proxy.utils.systemProxyMgr.enableGlobalProxy('127.0.0.1', '9001')
})
proxyServer.on('error', (err) => {
    console.log(err)
})
proxyServer.start()