const { buildSchema } = require('graphql');

/**Similar to how typescript makes you define the types to use the data
 * the schema makes you format how your data is coming so you can parse it how you want
 * within the query
 */
module.exports = buildSchema(`
    type person{
    _id:ID!
    name:String!
    mass:String
    hair_color:String
    skin_color:String
    eye_color:String
    birth_year:String
    gender:String
    species_id:Int
    homeworld_id:Int
    height:Int
    }

    type Query {
    people: [person]
    person(id:ID!): person!
    }
    `);
