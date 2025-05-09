export const productSwagger = {
  "/products/create": {
    post: {
      summary: "Create a new product",
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
                discountPercentage: { type: "number", example: 10 },
                stock: { type: "integer", example: 50 },
                brand: { type: "string", example: "Apple" },
                rating: { type: "number", example: 4.5 },
                image: {
                  type: "array",
                  items: { type: "string", format: "binary" },
                },
              },
              required: ["category", "title", "price"],
            },
          },
        },
      },
      responses: {
        201: { description: "Product created successfully" },
        400: { description: "Bad request - missing required fields or invalid data" },
        500: { description: "Internal server error" },
      },
    },
  },

  "/products/all": {
    get: {
      summary: "Retrieve all products grouped by category",
      tags: ["Products"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "limit",
          in: "query",
          required: false,
          schema: { type: "integer", default: 10 },
        },
      ],
      responses: {
        200: { description: "List of products" },
        500: { description: "Internal server error" },
      },
    },
  },

  "/products/update/{id}": {
    put: {
      summary: "Update a product by ID",
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
                categoryId: { type: "string", example: "65c12345678" },
                title: { type: "string", example: "Updated Smartphone" },
                description: { type: "string", example: "Now with more features" },
                price: { type: "number", example: 1099.99 },
                salePrice: { type: "number", example: 999.99 },
                discountPercentage: { type: "number", example: 10 },
                stock: { type: "integer", example: 45 },
                brand: { type: "string", example: "Samsung" },
                rating: { type: "number", example: 4.6 },
                image: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Product updated successfully" },
        403: { description: "Unauthorized to update this product" },
        404: { description: "Product not found" },
        500: { description: "Internal server error" },
      },
    },
  },

  "/products/delete/{id}": {
    delete: {
      summary: "Delete a product by ID",
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
        403: { description: "Unauthorized to delete this product" },
        404: { description: "Product not found" },
        500: { description: "Internal server error" },
      },
    },
  },

  "/category/products/{id}": {
    get: {
      summary: "Get products by category ID",
      tags: ["Category"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Category ID",
        },
      ],
      responses: {
        200: {
          description: "Products in the specified category",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  category: { type: "string" },
                  products: {
                    type: "array",
                    items: { type: "object" },
                  },
                },
              },
            },
          },
        },
        404: { description: "Category not found" },
        500: { description: "Internal server error" },
      },
    },
  },

  "/products/{id}": {
    get: {
      summary: "Get a single product by ID",
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
        200: {
          description: "Product fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  product: { type: "object" },
                  isInWishlist: { type: "boolean" },
                },
              },
            },
          },
        },
        404: { description: "Product not found" },
        500: { description: "Internal server error" },
      },
    },
  },

  "/category/products/name/{categoryname}": {
    get: {
      summary: "Get products by category name",
      tags: ["Category"],
      parameters: [
        {
          name: "categoryname",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "List of products in the given category name",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  products: {
                    type: "array",
                    items: { type: "object" },
                  },
                },
              },
            },
          },
        },
        404: { description: "No products or category found" },
        500: { description: "Internal server error" },
      },
    },
  },

  "/products/search": {
    get: {
      summary: "Search products by title",
      tags: ["Products"],
      parameters: [
        {
          name: "q",
          in: "query",
          required: true,
          schema: { type: "string" },
          description: "Search keyword",
        },
      ],
      responses: {
        200: {
          description: "Search results",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { type: "object" },
              },
            },
          },
        },
        500: { description: "Internal server error" },
      },
    },
  },
};
