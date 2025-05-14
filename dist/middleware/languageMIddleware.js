"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.languageMiddleware = void 0;
const languageMiddleware = (req, res, next) => {
    const lang = req.headers["accept-language"];
    req.language = typeof lang === "string" ? lang.split(",")[0] : "en";
    next();
};
exports.languageMiddleware = languageMiddleware;
