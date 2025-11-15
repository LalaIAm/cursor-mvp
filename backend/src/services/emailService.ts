import { config } from '../config';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Email service interface
 * 
 * This is a basic implementation that logs emails in development.
 * In production, replace this with your actual email provider (SendGrid, AWS SES, etc.)
 * 
 * Environment variables needed:
 * - EMAIL_PROVIDER: 'console' | 'sendgrid' | 'ses' | etc.
 * - EMAIL_FROM: sender email address
 * - FRONTEND_URL: frontend URL for reset links
 * - SENDGRID_API_KEY (if using SendGrid)
 * - AWS_SES_REGION, AWS_SES_ACCESS_KEY, AWS_SES_SECRET_KEY (if using AWS SES)
 */
class EmailService {
  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    const provider = config.email.provider;

    try {
      switch (provider) {
        case 'console':
          return this.sendViaConsole(options);
        case 'sendgrid':
          return this.sendViaSendGrid(options);
        case 'ses':
          return this.sendViaSES(options);
        default:
          console.warn(`[WARN] Unknown email provider: ${provider}, using console`);
          return this.sendViaConsole(options);
      }
    } catch (error: any) {
      console.error('[ERROR] Email send failed:', {
        to: options.to,
        subject: options.subject,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });

      return {
        success: false,
        error: error.message || 'Email send failed',
      };
    }
  }

  /**
   * Console email (development only)
   */
  private async sendViaConsole(options: EmailOptions): Promise<EmailResult> {
    console.log('[EMAIL]', {
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return {
      success: true,
      messageId: `console-${Date.now()}`,
    };
  }

  /**
   * SendGrid email (TODO: implement when SendGrid is configured)
   */
  private async sendViaSendGrid(options: EmailOptions): Promise<EmailResult> {
    // TODO: Implement SendGrid integration
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(config.email.sendgridApiKey);
    // const msg = {
    //   to: options.to,
    //   from: config.email.from,
    //   subject: options.subject,
    //   html: options.html,
    //   text: options.text,
    // };
    // const result = await sgMail.send(msg);
    // return { success: true, messageId: result[0].headers['x-message-id'] };

    console.warn('[WARN] SendGrid not implemented, falling back to console');
    return this.sendViaConsole(options);
  }

  /**
   * AWS SES email (TODO: implement when SES is configured)
   */
  private async sendViaSES(options: EmailOptions): Promise<EmailResult> {
    // TODO: Implement AWS SES integration
    // const AWS = require('aws-sdk');
    // const ses = new AWS.SES({ region: config.email.sesRegion });
    // const params = {
    //   Destination: { ToAddresses: [options.to] },
    //   Message: {
    //     Body: {
    //       Html: { Data: options.html },
    //       Text: { Data: options.text || options.html },
    //     },
    //     Subject: { Data: options.subject },
    //   },
    //   Source: config.email.from,
    // };
    // const result = await ses.sendEmail(params).promise();
    // return { success: true, messageId: result.MessageId };

    console.warn('[WARN] AWS SES not implemented, falling back to console');
    return this.sendViaConsole(options);
  }
}

const emailService = new EmailService();

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<EmailResult> => {
  const resetUrl = `${config.email.frontendUrl}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7c3aed;">Reset Your Password</h1>
          <p>You requested to reset your password for your TarotLyfe account.</p>
          <p>Click the button below to reset your password:</p>
          <p style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #7c3aed; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666; font-size: 12px;">${resetUrl}</p>
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            This link will expire in ${config.passwordReset.tokenTTLHours} hour(s).
          </p>
          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            If you didn't request this password reset, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #999;">
            © ${new Date().getFullYear()} TarotLyfe. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
Reset Your Password

You requested to reset your password for your TarotLyfe account.

Click this link to reset your password:
${resetUrl}

This link will expire in ${config.passwordReset.tokenTTLHours} hour(s).

If you didn't request this password reset, please ignore this email.

© ${new Date().getFullYear()} TarotLyfe. All rights reserved.
  `.trim();

  return emailService.sendEmail({
    to: email,
    subject: 'Reset Your TarotLyfe Password',
    html,
    text,
  });
};

export default emailService;

