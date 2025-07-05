# Student Authentication Flow

This document explains how students registered in the "New Student Information" system authenticate into the "New Student Portal" using their registration ID and date of birth.

## Overview

1. Students register through the "New Student Information" system
2. Their data is stored in Firebase in the `student-registrations` collection
3. Students can then log into the "New Student Portal" using:
   - Their registration number (starts with UCAES) or index number
   - Their date of birth as entered during registration

## Authentication Process

### 1. Registration (New Student Information)

During registration, the student's information is collected including:
- Personal details (name, date of birth, etc.)
- Contact information
- Guardian details
- Academic information

This information is stored in Firebase Firestore in the `student-registrations` collection.

A unique `registrationNumber` is generated for the student, typically in the format `UCAESYYYYXXXX` where:
- `YYYY` is the current year
- `XXXX` is a random 4-digit number

### 2. Login (New Student Portal)

When a student attempts to log in:

1. The student enters their registration number or index number
2. The student enters their date of birth
3. The system:
   - Searches for the student record in Firebase using the provided ID
   - Verifies the date of birth matches the stored record
   - Creates a session for the student if authentication is successful

## Implementation Details

### Verification Logic Flow

1. Student enters their registration ID/index number and date of birth
2. System checks if the ID exists in Firebase
   - First checks if it's a registration number (starting with UCAES)
   - If not found, checks if it's an index number
3. If the student record is found, the system verifies the date of birth
   - Date of birth is normalized to handle different formats (DD-MM-YYYY, DDMMYYYY, etc.)
4. If both ID and date of birth match, the student is logged in
   - A session is created using Firebase anonymous authentication and local storage
   - Student's basic information is loaded for use in the portal

### Date of Birth Handling

To handle different date formats, the system uses a normalization function that:

1. Cleans the input (removes whitespace, standardizes separators)
2. Handles multiple formats (DD-MM-YYYY, DDMMYYYY, etc.)
3. Compares the normalized dates for verification

## Testing

You can test the authentication flow using the provided script:

```bash
node scripts/test-auth-flow.js <student-id> <date-of-birth>
```

For example:
```bash
node scripts/test-auth-flow.js UCAES20239999 16-06-2000
```

## Security Considerations

- Student IDs are case-insensitive to handle variations in input
- Date of birth validation is strict but flexible in format
- Failed login attempts are logged but not limited (consider adding rate limiting)
- Sessions expire after 8 hours of inactivity

## Future Improvements

- Add multi-factor authentication for additional security
- Implement password change functionality after first login
- Add account recovery options
- Implement session management with Firebase custom tokens 