// test-email.js
const nodemailer = require("nodemailer");
require("dotenv").config();  // load .env variables if you use dotenv

// Create transporter with your env vars
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,  // your Gmail address
    pass: process.env.EMAIL_PASS,  // your Gmail app password
  },
});

async function sendTestEmail() {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "your-email@example.com",  // replace with your test recipient email
      subject: "Test Email from CardioCare",
      html: "<p>This is a test email sent to check your email config!</p>",
    });
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

sendTestEmail();
