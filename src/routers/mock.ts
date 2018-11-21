import { service, mockService } from '../service/mock';
const mockHandler = async (ctx, next) => {
  let response = null;

  const { method, url, request: { headers: { host, prevprotocol: protocol } } } = ctx;
  const rule:any = service.matchRule(host, url, method, protocol);
  if (rule) {
    response = await mockService.getResponse(rule, ctx);
    const { mockIo } = ctx;
    mockIo.sendMsg('mock', response);
  }

  ctx.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Methods': 'POST, GET, DELETE, PUT, OPTIONS',
  });
  ctx.set('Access-Control-Allow-Origin', '*');

  ctx.body = response || null;
};

export default mockHandler;
