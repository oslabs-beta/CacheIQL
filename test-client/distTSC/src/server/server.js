"use strict";
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const db = require('./models/starWarsModels');
const app = express();
//specifies the data types and Queries
const schema = buildSchema(`
    type people{
    id:ID!
    name:String!
    mass:String
    hair_color:String!
    skin_color:String
    eye_color:String
    birth_year:String
    gender:String!
    species_id:Int!
    homeworld_id:Int!
    height:Int
    }

    type Query {
    people: [people]
    }
    `);
//an object that contains resolver functions
//the keys correspond to the field names in the Query type
//the values are functions that resolve the field's value
const rootValue = {
    people: () => {
        return;
    },
};
app.use(graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
}));
app.listen(3000, () => console.log('listening on 3000'));
