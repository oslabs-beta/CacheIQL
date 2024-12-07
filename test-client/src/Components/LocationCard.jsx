import React from 'react';
const LocationCard = (props) => {
  return (
    <>
      <p>{props.business}</p>
      {typeof props.rating === 'number' && (
        <p className='rating'>Rating: {props.rating}/5</p>
      )}
    </>
  );
};
export default LocationCard;
