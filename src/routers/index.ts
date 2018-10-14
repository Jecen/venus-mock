import * as Router from 'koa-router'
import mockHandler from './mock'
import apiHandler from './api'

const router:Router = new Router()

router
  .get('/', async (ctx, next) => {
    ctx.body = '!!!'
  })
  // mock web UI api
  .get('/api/:what/:type', apiHandler)
  .post('/api/:what/:type', apiHandler)
  .del('/api/:what/:type', apiHandler)
  .put('/api/:what/:type', apiHandler)
  .options('/api/:what/:type', apiHandler)

  // mock api
  .get('/mockapi/(.*)', mockHandler)
  .post('/mockapi/(.*)', mockHandler)
  .del('/mockapi/(.*)', mockHandler)
  .put('/mockapi/(.*)', mockHandler)
  .options('/mockapi/(.*)', mockHandler)


export default router