import { useState } from 'react';
import { CharacterProps } from '../types';

const CharacterCard = ({ character }: CharacterProps) => {
  return (
    <div className='characterCard'>
      <h1>{character.name}</h1>
      <p>Gender: {character.gender}</p>
      <p>Hair Color: {character.hair_color}</p>
      <p>Birth Year: {character.birth_year}</p>
      <p>Homeplanet: {character.homeworld_id}</p>
      <p>Species: {character.species_id}</p>
    </div>
  );
};

export default CharacterCard;
