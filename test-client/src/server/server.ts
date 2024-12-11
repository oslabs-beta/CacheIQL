const express = require('express');
const { graphqlHTTP } = require('express-graphql');
//keep as require call to avoid err
const schema = require('./schema/schema');
const resolvers = require('./schema/resolvers');

const app = express();

app.use(
  graphqlHTTP({
    schema,
    resolvers,
    graphiql: true,
  })
);

app.listen(3000, () => console.log('listening on 3000'));
