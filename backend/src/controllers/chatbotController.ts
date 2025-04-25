import { Request, Response } from 'express';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export async function getChatbotResponse(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).userId; 
        const { message } = req.body;
        if (!message) {
            res.status(400).json({ error: 'Message is required.' });
            return;
        }

        const prompt = `You are a financial assistant for a Pakistani user. The user asked: "${message}".
        Provide clear and concise financial advice tailored for the Pakistani market.`;

        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);

        const completion = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        });

        const chatbotResponse = completion.data.choices[0].message?.content || 'No response generated.';
        res.json({ response: chatbotResponse });
        return;
    } catch (error: any) {
        res.status(500).json({ error: 'Error fetching chatbot response. Please try again later.' });
        return;
    }
}
