# Email Setup Guide for UCAES Academic System

## Quick Setup Instructions

To enable actual email sending for password resets, follow these steps:

### Option 1: Gmail Setup (Recommended for Testing)

1. **Create a Gmail App Password**:
   - Go to your Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate an app password for "Mail"
   - Copy the 16-character password

2. **Set Environment Variables**:
   Create a `.env.local` file in the `Academic affairs` folder with:
   ```
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```

3. **Test the Email**:
   - Try resetting a user's password
   - The email should be sent automatically

### Option 2: Alternative Email Services

You can also configure other email services by modifying `lib/email-service.ts`:

- **Outlook/Hotmail**: Change host to `smtp-mail.outlook.com`
- **Yahoo**: Change host to `smtp.mail.yahoo.com`
- **Custom SMTP**: Use your organization's SMTP settings

### Current Fallback Behavior

If email sending fails (e.g., no email configuration), the system will:
1. Generate the reset link
2. Display it in the admin interface
3. Allow you to manually share the link with the user

### Email Template Features

The password reset emails include:
- ✅ Professional UCAES branding
- ✅ Secure 24-hour expiring links
- ✅ One-time use tokens
- ✅ Clear instructions for users
- ✅ Both HTML and text versions
- ✅ Security warnings and tips

### Troubleshooting

If emails aren't sending:
1. Check the browser console for error messages
2. Verify your email credentials are correct
3. Make sure 2-factor authentication is enabled for Gmail
4. Check that the app password was generated correctly
5. The system will show reset links in the UI as fallback

### Production Recommendations

For production use, consider:
- Using a dedicated email service (SendGrid, AWS SES, Mailgun)
- Setting up proper DNS records (SPF, DKIM)
- Using a custom domain for email sender
- Implementing email delivery tracking







