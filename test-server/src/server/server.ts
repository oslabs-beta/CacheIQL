const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { cacheMiddleware } = require("../../../cacheiql-server/src/middleware/cacheMiddleware.ts");

const graphqlSchema = require('./schema/schema');
const rootValue = require('./schema/resolvers');


const app = express();



const TTL_IN_SECONDS = 1000;

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    //rootValue:rootValue,
    rootValue: cacheMiddleware(rootValue, TTL_IN_SECONDS, graphqlSchema),
    graphiql: true,
  })
);

app.listen(3000, () => console.log('listening on 3000'));


