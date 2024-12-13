import CharacterCard from './CharacterCard';
import { useState, useEffect } from 'react';
import HitMiss from './HitMiss';

const Dashboard = () => {
  const [characterinfo, setCharacterinfo] = useState([]);
  const [time, setTime] = useState(0);
  const getPeople = async () => {
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
      <button onClick={getPeople} className='getPeople'></button>
      <HitMiss time={time} />
      {characterinfo.map((character: any) => (
        <CharacterCard key={character._id} character={character} />
      ))}
    </>
  );
};

export default Dashboard;
