const db = require('../models/starWarsModels');
//specifies the data types and Queries
//an object that contains resolver functions
//the keys correspond to the field names in the Query type
//the values are functions that resolve the field's value
module.exports = {
  //using postgre sql this resolver selects all of the people from the database and returns them
  people: async (): Promise<object> => {
    //query
    const query = 'SELECT * FROM people';
    //request
    const results = await db.query(query);
    //response being returned is in the shape of an array
    return results.rows;
  },

  //This Resolver selects a single person from the people table
  person: async (parent: any, args: any): Promise<object> => {
    //selects where the id matches
    const query = 'SELECT * FROM people WHERE _id = $1';
    //grabs the id property off the args object
    const id = args.id;
    //queries the database
    const results = await db.query(query, id);

    //returns the results in the proper format
    return results.rows;
  },
};
