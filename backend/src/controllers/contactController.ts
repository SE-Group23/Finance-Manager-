// src/controllers/contactController.ts
import { Request, Response, RequestHandler } from 'express';
import { sendContactFormEmail } from '../utils/mailer';

// Explicitly typing it as RequestHandler
export const submitContactForm: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({ message: 'All fields are required' });
      return; // Explicitly return here
    }

    await sendContactFormEmail(name, email, subject, message);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email Error:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
};
