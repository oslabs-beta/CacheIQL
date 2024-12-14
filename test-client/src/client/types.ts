//you need to create a type for props or you will face errors

export type CharacterProps = {
  character: {
    _id: string;
    name: string;
    skin_color: string;
    hair_color: string;
    eye_color: string;
    birth_year: string;
    species_id: number;
    gender: string;
    height: number;
    homeworld_id: number;
  };
};

export type HitMissProps = {
  time: number;
};


export type ResponseObject = {
  data: { people: object[] };
};

