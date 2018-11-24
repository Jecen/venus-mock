import { service } from '../service/graphql';
const graphqlHandler = async (ctx, next) => {
  let response = null;

  ctx.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Methods': 'POST, GET, DELETE, PUT, OPTIONS',
  });
  ctx.set('Access-Control-Allow-Origin', '*');

  response = await service.handler(ctx);

  ctx.body = response || null;
};

export default graphqlHandler;
