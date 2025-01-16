"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheIt = void 0;
const export_1 = require("./export");
const cacheIt = (endpoint, query, variables) => {
    return (0, export_1.cacheiqIt)(endpoint, query, variables);
};
exports.cacheIt = cacheIt;
