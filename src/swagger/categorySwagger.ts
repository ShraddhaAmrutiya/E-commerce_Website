export const categorySwagger = {
    "/category/add": {
      post: {
        summary: "Create a new category",
        tags: ["Category"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Electronics" },
                  description: { type: "string", example: "Category for electronic products" }
                },
                required: ["name"]
              }
            }
          }
        },
        responses: {
          201: { description: "Category created successfully" },
          400: { description: "Category name is required" },
          500: { description: "Server error" }
        }
      }
    },
    "/category/list": {
      get: {
        summary: "Get all categories",
        tags: ["Category"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "List of categories" },
          500: { description: "Server error" }
        }
      }
    },
    "/category/{id}": {
      get: {
        summary: "Get category by ID",
        tags: ["Category"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: { description: "Category details" },
          404: { description: "Category not found" },
          500: { description: "Server error" }
        }
      },},
 "/category/update/{id}":{
  put: {
    summary: "Update a category",
    tags: ["Category"],
    security: [{ bearerAuth: [] }],

    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" }
      }
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string", example: "Updated Electronics" },
              description: { type: "string", example: "Updated description" }
            }
          }
        }
      }
    },
    responses: {
      200: { description: "Category updated successfully" },
      404: { description: "Category not found" },
      500: { description: "Server error" }
    }
  },
 },
 "/category/delete/{id}":{  delete: {
  summary: "Delete a category",
  tags: ["Category"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string" }
    }
  ],
  responses: {
    200: { description: "Category deleted successfully" },
    404: { description: "Category not found" },
    500: { description: "Server error" }
  }
}}
  };
  