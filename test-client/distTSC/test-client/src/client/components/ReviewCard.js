"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewCard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ReviewCard = ({ review }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: 'ReviewBox', children: [(0, jsx_runtime_1.jsx)("hr", {}), (0, jsx_runtime_1.jsx)("p", { children: review.review }), (0, jsx_runtime_1.jsx)("hr", {})] }));
};
exports.ReviewCard = ReviewCard;
exports.default = exports.ReviewCard;
