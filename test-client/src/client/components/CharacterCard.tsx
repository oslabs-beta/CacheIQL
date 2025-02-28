import { useState } from 'react';
import { CharacterProps } from '../types';

const CharacterCard = ({ character }: CharacterProps) => {
  return (
    <div className='characterCard'>
      <h1 className='cardTitle'>{character.name}</h1>
      <p className='cardInfo'>Gender: {character.gender}</p>
      <p className='cardInfo'>Hair Color: {character.hair_color}</p>
      <p className='cardInfo'>Birth Year: {character.birth_year}</p>
      <p className='cardInfo'>Homeplanet: {character.homeworld_id}</p>
      <p className='cardInfo'>Species: {character.species_id}</p>
    </div>
  );
};

export default CharacterCard;
