# Migration Guide: MongoDB to Firebase

## Overview

This document provides instructions for migrating the Academic Affairs module from MongoDB with API routes to direct Firebase client-side access, using the same Firebase project as the New Student Portal and New Student Information modules.

## Firebase Project Details

We are using the following Firebase project across all modules:
- Project ID: `ucaes2025`
- Project name: University College of Agriculture and Environmental Studies
- Authentication: Email/password + Firebase Auth
- Database: Cloud Firestore
- Storage: Firebase Storage

## Migration Steps

### 1. Preparation

1. Remove MongoDB dependencies:
   - Remove `mongodb` and `mongoose` from `package.json`
   - Update webpack configuration in `next.config.mjs` to remove MongoDB fallbacks

2. Update Firebase configuration:
   - Ensure `firebase.ts` uses the same configuration as other modules
   - Update exports to match the standard format used in other modules

### 2. Data Migration

1. Create new Firestore collections:
   - `academic-programs`: Academic programs data
   - `academic-courses`: Course information
   - `academic-years`: Academic year definitions
   - `academic-semesters`: Semester data for each academic year
   - `academic-staff`: Staff/faculty information

2. Run the seeding script:
   ```
   node scripts/seed-academic-data.js
   ```

### 3. Firebase Security Rules

1. Update Firestore security rules to secure the new collections:
   - Rules are in `firestore.rules`
   - Use role-based access control (RBAC) for different staff types

### 4. Code Updates

1. Replace API calls with Firebase services:
   - Create Firebase service modules in `lib/firebase-service.ts`
   - Update context providers to use Firebase services directly

2. Update React components:
   - Create React hooks for real-time data with `useFirebaseData`
   - Implement optimistic UI updates

### 5. Testing

1. Test read operations:
   - Verify that data displays correctly in all views
   - Check that real-time updates work properly

2. Test write operations:
   - Create, update, and delete operations for all data types
   - Verify that changes propagate correctly

## Benefits of Migration

1. **Real-time data**: Firebase provides real-time data synchronization
2. **Reduced complexity**: No need for API routes, reducing boilerplate code
3. **Consistency**: Same data access pattern across all university modules
4. **Improved performance**: Client-side data fetching reduces server load
5. **Better offline support**: Firebase provides offline capabilities

## Troubleshooting

- **Authentication issues**: Verify user permissions in security rules
- **Missing data**: Check collection names and document structure
- **Type errors**: Ensure TypeScript interfaces match Firestore document structure 