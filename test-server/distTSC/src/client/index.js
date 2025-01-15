"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("react-dom/client");
const App = () => {
    return ((0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("h1", { children: "Client side Testing" }) }));
};
(0, client_1.createRoot)(document.querySelector('#root')).render((0, jsx_runtime_1.jsx)(App, {}));
