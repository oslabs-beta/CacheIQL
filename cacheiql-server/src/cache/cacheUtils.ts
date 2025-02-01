//Optional utility functions for caching

//hashing the function to make the key more secure by making it binary
// export const hashKey = (string: string): string => {
//   let hash = 0;

//   if (string.length === 0) return hash.toString();

//   for (let i = 0; i < string.length; i++) {
//     let char = string.charCodeAt(i);
//     //shifts the hash position by 5 "<<" the same as x*(2^y)
//     hash = (hash << 5) - hash + char;
//     hash = hash & hash;
//   }

//   return hash.toString();
// };



import crypto from "crypto";

export const hashKey = (string: string): string => {
  return crypto.createHash("sha256").update(string).digest("hex").slice(0, 64);
};
