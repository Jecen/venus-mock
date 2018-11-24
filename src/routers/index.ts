import * as Router from 'koa-router';
import mock from './mock';
import api from './api';
import graphql from './graphql';
import * as fs from 'fs';
import * as path from 'path';

// import * as graphqlHTTP from 'koa-graphql';
// import {
//   graphql,
//   GraphQLSchema,
//   GraphQLObjectType,
//   GraphQLString,
// } from 'graphql';

// const schema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name: 'hello',
//     fields: {
//       number: {
//         type: GraphQLString,
//         resolve() {
//           return '12333123';
//         },
//       },
//       hello: {
//         type: GraphQLString,
//         resolve() {
//           return 'world';
//         },
//       },
//     },
//   }),
// });

const router:Router = new Router();

router
  .get('/', async (ctx, next) => {
    const getPage = () => new Promise((resolve, reject) => {
      fs.readFile(path.join(__dirname, '../app/dist/index.html'), 'utf-8',  (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
    const page = await getPage();
    ctx.body = page;
  })

  .all('/graphql', graphql)

  .get('/api/:what/:type/:action', api)
  .post('/api/:what/:type/:action', api)
  .del('/api/:what/:type/:action', api)
  .put('/api/:what/:type/:action', api)
  .options('/api/:what/:type/:action', api)

  // mock api
  .get('/mockapi/(.*)', mock)
  .post('/mockapi/(.*)', mock)
  .del('/mockapi/(.*)', mock)
  .put('/mockapi/(.*)', mock)
  .options('/mockapi/(.*)', mock);

export default router;
