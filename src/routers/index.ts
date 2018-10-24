import * as Router from 'koa-router'
import mockHandler from './mock'
import apiHandler from './api'
import * as fs from 'fs'
import * as path from 'path'

const router:Router = new Router()

router
  .get('/', async (ctx, next) => {
    const getPage = () => new Promise((resolve, reject) => {
      fs.readFile(path.join(__dirname, '../app/dist/index.html'),'utf-8',function(err,data){
        if (err) {
          reject(err)
        }
        resolve(data)
      })
    })
    const page = await getPage()
    ctx.body = page
  })

  .get('/api/:what/:type/:action', apiHandler)
  .post('/api/:what/:type/:action', apiHandler)
  .del('/api/:what/:type/:action', apiHandler)
  .put('/api/:what/:type/:action', apiHandler)
  .options('/api/:what/:type/:action', apiHandler)

  // mock api
  .get('/mockapi/(.*)', mockHandler)
  .post('/mockapi/(.*)', mockHandler)
  .del('/mockapi/(.*)', mockHandler)
  .put('/mockapi/(.*)', mockHandler)
  .options('/mockapi/(.*)', mockHandler)

export default router