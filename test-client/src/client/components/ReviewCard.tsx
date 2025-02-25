import {ReviewCardProps} from '../types';

export const ReviewCard = ({review}: ReviewCardProps) =>{
    return(
        <div className='ReviewBox'>
            <hr />
            <p>{review.review}</p>
            <hr />
        </div>
    )
}
export default ReviewCard;