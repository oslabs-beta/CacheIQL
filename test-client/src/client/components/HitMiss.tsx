import { HitMissProps } from '../types';

const HitMiss = ({ time }: HitMissProps) => {
  return (
    <div className='timebox'>
      <p>{time}</p>
    </div>
  );
};

export default HitMiss;
