"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistSwagger = void 0;
exports.WishlistSwagger = {
    paths: {
        "/wishlist/add": {
            post: {
                summary: "Add a product to wishlist",
                description: "Adds a product to the user's wishlist. Stores products in an array (like cart).",
                tags: ["Wishlist"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    productId: {
                                        type: "string",
                                        example: "68075513ca8f3ddc86fe71c8",
                                    },
                                },
                                required: ["productId"],
                            },
                        },
                    },
                },
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "userId",
                        in: "header",
                        required: true,
                        schema: {
                            type: "string",
                            example: "67ff37e09998642e0f4c7431",
                        },
                    },
                ],
                responses: {
                    201: {
                        description: "Product added to wishlist",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string", example: "Added to wishlist" },
                                        wishlist: {
                                            type: "object",
                                            properties: {
                                                userId: { type: "string" },
                                                products: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            productId: { type: "string" },
                                                            quantity: { type: "number" },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/wishlist/{userId}": {
            get: {
                summary: "Get Wishlist",
                description: "Fetch all wishlist items for a specific user.",
                tags: ["Wishlist"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "userId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                            example: "67ff37e09998642e0f4c7431",
                        },
                    },
                ],
                responses: {
                    200: {
                        description: "List of wishlist items",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            productId: {
                                                type: "object",
                                                properties: {
                                                    _id: { type: "string" },
                                                    title: { type: "string" },
                                                    price: { type: "number" },
                                                    image: { type: "string" },
                                                },
                                            },
                                            quantity: { type: "number", example: 1 },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/wishlist/remove/{productId}": {
            delete: {
                summary: "Remove Product from Wishlist",
                description: "Remove a specific product from the user's wishlist.",
                tags: ["Wishlist"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "productId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                            example: "68075513ca8f3ddc86fe71c8",
                        },
                    },
                    {
                        name: "userId",
                        in: "header",
                        required: true,
                        schema: {
                            type: "string",
                            example: "67ff37e09998642e0f4c7431",
                        },
                    },
                ],
                responses: {
                    200: {
                        description: "Product removed from wishlist",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Product removed from wishlist",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    404: {
                        description: "Product not in wishlist",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string", example: "Product not in wishlist" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
