"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const CharacterCard_1 = __importDefault(require("./CharacterCard"));
const ReviewCard_1 = __importDefault(require("./ReviewCard"));
const react_1 = require("react");
const HitMiss_1 = __importDefault(require("./HitMiss"));
const { cacheIt } = require('../../../../cacheiql-client/dist/index');
const Dashboard = () => {
    const peopleArray = [];
    const reviewArray = [];
    const [characterinfo, setCharacterinfo] = (0, react_1.useState)(peopleArray);
    const [reviewInfo, setReviewInfo] = (0, react_1.useState)(reviewArray);
    const [reviewText, setReviewText] = (0, react_1.useState)('');
    const [time, setTime] = (0, react_1.useState)(0);
    const getPeopleB = () => __awaiter(void 0, void 0, void 0, function* () {
        const startTime = performance.now();
        const responseCharacter = yield cacheIt('http://localhost:3000/graphql', {
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
        }, 10);
        console.log(responseCharacter);
        setCharacterinfo(responseCharacter.data.people);
        const endTime = performance.now();
        setTime(endTime - startTime);
    });
    /**
     * {
      reviews{
          movie_id
          review
      }
  }
     */
    const getReviews = () => __awaiter(void 0, void 0, void 0, function* () {
        const responseReview = yield cacheIt('http://localhost:3000/graphql', {
            query: `
          {
          reviews {
            _id
            movie_id
            review
          }
        }`,
        }, 10);
        setReviewInfo(responseReview.data.reviews);
    });
    const handleReview = (e) => {
        setReviewText(e.target.value);
        console.log(reviewText);
    };
    const createReview = () => __awaiter(void 0, void 0, void 0, function* () {
        const post = yield cacheIt('http://localhost:3000/graphql', {
            mutation: `{
    createReview(input: {movie_id: 4, text:"${reviewText}"}) {
      _id
      review
    }
  }
  `
        }, 400);
        // --> variables
    });
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
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { onClick: getPeopleB, className: 'getPeople' }), (0, jsx_runtime_1.jsx)("button", { onClick: getReviews, className: 'getPeople' }), (0, jsx_runtime_1.jsx)("div", { className: 'hitmissbox', children: (0, jsx_runtime_1.jsx)(HitMiss_1.default, { time: time }) }), (0, jsx_runtime_1.jsx)("div", { className: 'cardBox', children: characterinfo.map((character) => ((0, jsx_runtime_1.jsx)(CharacterCard_1.default, { character: character }, character._id))) }), (0, jsx_runtime_1.jsx)("div", { className: 'reviewsBox', children: reviewInfo.map((review) => ((0, jsx_runtime_1.jsx)(ReviewCard_1.default, { review: review }, review._id))) }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: 'Type review here', onChange: handleReview }), (0, jsx_runtime_1.jsx)("button", { type: 'submit', onClick: createReview, children: "Submit Your Review" })] }));
};
exports.default = Dashboard;
