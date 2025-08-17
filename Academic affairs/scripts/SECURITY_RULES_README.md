# Firebase Security Rules Implementation

This document provides an overview of the security rules implementation for the University College of Agriculture and Environmental Studies system.

## Overview

We've implemented comprehensive security rules for both Firestore and Realtime Database that follow the principle of least privilege. These rules ensure:

1. **Role-Based Access Control (RBAC)** - Proper separation between director and staff roles
2. **Fine-Grained Permissions** - Staff members only have access to data they need
3. **Data Validation** - Required fields are enforced for all documents
4. **Audit Protection** - Audit logs cannot be modified or deleted
5. **Course-Specific Permissions** - Staff can only modify data for courses they're assigned to

## Structure

### Firestore Rules

The Firestore rules implement helper functions for role checking and permission validation:

```javascript
// Helper functions for role checking
function isAuthenticated() {
  return request.auth != null;
}

function isDirector() {
  return isAuthenticated() && 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'director';
}

function isStaff() {
  return isAuthenticated() && 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'staff';
}
```

### Realtime Database Rules

The Realtime Database rules follow a similar structure but with the syntax specific to RTDB:

```javascript
"users": {
  "$userId": {
    ".read": "auth != null && (auth.uid == $userId || root.child('users').child(auth.uid).child('role').val() == 'director')",
    ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() == 'director'",
    ".validate": "newData.hasChildren(['role', 'name', 'email', 'status'])"
  }
}
```

## Key Collections and Their Rules

1. **Users Collection**
   - Only directors can create/edit/delete users
   - Users can read their own data
   - Directors can read all user data

2. **Students Collection**
   - Staff with 'student_records' permission can read
   - Staff with 'student_management' permission can write
   - Only directors can create or delete student records

3. **Results Collection**
   - Staff can only modify results for courses they're assigned to
   - Results must have all required fields
   - Only directors can delete results
   - Staff can only save as 'draft' or 'submitted' (not 'approved')

4. **Audit Logs**
   - Read-only for directors
   - Can be created but never modified or deleted

## Deployment Instructions

To deploy these security rules:

1. **Prerequisites**
   - Ensure Firebase CLI is installed: `npm install -g firebase-tools`
   - Log in to Firebase: `firebase login`
   - Verify your project: `firebase projects:list`

2. **Deploy Firestore Rules**
   ```
   firebase deploy --only firestore:rules
   ```

3. **Deploy Database Rules**
   ```
   firebase deploy --only database
   ```

4. **Deploy Firestore Indexes**
   ```
   firebase deploy --only firestore:indexes
   ```

5. **Deploy Everything**
   ```
   firebase deploy --only firestore,database
   ```

## Testing Before Deployment

It's critical to test these rules before deploying to production:

1. Use the [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite) to test locally
2. Create test accounts with different roles (director, staff)
3. Verify that unauthorized operations are properly rejected
4. Test that data validation rules are enforced

## Security Considerations

1. **Cross-Collection Dependencies**
   - Rules rely on data in the users collection for authorization
   - Ensure user documents are properly structured with roles and permissions

2. **Rule Evaluation Performance**
   - Complex rules can impact read/write performance
   - The `isStaffAssignedToCourse()` function requires an additional read

3. **Data Protection**
   - These rules protect at the document level, not field level
   - Consider additional encryption for sensitive fields if needed

## Maintenance

When updating the application, remember to:

1. Update security rules when adding new collections
2. Review and test rules after major feature changes
3. Consider adding rule unit tests for critical security paths 