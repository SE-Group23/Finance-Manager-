// import nodemailer from "nodemailer";

// export const sendPasswordResetEmail = async (to: string, url: string) => {
//     const transporter = nodemailer.createTransport({
//         host: 'smtp.gmail.com',
//         port: 587,
//         secure: false, // false means STARTTLS will be used
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.EMAIL_PASS,
//         },
//         tls: {
//           rejectUnauthorized: false, // This line is optional but can help during dev
//         },
//       });

//   await transporter.sendMail({
//     from: '"TBD Support Team" <support@tbd.com>',
//     to,
//     subject: "Password Reset",
//     html: `<p>Hello there! You requested a password reset. Click <a href="${url}">here</a> to reset it.</p>`,
//   });
// };

import nodemailer from "nodemailer";

// Existing password reset email function
export const sendPasswordResetEmail = async (to: string, url: string) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // false means STARTTLS will be used
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false, // This line is optional but can help during dev
        },
      });

  await transporter.sendMail({
    from: '"TBD Support Team" <support@tbd.com>',
    to,
    subject: "Password Reset",
    html: `<p>Hello there! You requested a password reset. Click <a href="${url}">here</a> to reset it.</p>`,
  });
};

// New function for contact form email
export const sendContactFormEmail = async (
  name: string,
  email: string,
  subject: string,
  message: string
) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.sendMail({
    from: '"TBD Contact Form" <support@tbd.com>',
    to: "seproject23@gmail.com",
    subject: `Contact Form: ${subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
    replyTo: email, // This allows you to reply directly to the sender
  });
};