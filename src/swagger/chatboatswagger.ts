export const ChatboatSwagger = {
    paths: {
        "/chatbot": {  // Removed trailing slash
            post: {
                summary: "Chat with AI",
                description: "Send a message to Gemini AI and receive a response.",
                tags: ["Chatbot"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Hello, how are you?",
                                    },
                                },
                                required: ["message"], // Ensure message is required
                            },
                        },
                    },
                },
                responses: {},
            },
        },
    },
};
