export const productSwagger = {
  "/products/create": {
    post: {
      summary: "Create a product",
      tags: ["Products"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                category: { type: "string", example: "Electronics" },
                title: { type: "string", example: "Smartphone" },
                description: { type: "string", example: "Latest model with AI features" },
                price: { type: "number", example: 999.99 },
                salePrice: { type: "number", example: 899.99 },
                discount: { type: "number", example: 10 },
                quantity: { type: "integer", example: 50 },
                colors: {
                  type: "array",
                  items: { type: "string" },
                  collectionFormat: "multi",
                  example: ["Black", "Blue", "Red"],
                },
                image: { type: "string", format: "binary" },
              },
              required: ["category", "title", "description", "price", "quantity", "colors"],
            },
          },
        },
      },
      responses: {
        201: { description: "Product created successfully" },
        400: { description: "Missing required fields" },
        500: { description: "Server error" },
      },
    },
  },
  "/products": {
    get: {
      summary: "Get all products",
      tags: ["Products"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "List of products" },
        500: { description: "Server error" },
      },
    },
  },
  "/products/update/{id}": {
    put: {
      summary: "Update a product",
      tags: ["Products"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                category: { type: "string", example: "Electronics" },
                title: { type: "string", example: "Smartphone" },
                description: { type: "string", example: "Updated model" },
                price: { type: "number", example: 999.99 },
                salePrice: { type: "number", example: 899.99 },
                discount: { type: "number", example: 10 },
                quantity: { type: "integer", example: 50 },
                colors: {
                  type: "array",
                  items: { type: "string" },
                  collectionFormat: "multi",
                  example: ["Black", "Blue"],
                },
                image: { type: "string", format: "binary" }, // Allows image upload
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Product updated successfully" },
        404: { description: "Product not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/products/{id}": {
    delete: {
      summary: "Delete a product",
      tags: ["Products"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Product deleted successfully" },
        404: { description: "Product not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/products/category/{categoryName}": {
    get: {
      summary: "Get products by category name",
      description: "Fetch all products that belong to a specific category.",
      tags: ["Products"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "categoryName",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "The name of the category to search for.",
        },
      ],
      responses: {
        200: {
          description: "List of products in the category",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Products in category: Electronics" },
                  products: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        _id: { type: "string", example: "65f03a1b3e2d6c001fbd8a1a" },
                        title: { type: "string", example: "Smartphone" },
                        description: { type: "string", example: "Latest AI-powered smartphone" },
                        price: { type: "number", example: 999.99 },
                        salePrice: { type: "number", example: 899.99 },
                        discount: { type: "number", example: 10 },
                        quantity: { type: "integer", example: 50 },
                        colors: {
                          type: "array",
                          items: { type: "string" },
                          example: ["Black", "Blue", "Red"],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        404: { description: "Category not found" },
        500: { description: "Server error" },
      },
    },
  },
};
