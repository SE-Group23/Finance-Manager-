import { Request, Response } from 'express';
import { sendContactFormEmail } from '../utils/mailer';
import { RequestHandler } from 'react-router-dom';

export const submitContactForm = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Send email
    await sendContactFormEmail(name, email, subject, message);

    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return res.status(500).json({ message: 'Failed to send email' });
  }
};