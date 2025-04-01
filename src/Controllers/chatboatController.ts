import { Request, Response } from "express"; 
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);

export async function chatboat(req: Request, res: Response) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const userInput = req.body.message ;

        const result = await model.generateContent(userInput);
        const response = await result.response.text();

        
        return res.status(200).json({ reply: response });

    } catch (error) {
        console.error("Error using model:", error);
        return res.status(500).json({ error: "Failed to generate response" });
    }
}
