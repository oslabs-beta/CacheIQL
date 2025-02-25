const { buildSchema } = require('graphql');

/**Similar to how typescript makes you define the types to use the data
 * the schema makes you format how your data is coming so you can parse it how you want
 * within the query
 */
module.exports = buildSchema(`
    type Person{
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

    type Movie{
    _id: ID!
    title: String!
    episode: Int!
    opening_crawl: String!
    director: String!
    producer: String!
    release_date:Int!
    }

    type Review{
    _id:ID!
    movie_id: Int!
    review:String!
    }
    
    input ReviewInput{
    text:String!
    movie_id: Int!
    fettyWap: String!
    }
    
    input PersonInput {
        name: String!
        mass: String
        hair_color: String
        skin_color: String
        eye_color: String
        birth_year: String
        gender: String
        species_id: Int
        homeworld_id: Int
        height: Int
    }   
    type Query {

    people: [person]
    person(id: ID!): person!
    reviews: [review]

    }
            
    type Mutation{
    createReview(input: ReviewInput!): Review
    createPerson(input: PersonInput!): Person
    updatePerson(id: ID!, input: PersonInput!): Person
    }
    `);
