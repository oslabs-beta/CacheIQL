"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const db = require('../models/starWarsModels');
const schema = require('./schema');
//specifies the data types and Queries
//an object that contains resolver functions
//the keys correspond to the field names in the Query type
//the values are functions that resolve the field's value
module.exports = {
    //using postgre sql this resolver selects all of the people from the database and returns them
    //Query: {
    people: () => __awaiter(void 0, void 0, void 0, function* () {
        //query
        const query = 'SELECT * FROM people';
        //request
        const results = yield db.query(query);
        //response being returned is in the shape of an array
        return results.rows;
    }),
    //This Resolver selects a single person from the people table
    person: (args) => __awaiter(void 0, void 0, void 0, function* () {
        //selects where the id matches
        const query = 'SELECT * FROM people WHERE _id = $1';
        //grabs the id property off the args object
        const { id } = args;
        console.log('Args argument:', args);
        console.log('Extracted ID:', id);
        //queries the database
        const results = yield db.query(query, [id]);
        //console.log(args);
        //console.log(id);
        //returns the results in the proper format
        return results.rows[0];
    }),
    // },
    //Mutation: {
    createReview: (
    //_parent: any,
    args) => __awaiter(void 0, void 0, void 0, function* () {
        const query = 'INSERT into reviews (movie_id,review) VALUES ($1,$2)';
        const { movie_id, text } = args.input;
        const results = yield db.query(query, [movie_id, text]);
        return results.rows[0];
    }),
    //},
};
