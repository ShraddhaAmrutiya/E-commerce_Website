export const orderSwagger = {
    paths: {
      "/orders/cart/{userId}": {
        post: {
          summary: "Place an order from the cart",
          description: "Moves all products from the cart to an order.",
          tags: ["Orders"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "userId",
              required: true,
              schema: { type: "string" },
              description: "ID of the user placing the order",
            },
          ],
          responses: {
            201: {
              description: "Order placed successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      order: {
                        type: "object",
                        properties: {
                          userId: { type: "string" },
                          products: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                productId: { type: "string" },
                                quantity: { type: "integer" },
                              },
                            },
                          },
                          totalPrice: { type: "number" },
                          status: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "Cart is empty" },
            500: { description: "Internal Server Error" },
          },
        },
      },
      "/orders/direct": {
        post: {
          summary: "Place a direct order",
          description: "Allows users to order a product directly without adding it to the cart.",
          tags: ["Orders"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    userId: { type: "string" },
                    productId: { type: "string" },
                    quantity: { type: "integer" },
                  },
                  required: ["userId", "productId", "quantity"],
                },
              },
            },
          },
          responses: {
            201: {
              description: "Direct order placed successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      order: {
                        type: "object",
                        properties: {
                          userId: { type: "string" },
                          products: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                productId: { type: "string" },
                                quantity: { type: "integer" },
                              },
                            },
                          },
                          totalPrice: { type: "number" },
                          status: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            404: { description: "Product not found" },
            500: { description: "Internal Server Error" },
          },
        },
      },
      "/orders/{orderId}": {
        get: {
          summary: "Get Order by ID",
          description: "Fetch an order by its unique ID.",
          tags: ["Orders"],
          parameters: [
            {
              in: "path",
              name: "orderId",
              required: true,
              schema: { type: "string" },
              description: "The unique identifier of the order.",
            },
          ],
          responses: {
            200: {
              description: "Order retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      order: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          userId: { type: "string" },
                          products: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                productId: { type: "string" },
                                quantity: { type: "integer" },
                              },
                            },
                          },
                          totalPrice: { type: "number" },
                          status: { type: "string" },
                          createdAt: { type: "string", format: "date-time" },
                          updatedAt: { type: "string", format: "date-time" },
                        },
                      },
                    },
                  },
                },
              },
            },
            404: { description: "Order not found" },
            500: { description: "Internal Server Error" },
          },
        },
      },
    },
  };
  