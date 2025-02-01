import CharacterCard from './CharacterCard';
import ReviewCard from './ReviewCard';
import { useState, useEffect } from 'react';
import HitMiss from './HitMiss';
const { cacheIt } = require('../../../../cacheiql-client/dist/index');
import { ResponseObject } from '../types';
const Dashboard = () => {
  const peopleArray: Array<object> = [];
  const reviewArray: Array<object> = [];
  const [characterinfo, setCharacterinfo] = useState(peopleArray);
  const [reviewInfo, setReviewInfo] = useState(reviewArray);
  const [reviewText, setReviewText] = useState('')
  const [time, setTime] = useState(0);
  const getPeopleB = async () => {
    const startTime: number = performance.now();
    const responseCharacter: ResponseObject = await cacheIt(
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
      },
      10
    );
    console.log(responseCharacter);
    setCharacterinfo(responseCharacter.data.people);
    const endTime: number = performance.now();
    setTime(endTime - startTime);
  };

  /**
   * {
    reviews{
        movie_id
        review
    }
}
   */
const getReviews = async()=>{
  const responseReview: ResponseObject = await cacheIt(
    'http://localhost:3000/graphql',
    {
      query: `
          {
          reviews {
            _id
            movie_id
            review
          }
        }`,
    },
    10
  );
  setReviewInfo(responseReview.data.reviews)
}  

const handleReview = (e:any) => {
  setReviewText(e.target.value);
  console.log(reviewText);
}

const createReview = async()=> {  
  const post = await cacheIt('http://localhost:3000/graphql', {
  mutation: `{
    createReview(input: {movie_id: 4, text:"${reviewText}"}) {
      _id
      review
    }
  }
  `
},400)
// --> variables
}

  // const getPeopleA = async () => {
  //   const startTime = performance.now();
  //   const response: any = await fetch('http://localhost:3000/graphql', {
  //     //Graphql Queries are performded as a post request
  //     method: 'POST',
  //     //The type of body being sent is an application/json
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     //body of the response/request
  //     body: JSON.stringify({
  //       query: `

  //     {
  //     people{
  //     _id
  //     gender
  //     birth_year
  //     skin_color
  //     hair_color
  //     name
  //     species_id
  //     homeworld_id
  //     }
  //   }`,
  //     }),
  //   })
  //     .then((res) => res.json())
  //     .then((data: any) => {
  //       setCharacterinfo(data.data.people);

  //       const endTime = performance.now();
  //       setTime(endTime - startTime);
  //     });
  // };

  return (
    <>
      <button onClick={getPeopleB} className='getPeople'></button>
      <button onClick={getReviews} className='getPeople'></button>
      <div className='hitmissbox'>
        <HitMiss time={time} />
      </div>
      <div className='cardBox'>
        {characterinfo.map((character: any) => (
          <CharacterCard key={character._id} character={character} />
        ))}
      </div>
      {/** populate a list of review cards based on a different request to gather all reviews*/}
      <div className='reviewsBox'>
        {reviewInfo.map((review: any) => (
          <ReviewCard key={review._id} review = {review} />
        ))}
      </div>
      <input type="text" placeholder='Type review here' onChange={handleReview}/>
      <button type='submit' onClick={createReview}>Submit Your Review</button>
      
    </>
  );
};

export default Dashboard;
