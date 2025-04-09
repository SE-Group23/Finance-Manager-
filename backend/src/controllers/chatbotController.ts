// backend/src/controllers/chatbotController.ts
import { Request, Response } from 'express';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * UC‑9 – AI Chatbot Interaction
 * This endpoint accepts a user’s finance-related query, constructs a prompt (including a brief context),
 * calls the OpenAI API (using the free gpt-3.5-turbo model), and returns a personalized response.
 */
export async function getChatbotResponse(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).userId; // Already set by requireAuth middleware
        const { message } = req.body;
        if (!message) {
            res.status(400).json({ error: 'Message is required.' });
            return;
        }

        // For the first release, we use a simple context.
        // In a full implementation, we will use user analytics for a richer prompt.
        const prompt = `You are a financial assistant for a Pakistani user. The user asked: "${message}".
        Provide clear and concise financial advice tailored for the Pakistani market.`;

        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);

        const completion = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo', // Using the free available model
            messages: [{ role: 'user', content: prompt }],
        });

        const chatbotResponse = completion.data.choices[0].message?.content || 'No response generated.';
        res.json({ response: chatbotResponse });
        return;
    } catch (error: any) {
        console.error('Error in chatbot controller:', error.response?.data || error);
        res.status(500).json({ error: 'Error fetching chatbot response. Please try again later.' });
        return;
    }
}
