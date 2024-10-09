"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Ecommerce Website',
        version: '1.0.0',
        description: 'API documentation for your project',
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            LoginRequestBody: {
                type: 'object',
                properties: {
                    userName: {
                        type: 'string',
                        example: 'john_doe',
                    },
                    password: {
                        type: 'string',
                        example: 'securePassword123',
                    },
                },
                required: ['userName', 'password'],
            },
            ForgotPasswordRequestBody: {
                type: 'object',
                properties: {
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'user@example.com',
                    },
                },
                required: ['email'],
            },
            ResetPasswordRequestBody: {
                type: 'object',
                properties: {
                    token: {
                        type: 'string',
                        example: 'your-reset-token-here',
                    },
                    newPassword: {
                        type: 'string',
                        example: 'NewSecurePassword123',
                    },
                },
                required: ['token', 'newPassword'],
            },
            Category: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: '123e4567-e89b-12d3-a456-426614174000',
                    },
                    name: {
                        type: 'string',
                        example: 'ObjId',
                    },
                    description: {
                        type: 'string',
                        example: 'All kinds of electronic items',
                    },
                },
                required: ['name'],
            },
            ProductRequestBody: {
                type: 'object',
                properties: {
                    category: {
                        type: 'string',
                        example: 'ObjId',
                    },
                    title: {
                        type: 'string',
                        example: 'Smartphone',
                    },
                    description: {
                        type: 'string',
                        example: 'Latest model smartphone with advanced features',
                    },
                    price: {
                        type: 'number',
                        example: 699.99,
                    },
                    salePrice: {
                        type: 'number',
                        example: 599.99,
                    },
                    discount: {
                        type: 'number',
                        example: 15,
                    },
                    quantity: {
                        type: 'array',
                        items: {
                            type: 'number',
                        },
                        example: [100, 50],
                    },
                    colors: {
                        type: 'array',
                        items: {
                            type: 'string',
                            example: 'Black',
                        },
                    },
                    image: {
                        type: 'string',
                        format: 'binary',
                    },
                },
                required: ['category', 'title', 'description', 'price', 'quantity', 'colors'],
            },
            Product: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: '123e4567-e89b-12d3-a456-426614174000',
                    },
                    category: {
                        type: 'string',
                        example: '',
                    },
                    title: {
                        type: 'string',
                        example: 'Smartphone',
                    },
                    description: {
                        type: 'string',
                        example: 'Latest model smartphone with advanced features',
                    },
                    price: {
                        type: 'number',
                        example: 699.99,
                    },
                    salePrice: {
                        type: 'number',
                        example: 599.99,
                    },
                    discount: {
                        type: 'number',
                        example: 15,
                    },
                    quantity: {
                        type: 'array',
                        items: {
                            type: 'number',
                        },
                        example: [100, 50],
                    },
                    colors: {
                        type: 'array',
                        items: {
                            type: 'string',
                            example: 'Black',
                        },
                    },
                    image: {
                        type: 'string',
                        format: 'binary',
                    },
                },
                required: ['category', 'title', 'description', 'price', 'quantity', 'colors'],
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
    tags: [
        {
            name: 'Users',
            description: 'User management',
        },
        {
            name: 'Categories',
            description: 'Category management',
        },
        {
            name: 'Products',
            description: 'Product management',
        },
    ],
    paths: {
        '/users/login': {
            post: {
                summary: 'Log in a user',
                tags: ['Users'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/LoginRequestBody',
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'User logged in successfully',
                    },
                    400: {
                        description: 'Invalid credentials',
                    },
                    500: {
                        description: 'Internal server error',
                    },
                },
            },
        },
        '/users/forgot-password': {
            post: {
                summary: 'Request a password reset',
                tags: ['Users'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ForgotPasswordRequestBody',
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Password reset email sent successfully',
                    },
                    400: {
                        description: 'Invalid email address',
                    },
                    500: {
                        description: 'Internal server error',
                    },
                },
            },
        },
        '/users/reset-password': {
            post: {
                summary: 'Reset user password',
                tags: ['Users'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ResetPasswordRequestBody',
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Password reset successfully',
                    },
                    400: {
                        description: 'Invalid token or password',
                    },
                    500: {
                        description: 'Internal server error',
                    },
                },
            },
        },
        '/products/create': {
            post: {
                summary: 'Create a new product',
                tags: ['Products'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    category: {
                                        type: 'string',
                                        example: 'ObjId',
                                    },
                                    title: {
                                        type: 'string',
                                        example: 'Smartphone',
                                    },
                                    description: {
                                        type: 'string',
                                        example: 'Latest model smartphone with advanced features',
                                    },
                                    price: {
                                        type: 'number',
                                        example: 699.99,
                                    },
                                    salePrice: {
                                        type: 'number',
                                        example: 599.99,
                                    },
                                    discount: {
                                        type: 'number',
                                        example: 15,
                                    },
                                    quantity: {
                                        type: 'array',
                                        items: {
                                            type: 'number',
                                        },
                                        example: [100, 50],
                                    },
                                    colors: {
                                        type: 'array',
                                        items: {
                                            type: 'string',
                                            example: 'Black',
                                        },
                                    },
                                    image: {
                                        type: 'string',
                                        format: 'binary',
                                    },
                                },
                                required: ['category', 'title', 'description', 'price', 'quantity', 'colors'],
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Product created successfully',
                    },
                    400: {
                        description: 'Bad request if required fields are missing or invalid',
                    },
                    500: {
                        description: 'Internal server error',
                    },
                },
            },
        },
        '/categories/list': {
            get: {
                summary: 'Get all categories',
                tags: ['Categories'],
                responses: {
                    200: {
                        description: 'List of categories',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Category',
                                    },
                                },
                            },
                        },
                    },
                    500: {
                        description: 'Internal server error',
                    },
                },
            },
        },
        '/categories/{id}': {
            delete: {
                summary: 'Delete a category',
                tags: ['Categories'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        description: 'ID of the category to delete',
                        schema: {
                            type: 'string',
                        },
                    },
                ],
                responses: {
                    204: {
                        description: 'Category deleted successfully',
                    },
                    404: {
                        description: 'Category not found',
                    },
                    500: {
                        description: 'Internal server error',
                    },
                },
            },
        },
    },
};
const options = {
    swaggerDefinition,
    apis: [
        './dist/Routers/UserRouter.js',
        './dist/Routers/CategoryRoutes.js',
        './dist/Routers/ProductRout.js',
    ],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
