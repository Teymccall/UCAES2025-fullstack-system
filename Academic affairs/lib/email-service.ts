import nodemailer from 'nodemailer';

// Email configuration - these should be in environment variables in production
const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com', // Replace with your Gmail
    pass: process.env.EMAIL_PASS || 'your-app-password'     // Replace with Gmail App Password
  }
};

// Create reusable transporter object using the default SMTP transport
const createTransporter = () => {
  return nodemailer.createTransporter(EMAIL_CONFIG);
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log('📧 Sending email to:', options.to);
    
    const transporter = createTransporter();
    
    // Verify connection configuration
    await transporter.verify();
    console.log('✅ Email server connection verified');
    
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"UCAES Academic System" <${EMAIL_CONFIG.auth.user}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || 'Please enable HTML email to view this message properly.'
    });
    
    console.log('✅ Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}

// Email template for password reset
export function generateResetEmailTemplate(resetLink: string, userEmail: string, userName?: string, userRole?: string): string {
  const displayName = userName || userEmail;
  const roleTitle = userRole || 'Staff';
  
  // Role-specific messaging - simplified and formal
  const getRoleMessage = (role: string) => {
    switch (role.toLowerCase()) {
      case 'finance_officer':
        return 'This password reset is for your <strong>Finance</strong> account.';
      case 'exam_officer':
        return 'This password reset is for your <strong>Exam</strong> account.';
      case 'admissions_officer':
        return 'This password reset is for your <strong>Admissions</strong> account.';
      case 'registrar':
        return 'This password reset is for your <strong>Registrar</strong> account.';
      case 'lecturer':
        return 'This password reset is for your <strong>Lecturer</strong> account.';
      case 'director':
        return 'This password reset is for your <strong>Director</strong> account.';
      default:
        return 'This password reset is for your <strong>Staff</strong> account.';
    }
  };
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Password Reset - UCAES Academic System</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f8fffe; 
            }
            .container { 
                max-width: 600px; 
                margin: 20px auto; 
                background-color: #ffffff; 
                border-radius: 12px; 
                overflow: hidden; 
                box-shadow: 0 8px 24px rgba(0, 100, 0, 0.1); 
                border: 2px solid #e8f5e8;
            }
            .header { 
                background: linear-gradient(135deg, #0d7377 0%, #14a085 100%);
                color: white; 
                padding: 30px 20px; 
                text-align: center; 
            }
            .logo-container {
                margin-bottom: 15px;
            }
            .logo {
                width: 80px;
                height: 80px;
                background-color: #ffffff;
                border-radius: 50%;
                margin: 0 auto 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                color: #0d7377;
                font-weight: bold;
                border: 3px solid #ffffff;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                text-align: center;
                line-height: 1.2;
            }
            .header h1 { 
                margin: 0; 
                font-size: 26px; 
                font-weight: bold;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            .header h2 { 
                margin: 8px 0 0 0; 
                font-size: 16px; 
                font-weight: normal; 
                opacity: 0.95;
            }
            .content { 
                padding: 35px 25px; 
                background-color: #ffffff; 
            }
            .content p { 
                margin: 0 0 18px 0; 
                font-size: 15px;
            }
            .role-info {
                background-color: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
                border-left: 4px solid #0d7377;
            }
            .role-info strong {
                color: #0d7377;
            }
            .button-container { 
                text-align: center; 
                margin: 35px 0; 
            }
            .button { 
                display: inline-block; 
                padding: 16px 32px; 
                background: linear-gradient(135deg, #0d7377 0%, #14a085 100%);
                color: white; 
                text-decoration: none; 
                border-radius: 8px; 
                font-weight: bold; 
                font-size: 16px; 
                box-shadow: 0 4px 12px rgba(13, 115, 119, 0.3);
                transition: transform 0.2s;
            }
            .button:hover { 
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(13, 115, 119, 0.4);
            }
            .link-backup { 
                background-color: #f9fafb; 
                padding: 18px; 
                border-radius: 6px; 
                margin: 25px 0; 
                word-break: break-all; 
                font-family: 'Courier New', monospace; 
                font-size: 13px; 
                border-left: 4px solid #0d7377; 
                border: 1px solid #e5e7eb;
            }
            .warning-box { 
                background-color: #fefce8; 
                border: 1px solid #fde047; 
                border-radius: 8px; 
                padding: 20px; 
                margin: 25px 0; 
                border-left: 4px solid #eab308;
            }
            .warning-box strong { 
                color: #a16207; 
            }
            .warning-box ul { 
                margin: 12px 0 0 0; 
                padding-left: 20px; 
            }
            .warning-box li {
                margin-bottom: 5px;
            }
            .footer { 
                background-color: #f8fffe; 
                padding: 25px 20px; 
                text-align: center; 
                color: #6b7280; 
                font-size: 13px; 
                border-top: 2px solid #e8f5e8; 
            }
            .footer p { 
                margin: 6px 0; 
            }
            .footer strong {
                color: #0d7377;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo-container">
                    <div class="logo">
                        UCAES<br/>LOGO
                    </div>
                </div>
                <h1>University College of Applied Engineering Studies</h1>
                <h2>Password Reset Request</h2>
            </div>
            <div class="content">
                <p><strong>Hello ${displayName},</strong></p>
                <p>You have requested to reset your password for your UCAES Academic System account.</p>
                
                <div class="role-info">
                    ${getRoleMessage(roleTitle)}
                </div>
                
                <p>To set your new password, please click the button below:</p>
                
                <div class="button-container">
                    <a href="${resetLink}" class="button">Set New Password</a>
                </div>
                
                <p><strong>If the button doesn't work, copy and paste this link into your browser:</strong></p>
                <div class="link-backup">
                    ${resetLink}
                </div>
                
                <div class="warning-box">
                    <strong>⚠️ Important Security Information:</strong>
                    <ul>
                        <li>This link will expire in <strong>24 hours</strong></li>
                        <li>This link can only be used <strong>once</strong></li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>Never share this link with anyone</li>
                    </ul>
                </div>
                
                <p>If you need assistance, please contact UCAES.</p>
                <p>Thank you,<br>
                <strong>UCAES Team</strong></p>
            </div>
            <div class="footer">
                <p><strong>University College of Applied Engineering Studies (UCAES)</strong></p>
                <p>This is an automated message, please do not reply to this email.</p>
                <p>Account: ${userEmail}</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Simple text version for email clients that don't support HTML
export function generateResetEmailText(resetLink: string, userEmail: string, userName?: string, userRole?: string): string {
  const displayName = userName || userEmail;
  const roleTitle = userRole || 'Staff';
  
  const getRoleMessageText = (role: string) => {
    switch (role.toLowerCase()) {
      case 'finance_officer':
        return 'This password reset is for your Finance account.';
      case 'exam_officer':
        return 'This password reset is for your Exam account.';
      case 'admissions_officer':
        return 'This password reset is for your Admissions account.';
      case 'registrar':
        return 'This password reset is for your Registrar account.';
      case 'lecturer':
        return 'This password reset is for your Lecturer account.';
      case 'director':
        return 'This password reset is for your Director account.';
      default:
        return 'This password reset is for your Staff account.';
    }
  };
  
  return `
UCAES Academic System - Password Reset Request

Hello ${displayName},

You have requested to reset your password for your UCAES Academic System account.

${getRoleMessageText(roleTitle)}

To set your new password, please copy and paste this link into your browser:
${resetLink}

IMPORTANT:
- This link will expire in 24 hours
- This link can only be used once  
- If you didn't request this reset, please ignore this email
- Never share this link with anyone

If you need assistance, please contact UCAES.

Thank you,
UCAES Team

---
University College of Applied Engineering Studies (UCAES)
This is an automated message, please do not reply to this email.
Account: ${userEmail}
  `;
}
