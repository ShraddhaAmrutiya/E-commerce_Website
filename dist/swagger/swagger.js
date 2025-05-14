"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const cartswagger_1 = require("./cartswagger");
const productSwagger_1 = require("./productSwagger");
const authSwagger_1 = require("./authSwagger");
const categorySwagger_1 = require("./categorySwagger");
const orderSwagger_1 = require("./orderSwagger");
const chatboatswagger_1 = require("./chatboatswagger");
const wishlistSwagger_1 = require("./wishlistSwagger");
// Add Accept-language header to all endpoints
function addGlobalHeaders(paths) {
    for (const path in paths) {
        for (const method in paths[path]) {
            const operation = paths[path][method];
            if (!operation.parameters) {
                operation.parameters = [];
            }
            const alreadyAdded = operation.parameters.find((param) => param.$ref === '#/components/parameters/AcceptLanguage');
            if (!alreadyAdded) {
                operation.parameters.push({
                    $ref: '#/components/parameters/AcceptLanguage',
                });
            }
        }
    }
    return paths;
}
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Ecommerce Website',
        version: '1.0.0',
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        parameters: {
            AcceptLanguage: {
                name: 'Accept-language',
                in: 'header',
                required: false,
                schema: {
                    type: 'string',
                    enum: ['en', 'hi', 'he'],
                    default: 'en',
                },
                description: 'Preferred language for the response',
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
    paths: addGlobalHeaders({
        ...authSwagger_1.userSwagger,
        ...cartswagger_1.cartSwagger.paths,
        ...categorySwagger_1.categorySwagger,
        ...productSwagger_1.productSwagger,
        ...orderSwagger_1.orderSwagger,
        ...wishlistSwagger_1.WishlistSwagger.paths,
        ...chatboatswagger_1.ChatboatSwagger.paths,
    }),
};
const options = {
    swaggerDefinition,
    apis: [
        './dist/Routers/UserRouter.js',
        './dist/Routers/CategoryRoutes.js',
        './dist/Routers/ProductRout.js',
        './dist/Routers/cartRoutes.js',
        './dist/Routers/OrderController.js',
        './dist/Routers/wishlistControllers.js',
    ],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
