import nodemailer from "nodemailer";

// i am creating a nodemailer transport for sending emails
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  secure: process.env.EMAIL_SERVER_SECURE === "true",
});

// i am defining the types for email sending
export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

// i am creating a function to send emails
export const sendEmail = async (payload: EmailPayload) => {
  const { to, subject, html } = payload;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

// i am creating a function to send verification emails
export const sendVerificationEmail = async (
  to: string,
  token: string,
  url: string,
  name?: string
) => {
  const verificationUrl = `${url}?token=${token}`;

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify your email address</h2>
      <p>Hello ${name || "there"},</p>
      <p>Please click the button below to verify your email address:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Verify Email
        </a>
      </div>
      <p>Or copy and paste this URL into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this email, please ignore it.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: "Verify your email address",
    html: emailContent,
  });
};

// i am creating a function to send password reset emails
export const sendPasswordResetEmail = async (
  to: string,
  token: string,
  url: string,
  name?: string
) => {
  const resetUrl = `${url}?token=${token}`;

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset your password</h2>
      <p>Hello ${name || "there"},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p>Or copy and paste this URL into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this password reset, please ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: "Reset your password",
    html: emailContent,
  });
};
