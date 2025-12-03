import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;
const FROM_NAME = process.env.FROM_NAME || 'Sabse Sasta';

let transporter: nodemailer.Transporter | null = null;

const initializeTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });

  return transporter;
};

export class EmailService {
  static async sendPasswordResetEmail(
    to: string,
    resetLink: string,
    userName?: string
  ): Promise<boolean> {
    try {
      const transport = initializeTransporter();

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #00c151 0%, #00a640 100%); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">Sabse Sasta</h1>
            <p style="margin: 5px 0 0 0;">Price Comparison Platform</p>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <p>Hello ${userName || 'User'},</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #00c151; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 3px;">
              ${resetLink}
            </p>
            <p style="color: #666; font-size: 12px;">This link will expire in 1 hour.</p>
            <p style="color: #999; font-size: 11px;">If you didn't request a password reset, please ignore this email. Your account is safe.</p>
          </div>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 11px; color: #666;">
            <p>&copy; ${new Date().getFullYear()} Sabse Sasta. All rights reserved.</p>
          </div>
        </div>
      `;

      const result = await transport.sendMail({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to,
        subject: 'Password Reset Request - Sabse Sasta',
        html: htmlContent,
        text: `Password reset link: ${resetLink}\n\nThis link will expire in 1 hour.`,
      });

      console.log(`Password reset email sent to ${to}:`, result.messageId);
      return true;
    } catch (error: any) {
      console.error('Error sending reset email:', error.message);
      // In production, you might want to log this to an error tracking service
      // For now, we'll return false but not throw to avoid breaking the flow
      return false;
    }
  }

  static async sendWelcomeEmail(to: string, userName?: string): Promise<boolean> {
    try {
      const transport = initializeTransporter();

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #00c151 0%, #00a640 100%); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">Sabse Sasta</h1>
            <p style="margin: 5px 0 0 0;">Price Comparison Platform</p>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <p>Welcome to Sabse Sasta, ${userName || 'User'}!</p>
            <p>Your account has been successfully created. You can now start comparing prices and saving money on your favorite products.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://sabsesasta.com" style="background-color: #00c151; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Get Started
              </a>
            </div>
            <p style="color: #666; font-size: 12px;">If you have any questions, feel free to reach out to our support team.</p>
          </div>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 11px; color: #666;">
            <p>&copy; ${new Date().getFullYear()} Sabse Sasta. All rights reserved.</p>
          </div>
        </div>
      `;

      const result = await transport.sendMail({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to,
        subject: 'Welcome to Sabse Sasta',
        html: htmlContent,
        text: 'Welcome to Sabse Sasta! You can now start comparing prices.',
      });

      console.log(`Welcome email sent to ${to}:`, result.messageId);
      return true;
    } catch (error: any) {
      console.error('Error sending welcome email:', error.message);
      return false;
    }
  }
}
