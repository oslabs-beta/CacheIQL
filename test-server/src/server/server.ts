const express = require('express');
const { graphqlHTTP } = require('express-graphql');
//const { buildSchema } = require('graphql');
//keep as require call to avoid err
//const db = require('./models/starWarsModels');
const graphqlSchema = require('./schema/schema');
const rootValue = require('./schema/resolvers');
const { cacheMiddleware } = require('../../../cacheiql-server/src/index');
//the names of schema and rootValue matter, they must be named the exact same way

const app = express();

const testOBJ = {
  print:(string:string)=>{
return string
  }
}

console.log('Root Values: ', rootValue); // Check if the resolvers are properly defined.

app.use(
  '/graphql',
  graphqlHTTP({
    schema: graphqlSchema,
    //rootValue:rootValue,
    rootValue: Object.keys(rootValue).reduce((wrappedResolvers, key) => {
      console.log(`Wrapping resolver for ${key}`);
      const wrappedResolver = cacheMiddleware(rootValue[key]);
      
      // Logging to make sure we're wrapping the function correctly
      console.log(`Wrapped resolver for ${key}: `, wrappedResolver);

      return {
        ...wrappedResolvers,
        [key]: wrappedResolver,
      };
    }, {}),
    graphiql: true,
  })
);

app.listen(3000, () => console.log('listening on 3000'));


console.log('middleware',cacheMiddleware)