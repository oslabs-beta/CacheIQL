const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { cacheMiddleware } = require('../../../cacheiql-server/src/middleware/cacheMiddleware.ts');
//const { buildSchema } = require('graphql');
//keep as require call to avoid err
//const db = require('./models/starWarsModels');
const graphqlSchema = require('./schema/schema');
const rootValue = require('./schema/resolvers');
//the names of schema and rootValue matter, they must be named the exact same way

const app = express();

// const testOBJ = {
//   print: (string: string) => {
//     return string;
//   },
// };

//cacheMiddleware(rootValue);
//console.log('Root Values: ', rootValue); // Check if the resolvers are properly defined.

const TTL_IN_SECONDS = 1000;
app.use(
  '/graphql',
  graphqlHTTP({
    schema: graphqlSchema,
    //rootValue:rootValue,
    rootValue: cacheMiddleware(rootValue, TTL_IN_SECONDS),
    graphiql: true,
  })
);

app.listen(3000, () => console.log('listening on 3000'));
