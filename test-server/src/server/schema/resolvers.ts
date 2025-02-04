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
  // people: async (): Promise<object> => {
  //   //query
  //   const query = 'SELECT * FROM people';
  //   //request
  //   const results = await db.query(query);
  //   //response being returned is in the shape of an array
  //   return results.rows;
  // },

  people: async (_parent: any, _args: any, _context: any) => {
  const query = 'SELECT * FROM people';
  const results = await db.query(query);
    return results.rows;
  },

  

  // This Resolver selects a single person from the people table
  // person: async (args: { id: string }): Promise<object> => {
  //   //selects where the id matches
  //   const query = 'SELECT * FROM people WHERE _id = $1';
  //   //grabs the id property off the args object
  //   const { id } = args;
  //   console.log('Args argument:', args);
  //   console.log('Extracted ID:', id);
  //   //queries the database
  //   const results = await db.query(query, [id]);
  //   //console.log(args);
  //   //console.log(id);
  //   //returns the results in the proper format
  //   return results.rows[0];
  // },

    person: async (_parent: any, args: { id: string }, _context: any): Promise<object> => {
  const query = 'SELECT * FROM people WHERE _id = $1';
  const results = await db.query(query, [args.id]);
  return results.rows[0];
},


  //Mutation: {
  createReview: async (
    //_parent: any,
    args: { input: { movie_id: number; text: string } }
  ): Promise<object> => {
    const query = 'INSERT into reviews (movie_id,review) VALUES ($1,$2) RETURNING *';
    const { movie_id, text } = args.input;
    const results = await db.query(query, [movie_id, text]);

    return results.rows[0];
  },
  createPerson: async (args: {
    input: {
      name: string;
      mass?: string;
      hair_color?: string;
      skin_color?: string;
      eye_color?: string;
      birth_year?: string;
      gender?: string;
      species_id?: number;
      homeworld_id?: number;
      height?: number;
    };
  }) => {
    const query = `
      INSERT INTO people (name, mass, hair_color, skin_color, eye_color, birth_year, gender, species_id, homeworld_id, height)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING _id, name, species_id, homeworld_id`;

    const {
      name,
      mass,
      hair_color,
      skin_color,
      eye_color,
      birth_year,
      gender,
      species_id,
      homeworld_id,
      height,
    } = args.input;

    const results = await db.query(query, [
      name,
      mass,
      hair_color,
      skin_color,
      eye_color,
      birth_year,
      gender,
      species_id,
      homeworld_id,
      height,
    ]);
    console.log('args', args);
    // ✅ Invalidate the cache so new data is fetched
    // await invalidateCacheForMutation('createPerson', args);

    const newPerson = results.rows[0];

    console.log('✅ Created person:', newPerson);

    // ✅ Invalidate cache using the actual person ID
    //  await invalidateCacheForMutation('createPerson', newPerson);

    return newPerson;
  }
  //},
};
