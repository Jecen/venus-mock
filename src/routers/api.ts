import { apiService } from '../service/api'

const apiHandler = async (ctx, next) => {
  const params = ctx.params
  const { request: { method } } = ctx
  
  let response:object

  ctx.set({
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Credentials': true,
  })
  ctx.set('Access-Control-Allow-Origin', '*')
  method === 'OPTIONS' && ctx.set({
    'Access-Control-Allow-Methods': 'POST, GET, DELETE, PUT, OPTIONS'
  })
  switch (params.what) {
    case 'mock':
      response = await apiService.handler(ctx)
      break;
    default:
      break;
  }
  
  ctx.body = response
}

export default apiHandler