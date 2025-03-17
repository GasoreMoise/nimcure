import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});

export async function sendVerificationEmail({ email, token }: { email: string; token: string }) {
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify your email address',
      html: `
        <h1>Welcome to Nimcure</h1>
        <p>Click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `
    });
  } catch (error) {
    console.error('Email sending error:', error);
    // Don't throw the error to prevent registration failure
    // but log it for debugging
  }
}

export async function sendPasswordResetEmail({ email, token }: { email: string; token: string }) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset your password',
    html: `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `
  });
}

export async function sendEmail({ to, subject, html }: { 
  to: string; 
  subject: string; 
  html: string; 
}) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html
  });
} 