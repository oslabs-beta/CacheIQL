import CharacterCard from './CharacterCard';
import { useState, useEffect } from 'react';
import HitMiss from './HitMiss';

// import { cacheIt } from 'cacheiql-client';
const { cacheIt } = require('cacheiql-client/dist/index.js')
import { ResponseObject } from '../types';
const Dashboard = () => {
  const peopleArray: Array<object> = [];
  const [characterinfo, setCharacterinfo] = useState(peopleArray);
  const [time, setTime] = useState(0);
  const getPeopleB = async () => {
    const startTime: number = performance.now();
    const response: ResponseObject = await cacheIt(
      'http://localhost:3000/graphql',
      {
        query: `
            {
            people{
            _id
            gender
            birth_year
            skin_color
            hair_color
            name
            species_id
            homeworld_id
            }
          }`,
      }
    );
    setCharacterinfo(response.data.people);
    const endTime: number = performance.now();
    setTime(endTime - startTime);
  };

  const getPeopleA = async () => {
    const startTime = performance.now();
    const response: any = await fetch('http://localhost:3000/graphql', {
      //Graphql Queries are performded as a post request
      method: 'POST',
      //The type of body being sent is an application/json
      headers: {
        'Content-Type': 'application/json',
      },
      //body of the response/request
      body: JSON.stringify({
        query: `

      {
      people{
      _id
      gender
      birth_year
      skin_color
      hair_color
      name
      species_id
      homeworld_id
      }
    }`,
      }),
    })
      .then((res) => res.json())
      .then((data: any) => {
        setCharacterinfo(data.data.people);

        const endTime = performance.now();
        setTime(endTime - startTime);
      });
  };

  return (
    <>
      <button onClick={getPeopleB} className='getPeople'></button>
      <div className='hitmissbox'>
        <HitMiss time={time} />
      </div>
      <div className='cardBox'>
        {characterinfo.map((character: any) => (
          <CharacterCard key={character._id} character={character} />
        ))}
      </div>
    </>
  );
};

export default Dashboard;
