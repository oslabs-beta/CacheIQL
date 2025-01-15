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
const react_1 = require("react");
const HitMiss_1 = __importDefault(require("./HitMiss"));
const { cacheIt } = require('cacheiql-client/dist/index.js');
const Dashboard = () => {
    const peopleArray = [];
    const [characterinfo, setCharacterinfo] = (0, react_1.useState)(peopleArray);
    const [time, setTime] = (0, react_1.useState)(0);
    const getPeopleB = () => __awaiter(void 0, void 0, void 0, function* () {
        const startTime = performance.now();
        const response = yield cacheIt('http://localhost:3000/graphql', {
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
        });
        setCharacterinfo(response.data.people);
        const endTime = performance.now();
        setTime(endTime - startTime);
    });
    const getPeopleA = () => __awaiter(void 0, void 0, void 0, function* () {
        const startTime = performance.now();
        const response = yield fetch('http://localhost:3000/graphql', {
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
            .then((data) => {
            setCharacterinfo(data.data.people);
            const endTime = performance.now();
            setTime(endTime - startTime);
        });
    });
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { onClick: getPeopleB, className: 'getPeople' }), (0, jsx_runtime_1.jsx)("div", { className: 'hitmissbox', children: (0, jsx_runtime_1.jsx)(HitMiss_1.default, { time: time }) }), (0, jsx_runtime_1.jsx)("div", { className: 'cardBox', children: characterinfo.map((character) => ((0, jsx_runtime_1.jsx)(CharacterCard_1.default, { character: character }, character._id))) })] }));
};
exports.default = Dashboard;
