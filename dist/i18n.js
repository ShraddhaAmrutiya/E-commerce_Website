"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const i18next_fs_backend_1 = __importDefault(require("i18next-fs-backend"));
const i18next_http_middleware_1 = __importDefault(require("i18next-http-middleware"));
const path_1 = __importDefault(require("path"));
i18next_1.default
    .use(i18next_fs_backend_1.default)
    .use(i18next_http_middleware_1.default.LanguageDetector)
    .init({
    fallbackLng: 'en',
    preload: ['en', 'he', 'hi'],
    backend: {
        loadPath: path_1.default.join(process.cwd(), 'locales/{{lng}}/translation.json'),
    },
    detection: {
        order: ['querystring', 'header'],
        caches: []
    },
    // debug: true, 
    saveMissing: false
});
exports.default = i18next_1.default;
