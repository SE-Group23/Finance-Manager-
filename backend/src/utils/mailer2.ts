// src/utils/mailer.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER, // your Gmail or custom email
    pass: process.env.EMAIL_PASS, // app password or real password (never push this!)
  },
});

export const sendContactFormEmail = async (
  name: string,
  email: string,
  subject: string,
  message: string
) => {
  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.CONTACT_RECEIVER_EMAIL, // where you want to receive the form
    subject: `[Contact Form] ${subject}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong><br>${message}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
