# Student Portal Login Guide

This document explains how to log into the UCAES Student Portal after completing registration through the New Student Information system.

## How to Login

1. Go to the Student Portal login page.
2. You will need to provide two pieces of information:
   - Your **Registration Number** or **Index Number**
   - Your **Date of Birth**

### Registration/Index Number

Your registration number is the unique identifier assigned during the registration process. It typically starts with "UCAES" followed by the year and a sequence number (e.g., UCAES20259770).

If you have been assigned a student index number, you can use that instead.

### Date of Birth

Enter your date of birth exactly as you provided during registration, in the format: **DD-MM-YYYY**

For example: `16-06-2000` for June 16, 2000.

## Troubleshooting Login Issues

If you're having trouble logging in:

1. **Check your registration number**: Make sure you're entering the exact registration number or index number provided during registration.

2. **Verify date format**: Your date of birth must be in DD-MM-YYYY format (e.g., 16-06-2000).

3. **Verify your registration status**: Your registration must be complete in the system before you can log in to the portal.

4. **Contact support**: If you continue to have issues, please contact the Student Affairs Office or IT Support Desk for assistance.

## For Administrators: How the System Works

The authentication process works as follows:

1. Student completes registration in the New Student Information system
2. Their data is stored in Firebase in the `student-registrations` collection
3. When they attempt to log into the Student Portal:
   - The system checks if their registration/index number exists in the database
   - If found, it verifies that the provided date of birth matches the stored record
   - If both match, the student is granted access to the portal

### Testing Authentication

You can test authentication with existing student records using the provided test script:

```
node scripts/test-auth-flow.js <registration-number> <date-of-birth>
```

Example:
```
node scripts/test-auth-flow.js UCAES20259770 16-06-2000
```

This will verify if the authentication would succeed without actually creating a session.

### Existing Test Student

For testing purposes, you can use the following real student record that exists in the system:

- **Registration Number:** UCAES20259770
- **Name:** HANAMEL ACHUMBORO
- **Date of Birth:** 16-06-2000

This student record has been confirmed to work with the authentication system. 