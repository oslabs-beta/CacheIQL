"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("react-dom/client");
const Dashboard_1 = __importDefault(require("./components/Dashboard"));
require("./styles/characterCard.scss");
require("./styles/dashboard.scss");
require("./styles/time.scss");
const App = () => {
    return ((0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(Dashboard_1.default, {}) }));
};
(0, client_1.createRoot)(document.querySelector('#root')).render((0, jsx_runtime_1.jsx)(App, {}));
