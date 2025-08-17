# Firebase Setup for Admissions System

## Overview

This guide explains how to set up Firebase for the Admissions system to store application data in the cloud instead of localStorage. This enables the Academic Affairs system to access and manage admission applications.

## Prerequisites

1. **Firebase CLI**: Install globally
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Account**: Make sure you have access to the `ucaes2025` Firebase project

3. **Node.js**: Version 16 or higher

## Setup Steps

### 1. Login to Firebase

```bash
firebase login
```

### 2. Initialize Firebase Project

```bash
# Navigate to the project directory
cd "Admission ucaes/project"

# Run the setup script
npm run setup-firebase
```

This script will:
- Check if Firebase CLI is installed
- Create `.firebaserc` file with project configuration
- Deploy Firestore security rules
- Deploy Firestore indexes

### 3. Manual Setup (if script fails)

If the automated setup fails, you can do it manually:

```bash
# Initialize Firebase (if not already done)
firebase init

# Select the following options:
# - Firestore: Configure security rules and indexes
# - Hosting: Configure files for Firebase Hosting
# - Storage: Configure security rules for Cloud Storage
# - Project: Use existing project (ucaes2025)

# Deploy rules and indexes
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

## Firebase Collections

The system uses the following Firestore collections:

### `admission-applications`
Stores all admission application data with the following structure:

```typescript
{
  id: string;
  userId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    region: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    emergencyContact: string;
    emergencyPhone: string;
  };
  academicBackground: {
    schoolName: string;
    qualificationType: string;
    yearCompleted: string;
    subjects: Array<{ subject: string; grade: string }>;
  };
  programSelection: {
    program: string;
    level: string;
    studyMode: string;
    firstChoice: string;
    secondChoice: string;
  };
  documents: {
    photo?: { url: string; publicId: string };
    idDocument?: { url: string; publicId: string };
    certificate?: { url: string; publicId: string };
    transcript?: { url: string; publicId: string };
  };
  paymentStatus: 'pending' | 'paid' | 'failed';
  applicationStatus: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  applicationId?: string;
}
```

### `application-counters`
Stores counters for generating sequential application IDs.

### `academic-settings`
Stores academic year and admission period settings.

### `users`
Stores user profile information.

## Security Rules

### Firestore Rules
- Users can read/write their own application data
- Staff/admin can read all applications
- Staff/admin can update application status
- Application counters are accessible to authenticated users

### Storage Rules
- Users can upload their own documents
- Staff/admin can read all documents
- Profile pictures are user-specific

## API Integration

### Academic Affairs API
The Academic Affairs system can access admission data through the API endpoint:

```
GET /api/admissions/applications
```

Query parameters:
- `status`: Filter by application status
- `paymentStatus`: Filter by payment status
- `program`: Filter by program
- `search`: Search by name, email, or application ID

Example:
```javascript
const response = await fetch('/api/admissions/applications?status=submitted&paymentStatus=paid');
const data = await response.json();
```

## Data Flow

1. **User submits application** → Data saved to Firebase
2. **Academic Affairs dashboard** → Fetches data from Firebase via API
3. **Staff reviews application** → Updates status in Firebase
4. **Real-time updates** → Both systems stay synchronized

## Troubleshooting

### Common Issues

1. **Firebase CLI not found**
   ```bash
   npm install -g firebase-tools
   ```

2. **Permission denied**
   ```bash
   firebase login
   firebase use ucaes2025
   ```

3. **Rules deployment failed**
   ```bash
   firebase deploy --only firestore:rules --force
   ```

4. **Indexes not created**
   ```bash
   firebase deploy --only firestore:indexes
   ```

### Debugging

1. **Check Firebase Console**: Visit https://console.firebase.google.com/project/ucaes2025
2. **View Firestore Data**: Go to Firestore Database section
3. **Check Rules**: Go to Firestore Rules section
4. **Monitor Logs**: Use Firebase Functions logs for debugging

## Migration from localStorage

The system automatically migrates from localStorage to Firebase:

1. **Existing users**: Data is loaded from Firebase if available, otherwise starts fresh
2. **New users**: All data is stored directly in Firebase
3. **Backward compatibility**: The system still works if Firebase is unavailable

## Performance Considerations

1. **Indexes**: Firestore indexes are created for efficient queries
2. **Pagination**: Large datasets are paginated
3. **Caching**: Client-side caching reduces API calls
4. **Real-time updates**: Firestore listeners for live updates

## Security Best Practices

1. **Authentication**: All operations require Firebase Auth
2. **Authorization**: Role-based access control
3. **Data validation**: Input validation on both client and server
4. **Audit trail**: All changes are timestamped and tracked

## Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
firebase deploy --only hosting
```

### Full Deployment
```bash
npm run deploy-all
```

## Support

For issues related to:
- **Firebase setup**: Check this guide
- **API integration**: Check Academic Affairs documentation
- **Data migration**: Contact development team
- **Security**: Review Firebase security rules 