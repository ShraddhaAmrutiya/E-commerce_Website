"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatboat = chatboat;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.OPENAI_API_KEY);
async function chatboat(req, res) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const userInput = req.body.message;
        const result = await model.generateContent(userInput);
        const response = await result.response.text();
        return res.status(200).json({ reply: response });
    }
    catch (error) {
        console.error("Error using model:", error);
        return res.status(500).json({ error: "Failed to generate response" });
    }
}
