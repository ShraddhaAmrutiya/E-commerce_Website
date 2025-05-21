export const cartSwagger = {
    tags: [
      {
        name: "Cart",
        description: "Cart management",
      },
    ],
    paths: {
     '/cart/{userId}': {
        get: {
            summary: 'Get cart details for a user',
            tags: ['Cart'],
            security: [{ bearerAuth: [] }],
            parameters: [
            {
                name: 'userId',
                in: 'path',
                required: true,
                description: 'ID of the user',
                schema: {
                type: 'string',
                },
            },
            ],
            responses: {
            200: {
                description: 'Cart details retrieved successfully',
            },
            404: {
                description: 'Cart is empty or not found',
            },
            500: {
                description: 'Internal server error',
            },
            },
        },
        delete: {
            summary: 'Clear the entire cart',
            tags: ['Cart'],
            security: [{ bearerAuth: [] }],
            parameters: [
            {
                name: 'userId',
                in: 'path',
                required: true,
                description: 'ID of the user',
                schema: {
                type: 'string',
                },
            },
            ],
            responses: {
            200: {
                description: 'Cart cleared successfully',
            },
            500: {
                description: 'Internal server error',
            },
            },
        },
        },

    '/cart': {
    put: {
        summary: 'Update product quantity in cart',
        tags: ['Cart'],
        security: [{ bearerAuth: [] }],
        requestBody: {
        required: true,
        content: {
            'application/json': {
            schema: {
                type: 'object',
                properties: {
                userId: {
                    type: 'string',
                    example: '1234567890',
                },
                productId: {
                    type: 'string',
                    example: 'abcdef12345',
                },
                quantity: {
                    type: 'number',
                    example: 2,
                },
                },
                required: ['userId', 'productId', 'quantity'],
            },
            },
        },
        },
        responses: {
        200: {
            description: 'Product quantity updated in cart',
        },
        400: {
            description: 'Cart not found',
        },
        404: {
            description: 'Product not found in cart',
        },
        500: {
            description: 'Internal server error',
        },
        },
    },

    delete: {
        summary: 'Remove a product from cart',
        tags: ['Cart'],
        security: [{ bearerAuth: [] }],
        requestBody: {
        required: true,
        content: {
            'application/json': {
            schema: {
                type: 'object',
                properties: {
                userId: {
                    type: 'string',
                    example: '1234567890',
                },
                productId: {
                    type: 'string',
                    example: 'abcdef12345',
                },
                },
                required: ['userId', 'productId'],
            },
            },
        },
        },
        responses: {
        200: {
            description: 'Product removed from cart',
        },
        400: {
            description: 'Cart not found',
        },
        404: {
            description: 'Product not found in cart',
        },
        500: {
            description: 'Internal server error',
        },
        },
    },
    },
    "/cart/increase":{
        put: {
            summary: 'increase product in cart ',
            tags: ['Cart'],
            security: [{ bearerAuth: [] }],
            requestBody: {
            required: true,
            content: {
                'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                    userId: {
                        type: 'string',
                        example: '1234567890',
                    },
                    productId: {
                        type: 'string',
                        example: 'abcdef12345',
                    },
                    
                    },
                    required: ['userId', 'productId'],
                },
                },
            },
            },
            responses: {
            200: {
                description: 'Product quantity updated in cart',
            },
            400: {
                description: 'Cart not found',
            },
            404: {
                description: 'Product not found in cart',
            },
            500: {
                description: 'Internal server error',
            },
            },
        },
    },
    "/cart/decrease":{
        put: {
            summary: 'decrease product in cart ',
            tags: ['Cart'],
            security: [{ bearerAuth: [] }],
            requestBody: {
            required: true,
            content: {
                'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                    userId: {
                        type: 'string',
                        example: '1234567890',
                    },
                    productId: {
                        type: 'string',
                        example: 'abcdef12345',
                    },
                    
                    },
                    required: ['userId', 'productId'],
                },
                },
            },
            },
            responses: {
            200: {
                description: 'Product quantity updated in cart',
            },
            400: {
                description: 'Cart not found',
            },
            404: {
                description: 'Product not found in cart',
            },
            500: {
                description: 'Internal server error',
            },
            },
        },
    },

    },
  };
  