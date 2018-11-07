import * as path from 'path';

import * as Koa from 'koa';
import * as km_static from 'koa-static';
import * as km_ejs from 'koa-ejs';
import * as km_logger from 'koa-logger';
import * as bodyParser from 'koa-bodyparser';
import * as koaBody from 'koa-body';
import * as historyApiFallback from 'koa-history-api-fallback';
import * as Proxy from 'anyproxy';
import io from './common/io';
import routers from './routers';
import log from './common/log';

/** app 配置 */
const appOption: any = require('./config').default;
/** koa 实例 */
const app: Koa = new Koa();
/** mock socket 实例 */
const mockIo = new io(app, 'mock');

app.on('error', (err, ctx) => {
  log.sysError(err);
});

app
    .use(km_logger())
    .use(koaBody({ multipart: true, formLimit: '5mb', jsonLimit: '5mb', textLimit: '5mb' }))
    .use(bodyParser())
    .use(routers.routes())
    .use(routers.allowedMethods())
    .use(historyApiFallback())
    .use(km_static(path.join(__dirname, './app/dist')))
    .use(km_static(path.join(__dirname, '../static')));

app.listen(appOption.httpPort);

log.sysInfo(`main server start at port: ${appOption.httpPort}`);

const proxyOptions: any = require('./config/proxy').default;

const proxyServer = new Proxy.ProxyServer(proxyOptions);
proxyServer.on('ready', () => {
  log.sysInfo(
    `proxy webInterface ready at  http://localhost:${proxyOptions.webInterface.webPort}/`,
  );
  Proxy.utils.systemProxyMgr.enableGlobalProxy('127.0.0.1', '9001');
});
proxyServer.on('error', (err) => {
  log.sysError(err);
});
proxyServer.start();

export default mockIo;
