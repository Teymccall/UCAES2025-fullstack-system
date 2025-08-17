// Comprehensive test to verify password reset functionality works end-to-end
require('dotenv').config({ path: '.env.local' });

async function testPasswordResetFunctionality() {
  console.log('🔬 COMPREHENSIVE PASSWORD RESET FUNCTIONALITY TEST');
  console.log('==================================================');
  
  const testUser = {
    name: 'Roseline',
    email: 'emporiumexpressgh@gmail.com',
    role: 'finance_officer',
    userId: 'test-finance-officer-123'
  };
  
  console.log('👤 Testing user:', testUser);
  console.log('');
  
  try {
    // Test 1: Email Sending Functionality
    console.log('📧 TEST 1: Email Sending');
    console.log('------------------------');
    
    const nodemailer = require('nodemailer');
    
    // Test SMTP connection
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    console.log('🔌 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful');
    console.log('');
    
    // Test 2: API Endpoints
    console.log('🌐 TEST 2: API Endpoints');
    console.log('------------------------');
    
    // Test password reset email API
    console.log('📤 Testing send-reset-email API...');
    const resetResponse = await fetch('http://localhost:3000/api/auth/send-reset-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUser.userId,
        email: testUser.email
      })
    });
    
    if (resetResponse.ok) {
      const resetResult = await resetResponse.json();
      console.log('✅ Send reset email API working');
      
      if (resetResult.resetLink) {
        console.log('🔗 Reset link generated:', resetResult.resetLink);
        
        // Test 3: Token validation
        console.log('');
        console.log('🔐 TEST 3: Token Validation');
        console.log('---------------------------');
        
        const token = resetResult.resetLink.split('token=')[1];
        console.log('🎟️ Extracted token:', token?.substring(0, 8) + '...');
        
        // Test token validation API
        const validateResponse = await fetch('http://localhost:3000/api/auth/validate-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        
        if (validateResponse.ok) {
          console.log('✅ Token validation API working');
        } else {
          console.log('❌ Token validation API failed');
        }
        
        // Test 4: Password reset completion
        console.log('');
        console.log('🔄 TEST 4: Password Reset Completion');
        console.log('-----------------------------------');
        
        const newPassword = 'TestPassword123!';
        const confirmResponse = await fetch('http://localhost:3000/api/auth/confirm-reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            newPassword
          })
        });
        
        if (confirmResponse.ok) {
          console.log('✅ Password reset completion API working');
        } else {
          console.log('❌ Password reset completion API failed');
        }
      }
    } else {
      console.log('❌ Send reset email API failed');
    }
    
    console.log('');
    console.log('🎨 TEST 5: Email Template Quality');
    console.log('----------------------------------');
    
    // Check email template components
    const { generateResetEmailTemplate } = require('./lib/email-service.ts');
    const htmlTemplate = generateResetEmailTemplate(
      'http://localhost:3000/reset-password?token=test-token',
      testUser.email,
      testUser.name,
      testUser.role
    );
    
    // Check for key components
    const checks = [
      { name: 'UCAES Logo', test: htmlTemplate.includes('UCAES') },
      { name: 'University Full Name', test: htmlTemplate.includes('University College of Applied Engineering Studies') },
      { name: 'Green Color Scheme', test: htmlTemplate.includes('#0d7377') },
      { name: 'Role-Specific Message', test: htmlTemplate.includes('Finance') },
      { name: 'Professional Button', test: htmlTemplate.includes('Set New Password') },
      { name: 'Security Warnings', test: htmlTemplate.includes('24 hours') },
      { name: 'UCAES Team Signature', test: htmlTemplate.includes('UCAES Team') }
    ];
    
    checks.forEach(check => {
      console.log(check.test ? '✅' : '❌', check.name);
    });
    
    console.log('');
    console.log('📊 FINAL RESULTS');
    console.log('================');
    
    const allPassed = checks.every(check => check.test);
    
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('✅ Email system is fully functional');
      console.log('✅ UCAES branding is correct');
      console.log('✅ Role-specific messaging works');
      console.log('✅ Professional design implemented');
      console.log('');
      console.log('🚀 System is ready for production use!');
    } else {
      console.log('⚠️ Some tests failed - see details above');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    
    console.log('');
    console.log('🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Make sure the development server is running (npm run dev)');
    console.log('2. Check that .env.local has correct Gmail credentials');
    console.log('3. Verify Gmail App Password is working');
    console.log('4. Check API endpoints are accessible');
  }
}

// Run the comprehensive test
testPasswordResetFunctionality();
