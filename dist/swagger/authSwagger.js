"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSwagger = void 0;
exports.userSwagger = {
    "/users/register": {
        post: {
            summary: "Register a new user",
            tags: ["Users"],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                username: { type: "string", example: "johndoe" },
                                email: { type: "string", example: "johndoe@example.com" },
                                password: { type: "string", example: "password123" },
                                Role: { type: "string", example: "user" }
                            },
                            required: ["username ", "email", "password"]
                        }
                    }
                }
            },
            responses: {
                201: { description: "User registered successfully" },
                400: { description: "User already exists or missing fields" },
                500: { description: "Server error" }
            }
        }
    },
    "/users/login": {
        post: {
            summary: "User login",
            tags: ["Users"],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                userName: { type: "string", example: "johndoe" },
                                password: { type: "string", example: "password123" }
                            },
                            required: ["username ", "password"]
                        }
                    }
                }
            },
            responses: {
                200: { description: "User logged in successfully" },
                400: { description: "Missing fields" },
                401: { description: "Invalid credentials" },
                500: { description: "Server error" }
            }
        }
    },
    "/users/forgot-password": {
        post: {
            summary: "Request password reset",
            tags: ["Users"],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                email: { type: "string", example: "johndoe@example.com" }
                            },
                            required: ["email"]
                        }
                    }
                }
            },
            responses: {
                200: { description: "Reset token sent to email" },
                400: { description: "Email is required" },
                404: { description: "User not found" },
                500: { description: "Server error" }
            }
        }
    },
    "/users/reset-password": {
        post: {
            summary: "Reset user password",
            tags: ["Users"],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                resetToken: { type: "string", example: "abcdef123456" },
                                newPassword: { type: "string", example: "newpassword123" }
                            },
                            required: ["resetToken", "newPassword"]
                        }
                    }
                }
            },
            responses: {
                200: { description: "Password reset successfully" },
                400: { description: "Missing fields" },
                401: { description: "Invalid or expired reset token" },
                500: { description: "Server error" }
            }
        }
    },
    "/users/reset-passwordwitholdpassword": {
        post: {
            summary: "Reset user password with old password",
            tags: ["Users"],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                oldPassword: { type: "string", example: "abcdef123456" },
                                newPassword: { type: "string", example: "newpassword123" },
                                username: { type: "string", example: "johndoe" }
                            },
                            required: ["oldPassword", "newPassword", "username "]
                        }
                    }
                }
            },
            responses: {
                200: { description: "Password reset successfully" },
                400: { description: "Missing fields" },
                401: { description: "Invalid or expired reset token" },
                500: { description: "Server error" }
            }
        }
    },
    "/users/logout": {
        post: {
            summary: "Logout user",
            tags: ["Users"],
            responses: {
                200: { description: "User logged out successfully" }
            }
        }
    },
    "/users/{id}": {
        get: {
            summary: "Get user by ID",
            tags: ["Users"],
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
                200: { description: "User details retrieved successfully" },
                404: { description: "User not found" },
                500: { description: "Server error" }
            }
        }
    },
    "/users": {
        get: {
            summary: "Get all users",
            tags: ["Users"],
            security: [{ bearerAuth: [] }],
            responses: {
                200: { description: "List of users retrieved successfully" },
                500: { description: "Server error" }
            }
        }
    }
};
