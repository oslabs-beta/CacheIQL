"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const CharacterCard = ({ character }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: 'characterCard', children: [(0, jsx_runtime_1.jsx)("h1", { children: character.name }), (0, jsx_runtime_1.jsxs)("p", { children: ["Gender: ", character.gender] }), (0, jsx_runtime_1.jsxs)("p", { children: ["Hair Color: ", character.hair_color] }), (0, jsx_runtime_1.jsxs)("p", { children: ["Birth Year: ", character.birth_year] }), (0, jsx_runtime_1.jsxs)("p", { children: ["Homeplanet: ", character.homeworld_id] }), (0, jsx_runtime_1.jsxs)("p", { children: ["Species: ", character.species_id] })] }));
};
exports.default = CharacterCard;
