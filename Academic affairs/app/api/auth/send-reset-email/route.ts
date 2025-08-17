import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Import client-side Firebase
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
};

export async function POST(request: Request) {
  try {
    console.log('📧 SEND RESET EMAIL API CALLED');
    const body = await request.json();
    const { userId, email } = body;
    
    console.log('📋 Sending reset email for user:', { userId, email });
    
    // Validate required fields
    if (!userId || !email) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ 
        success: false, 
        error: 'User ID and email are required.' 
      }, { status: 400 });
    }
    
    // Initialize Firebase
    console.log('🔧 Initializing Firebase...');
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    const db = getFirestore(app);
    console.log('✅ Firebase initialized');
    
    // Generate a secure reset token
    const resetToken = uuidv4();
    const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    // Update user document with reset token
    console.log('💾 Storing reset token...');
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      resetToken,
      resetTokenExpiry: resetExpiry.toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Create the reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    // Get user name and role for personalized email
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    const userName = userData?.name || '';
    const userRole = userData?.role || '';
    
    // Send the actual email
    console.log('📧 Sending password reset email...');
    
    try {
      // Import email service dynamically to avoid import issues
      const { sendEmail, generateResetEmailTemplate, generateResetEmailText } = await import('@/lib/email-service');
      
      const emailSent = await sendEmail({
        to: email,
        subject: 'Password Reset - UCAES Academic System',
        html: generateResetEmailTemplate(resetLink, email, userName, userRole),
        text: generateResetEmailText(resetLink, email, userName, userRole)
      });
      
      if (!emailSent) {
        throw new Error('Failed to send email');
      }
      
      console.log('✅ Reset email sent successfully to:', email);
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError);
      // Return the reset link for manual sharing if email fails
      console.log('📧 Email failed, returning reset link for manual sharing:', resetLink);
      return NextResponse.json({ 
        success: true, 
        message: 'Password reset link generated. Email service unavailable - please share the link manually.',
        resetLink: resetLink,
        emailError: true
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Password reset email sent successfully.',
      // Remove this in production - only for testing
      resetLink: resetLink 
    });
  } catch (error) {
    console.error('❌ Send reset email API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send reset email.' 
    }, { status: 500 });
  }
}

// Email template for password reset
function generateResetEmailTemplate(resetLink: string, email: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Password Reset - UCAES Academic System</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f8f9fa; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>UCAES Academic System</h1>
                <h2>Password Reset Request</h2>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>You have requested to reset your password for your UCAES Academic System account (${email}).</p>
                <p>Click the button below to set your new password:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" class="button">Set New Password</a>
                </p>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 3px;">
                    ${resetLink}
                </p>
                <p><strong>Important:</strong></p>
                <ul>
                    <li>This link will expire in 24 hours</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>For security, this link can only be used once</li>
                </ul>
            </div>
            <div class="footer">
                <p>UCAES Academic Affairs Department</p>
                <p>This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}
