// Quick test script to verify email configuration
// Run this with: node test-email.js

require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function testEmailConfig() {
  console.log('🧪 Testing email configuration...');
  
  // Check if environment variables are loaded
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  if (!emailUser || !emailPass) {
    console.error('❌ Email configuration not found!');
    console.log('Please make sure .env.local file exists with:');
    console.log('EMAIL_USER=your-gmail@gmail.com');
    console.log('EMAIL_PASS=your-app-password');
    return;
  }
  
  console.log('✅ Email user:', emailUser);
  console.log('✅ Email password:', emailPass ? 'Set (hidden)' : 'Not set');
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
  
  try {
    // Test the connection
    console.log('🔌 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    console.log('🎉 Email configuration is working correctly!');
    console.log('');
    console.log('You can now send password reset emails automatically.');
    
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.log('');
    console.log('Common issues:');
    console.log('1. Make sure 2-Factor Authentication is enabled on your Gmail');
    console.log('2. Use an App Password, not your regular Gmail password');
    console.log('3. Check that the App Password is correct (16 characters)');
  }
}

testEmailConfig();
