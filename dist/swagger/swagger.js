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
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
    paths: {
        ...authSwagger_1.userSwagger,
        ...cartswagger_1.cartSwagger.paths,
        ...categorySwagger_1.categorySwagger,
        ...productSwagger_1.productSwagger,
        ...orderSwagger_1.orderSwagger.paths,
    },
};
const options = {
    swaggerDefinition,
    apis: [
        './dist/Routers/UserRouter.js',
        './dist/Routers/CategoryRoutes.js',
        './dist/Routers/ProductRout.js',
        './dist/Routers/cartRoutes.js',
        './dist/Routers/OrderController.js'
    ],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
