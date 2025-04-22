
export const orderSwagger = {
  "/order/cart/{userId}": {
    post: {
      summary: "Place an order from the cart",
      tags: ["Orders"],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: {
            type: "string",
            example: "60d5f7e1f5f47a6f68418f9e"
          }
        }
      ],
      responses: {
        201: {
          description: "Order placed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Order placed successfully" },
                  order: {
                    type: "object",
                    properties: {
                      userId: { type: "string", example: "60d5f7e1f5f47a6f68418f9e" },
                      totalPrice: { type: "number", example: 150 },
                      status: { type: "string", example: "Pending" },
                      products: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            productId: { type: "string", example: "60c72b1f9f1b2c1f4c4f5a6f" },
                            quantity: { type: "number", example: 1 }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: "Cart is empty or invalid user ID"
        },
        404: {
          description: "Cart not found"
        },
        500: {
          description: "Internal server error"
        }
      }
    }
  },
  "/order/direct": {
    post: {
      summary: "Place a direct order without adding to cart",
      tags: ["Orders"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                userId: { type: "string", example: "60d5f7e1f5f47a6f68418f9e" },
                productId: { type: "string", example: "60c72b1f9f1b2c1f4c4f5a6f" },
                stock: { type: "number", example: 1 }
              },
              required: ["userId", "productId", "stock"]
            }
          }
        }
      },
      responses: {
        201: {
          description: "Direct order placed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Direct order placed successfully" },
                  order: {
                    type: "object",
                    properties: {
                      userId: { type: "string", example: "60d5f7e1f5f47a6f68418f9e" },
                      totalPrice: { type: "number", example: 50 },
                      status: { type: "string", example: "Pending" },
                      products: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            productId: { type: "string", example: "60c72b1f9f1b2c1f4c4f5a6f" },
                            quantity: { type: "number", example: 1 }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: "Insufficient stock or invalid data"
        },
        404: {
          description: "User or product not found"
        },
        500: {
          description: "Internal server error"
        }
      }
    }
  },
  "/order/{userId}": {
    post: {
      summary: "Get all orders by a user",
      tags: ["Orders"],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: {
            type: "string",
            example: "60d5f7e1f5f47a6f68418f9e"
          }
        }
      ],
      responses: {
        200: {
          description: "Orders retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Orders retrieved successfully" },
                  orders: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        userId: { type: "string", example: "60d5f7e1f5f47a6f68418f9e" },
                        totalPrice: { type: "number", example: 150 },
                        status: { type: "string", example: "Pending" },
                        products: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              productId: { type: "string", example: "60c72b1f9f1b2c1f4c4f5a6f" },
                              quantity: { type: "number", example: 1 }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        404: {
          description: "No orders found for the user"
        },
        500: {
          description: "Internal server error"
        }
      }
    }
  },
  "/order/redirect/{userId}": {
    get: {
      summary: "Redirect user to past orders",
      tags: ["Orders"],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: {
            type: "string",
            example: "60d5f7e1f5f47a6f68418f9e"
          }
        }
      ],
      responses: {
        200: {
          description: "Redirect URL provided",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Past orders found" },
                  redirectUrl: { type: "string", example: "/orders/60d5f7e1f5f47a6f68418f9e" }
                }
              }
            }
          }
        },
        404: {
          description: "No past orders found"
        },
        500: {
          description: "Internal server error"
        }
      }
    }
  }
};
