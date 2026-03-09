import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to backend ledger!";
  const text = `Hello ${name},\n\nThank you for registering at Backend Ledger.
We're excited to have you on board!\n\nBest regards,\nThe Backend Ledger Team`;

  const html = `
    <p>Hello ${name},</p>
    <p>Thank you for registering at Backend Ledger. We're excited to have you on board!</p>
    <p>Best regards,<br>The Backend Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

export async function sendTransactionEmail(userEmail , name, amount , toAccount){
  const subject = "Transaction Alert from backend ledger!";
  const text = `Hello ${name},\n\nYou have received a transaction of amount ${amount} to your account ${toAccount}.
Please check your account for more details.\n\nBest regards,\nThe Backend Ledger Team`;

  const html = `
    <p>Hello ${name},</p>
    <p>You have received a transaction of amount ${amount} to your account ${toAccount}. Please check your account for more details.</p>
    <p>Best regards,<br>The Backend Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

export async function sendtransactionFailureEmail(userEmail , name, amount , toAccount){
  const subject = "Transaction Failure Alert from backend ledger!";
  const text = `Hello ${name},\n\nWe regret to inform you that a transaction of amount ${amount} to your account ${toAccount} has failed.
Please check your account for more details or contact support.\n\nBest regards,\nThe Backend Ledger Team`;

  const html = `
    <p>Hello ${name},</p>
    <p>We regret to inform you that a transaction of amount ${amount} to your account ${toAccount} has failed. Please check your account for more details or contact support.</p>
    <p>Best regards,<br>The Backend Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}