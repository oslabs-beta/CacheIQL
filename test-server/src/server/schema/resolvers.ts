import { query } from 'express';

const db = require('../models/starWarsModels');
const schema = require('./schema');
//specifies the data types and Queries
//an object that contains resolver functions
//the keys correspond to the field names in the Query type
//the values are functions that resolve the field's value
module.exports = {
  //using postgre sql this resolver selects all of the people from the database and returns them
  //Query: {
  people: async (): Promise<object> => {
    //query
    const query = 'SELECT * FROM people';
    //request
    const results = await db.query(query);
    //response being returned is in the shape of an array
    return results.rows;
  },

  //This Resolver selects a single person from the people table
  person: async (args: { id: string }): Promise<object> => {
    //selects where the id matches
    const query = 'SELECT * FROM people WHERE _id = $1';
    //grabs the id property off the args object
    const { id } = args;
    console.log('Args argument:', args);
    console.log('Extracted ID:', id);
    //queries the database
    const results = await db.query(query, [id]);
    //console.log(args);
    //console.log(id);
    //returns the results in the proper format
    return results.rows[0];
  },
  // },

  //Mutation: {
  createReview: async (
    //_parent: any,
    args: { input: { movie_id: number; text: string } }
  ): Promise<object> => {
    const query = 'INSERT into reviews (movie_id,review) VALUES ($1,$2)';
    const { movie_id, text } = args.input;
    const results = await db.query(query, [movie_id, text]);

    return results.rows[0];
  },
  //},
};
