import { Request, Response } from 'express';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
import { pool } from '../db';

dotenv.config();

export async function getChatbotResponse(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId as number;
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const assetsResult = await pool.query(
      `SELECT COALESCE(SUM(current_value),0) AS total_assets
         FROM assets
        WHERE user_id = $1`,
      [userId]
    );
    const totalAssets = assetsResult.rows[0].total_assets;

    const spentResult = await pool.query(
      `SELECT COALESCE(SUM(amount),0) AS spent
         FROM transactions
        WHERE user_id = $1
          AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', NOW())`,
      [userId]
    );
    const spentThisMonth = spentResult.rows[0].spent;


    const systemPrompt = `
You are a financial assistant for a Pakistani user. Here is their current profile:
• Total assets (current value): ${totalAssets}
• Spent this month: ${spentThisMonth}

The user just asked:
"${message}"

Please provide clear, concise, and personalized financial advice tailored to their situation and the Pakistani market.
`.trim();

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

   

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    });

    const chatbotResponse =
      completion.data.choices[0].message?.content ||
      'No response generated.';
    res.json({ response: chatbotResponse });
  } catch (error: any) {
    console.error('getChatbotResponse error', error);
    res
      .status(500)
      .json({ error: 'Error fetching chatbot response. Please try again.' });
  }
}