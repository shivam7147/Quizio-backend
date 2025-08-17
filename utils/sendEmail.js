import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(to, token) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: 'Verify your email for Quizio',
    html: `<h2>Your Email Verification Code</h2><p>Use the following code to verify your email and complete registration:</p><div style="font-size:1.5em;font-weight:bold;letter-spacing:2px;margin:16px 0;">${token}</div>`
  };
  return transporter.sendMail(mailOptions);
}
