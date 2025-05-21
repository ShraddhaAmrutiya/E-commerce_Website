export const ChatboatSwagger = {
    paths: {
        "/chatbot": { 
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
                                required: ["message"], 
                            },
                        },
                    },
                },
                responses: {},
            },
        },
    },
};
