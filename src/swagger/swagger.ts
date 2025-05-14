
import swaggerJSDoc from 'swagger-jsdoc';
import { cartSwagger } from './cartswagger';
import { productSwagger } from './productSwagger';
import { userSwagger } from './authSwagger';
import { categorySwagger } from './categorySwagger';
import { orderSwagger } from './orderSwagger';
import { ChatboatSwagger } from './chatboatswagger';
import { WishlistSwagger } from './wishlistSwagger';

// Add Accept-language header to all endpoints
function addGlobalHeaders(paths) {
  for (const path in paths) {
    for (const method in paths[path]) {
      const operation = paths[path][method];

      if (!operation.parameters) {
        operation.parameters = [];
      }

      const alreadyAdded = operation.parameters.find(
        (param) => param.$ref === '#/components/parameters/AcceptLanguage'
      );

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
          enum: ['en','hi','he'],
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
    ...userSwagger,
    ...cartSwagger.paths,
    ...categorySwagger,
    ...productSwagger,
    ...orderSwagger,
    ...WishlistSwagger.paths,
    ...ChatboatSwagger.paths,
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

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
