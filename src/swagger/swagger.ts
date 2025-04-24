import swaggerJSDoc from 'swagger-jsdoc';
import {cartSwagger} from "./cartswagger"
import {productSwagger} from "./productSwagger"
import {userSwagger} from "./authSwagger"
import {categorySwagger} from "./categorySwagger"
import {orderSwagger} from "./orderSwagger"
import {ChatboatSwagger} from "./chatboatswagger"
import {WishlistSwagger} from "./wishlistSwagger"

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
    ...userSwagger,
    ...cartSwagger.paths,
    ...categorySwagger,
    ...productSwagger,
    ...orderSwagger,
    ...WishlistSwagger.paths,
    ...ChatboatSwagger.paths
  },
};

const options = {
  swaggerDefinition,
  apis: [
    './dist/Routers/UserRouter.js',
    './dist/Routers/CategoryRoutes.js',
    './dist/Routers/ProductRout.js',
    './dist/Routers/cartRoutes.js',
    './dist/Routers/OrderController.js',
    './dist/Routers/wishlistControllers.js'
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
