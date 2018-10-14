import {s_mock, mockService} from '../service/mock'

const mockHandler = async (ctx, next) => {
  const {method, url} = ctx
  const rule:any = s_mock.matchRule(url, method)
  const response = await mockService.getResponse(rule, ctx)
  
  ctx.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Methods': 'POST, GET, DELETE, PUT, OPTIONS'
  })
  ctx.set('Access-Control-Allow-Origin', '*')

  ctx.body = response
}

export default mockHandler