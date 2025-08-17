// Test script to send a real password reset email
// This simulates the password reset process for the Finance Officer

require('dotenv').config({ path: '.env.local' });
const { v4: uuidv4 } = require('uuid');

async function testPasswordReset() {
  console.log('🧪 Testing Password Reset Email System');
  console.log('=====================================');
  
  // Simulate Finance Officer details
  const financeOfficer = {
    name: 'Roseline',
    email: 'emporiumexpressgh@gmail.com',
    role: 'Finance Officer',
    userId: 'test-finance-officer-123'
  };
  
  console.log('👤 Testing with Finance Officer:');
  console.log(`   Name: ${financeOfficer.name}`);
  console.log(`   Email: ${financeOfficer.email}`);
  console.log(`   Role: ${financeOfficer.role}`);
  console.log('');
  
  try {
    // Import nodemailer directly
    const nodemailer = require('nodemailer');
    
    // Generate a test reset token
    const resetToken = uuidv4();
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    
    console.log('🔗 Generated reset link:');
    console.log(`   ${resetLink}`);
    console.log('');
    
    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Generate new UCAES branded email with green/white theme and role-specific content
    const htmlContent = `
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
                  font-size: 20px;
                  color: #0d7377;
                  font-weight: bold;
                  border: 3px solid #ffffff;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              }
              .header h1 { 
                  margin: 0; 
                  font-size: 24px; 
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
                  <p><strong>Hello ${financeOfficer.name},</strong></p>
                  <p>You have requested to reset your password for your UCAES Academic System account.</p>
                  
                  <div class="role-info">
                      This password reset is for your <strong>Finance</strong> account.
                  </div>
                  
                  <p>To set your new password, please click the button below:</p>
                  
                  <div class="button-container">
                      <a href="${resetLink}" class="button">Set New Password</a>
                  </div>
                  
                  <p><strong>If the button doesn't work, copy and paste this link into your browser:</strong></p>
                  <div class="link-backup">${resetLink}</div>
                  
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
                  <p>Account: ${financeOfficer.email}</p>
              </div>
          </div>
      </body>
      </html>
    `;
    
    const textContent = `
UCAES Academic System - Password Reset Request

Hello ${financeOfficer.name},

You have requested to reset your password for your UCAES Academic System account.

This password reset is for your Finance account.

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
Account: ${financeOfficer.email}
    `;
    
    console.log('📧 Sending password reset email...');
    console.log(`   From: ${process.env.EMAIL_USER}`);
    console.log(`   To: ${financeOfficer.email}`);
    console.log(`   Subject: Password Reset - UCAES Academic System`);
    console.log('');
    
    // Send the email
    const info = await transporter.sendMail({
      from: `"UCAES Academic System" <${process.env.EMAIL_USER}>`,
      to: financeOfficer.email,
      subject: 'Password Reset - UCAES Academic System',
      html: htmlContent,
      text: textContent
    });
    
    const emailSent = !!info.messageId;
    
    if (emailSent) {
      console.log('✅ SUCCESS! Password reset email sent successfully!');
      console.log('');
      console.log('📬 What happens next:');
      console.log('   1. Roseline will receive the email at: emporiumexpressgh@gmail.com');
      console.log('   2. She clicks the "Set New Password" button in the email');
      console.log('   3. She gets redirected to the password reset page');
      console.log('   4. She enters her new password');
      console.log('   5. She can login with her new password');
      console.log('');
      console.log('🔍 Check her email inbox now!');
      console.log('   (Email may take 1-2 minutes to arrive)');
      console.log('');
      console.log('🧪 Test Reset Link (for testing):');
      console.log(`   ${resetLink}`);
    } else {
      console.log('❌ Failed to send email');
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.log('');
    console.log('🔧 Common issues:');
    console.log('   1. Check that .env.local file has correct Gmail credentials');
    console.log('   2. Verify Gmail App Password is correct');
    console.log('   3. Make sure 2-Factor Authentication is enabled');
  }
}

// Run the test
testPasswordReset();
