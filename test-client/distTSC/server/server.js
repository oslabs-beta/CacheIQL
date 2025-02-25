"use strict";
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const cors = require('cors');
//const { buildSchema } = require('graphql');
//keep as require call to avoid err
//const db = require('./models/starWarsModels');
const graphqlSchema = require('./schema/schema');
const rootValue = require('./schema/resolvers');
//the names of schema and rootValue matter, they must be named the exact same way
const app = express();
app.use(cors());
app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue,
    graphiql: true,
}));
app.listen(3000, () => console.log('listening on 3000'));
