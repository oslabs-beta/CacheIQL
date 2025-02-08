const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { cacheMiddleware } = require("../../../cacheiql-server/src/middleware/cacheMiddleware.ts");
//const { buildSchema } = require('graphql');
//keep as require call to avoid err
//const db = require('./models/starWarsModels');
const graphqlSchema = require('./schema/schema');
const rootValue = require('./schema/resolvers');
//the names of schema and rootValue matter, they must be named the exact same way

const app = express();



const TTL_IN_SECONDS = 1000;
// const rootValueWithCache = cacheMiddleware(rootValue, TTL_IN_SECONDS);
// const rootValueWithMutations = cacheMutationMiddleware(rootValue);
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

// const express = require("express");
// const { graphqlHTTP } = require("express-graphql");
// const {
//   cacheMiddleware,
//   cacheMutationMiddleware,
// } = require("../../../cacheiql-server/src/middleware/cacheMiddleware.ts");
// const graphqlSchema = require("./schema/schema");
// const rootValue = require("./schema/resolvers");

// const app = express();
// const TTL_IN_SECONDS = 1000;

// // Explicitly define the type for resolvers
// const queryResolvers: Record<string, Function> = {};
// const mutationResolvers: Record<string, Function> = {};

// Object.keys(rootValue).forEach((key) => {
//   if (rootValue[key]) {
//     // Ensure GraphQL schema types are available
//     const queryType = graphqlSchema.getQueryType();
//     const mutationType = graphqlSchema.getMutationType();

//     if (queryType && queryType.getFields()[key]) {
//       queryResolvers[key] = rootValue[key];
//     } else if (mutationType && mutationType.getFields()[key]) {
//       mutationResolvers[key] = rootValue[key];
//     }
//   }
// });

// app.use(
//   "/graphql",
//   graphqlHTTP({
//     schema: graphqlSchema,
//     rootValue: {
//       ...cacheMiddleware(queryResolvers, TTL_IN_SECONDS), // Apply caching only to queries
//       ...cacheMutationMiddleware(mutationResolvers), // Apply mutation middleware only to mutations
//     },
//     graphiql: true,
//   })
// );

// app.listen(3000, () => console.log("listening on 3000"));
