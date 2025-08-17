# Academic Year Centralization Implementation

## Overview

This document outlines the implementation of the centralized academic year and semester management system for UCAES. The system allows changes made by directors in the Academic Affairs portal to propagate across the entire website, including the Student Portal.

## System Architecture

The centralization system uses the following components:

1. **Firebase Firestore**: A `systemConfig` collection with an `academicPeriod` document that serves as the single source of truth
2. **React Context API**: Context providers in both Academic Affairs and Student Portal to manage and share state
3. **Real-time Updates**: The Student Portal subscribes to changes in the `systemConfig` collection

### System Flow Diagram

```mermaid
graph TD
    subgraph "Academic Affairs Portal"
        A[Director] -->|Sets active year/semester| B[Academic Management Page]
        B -->|Updates| C[Academic Years Collection]
        B -->|Updates| D[Semesters Collection]
        B -->|Calls| E[updateSystemAcademicPeriod]
        E -->|Updates| F[systemConfig/academicPeriod]
    end
    
    subgraph "Firebase Firestore"
        C
        D
        F
    end
    
    subgraph "Student Portal"
        F -->|Real-time updates| G[SystemConfigProvider]
        G -->|Provides| H[currentAcademicYear]
        G -->|Provides| I[currentSemester]
        H -->|Displays in| J[Dashboard]
        I -->|Displays in| J
        H -->|Displays in| K[Academic Records]
        I -->|Displays in| K
        H -->|Default filter in| L[Grades]
        I -->|Default filter in| L
    end
```

## Issues Fixed

We identified and fixed several issues to make the centralization work properly:

### 1. Firebase Configuration Mismatch

Different parts of the system were using different Firebase configurations:

```javascript
// Wrong configuration in update-system-config.js
const firebaseConfig = {
  apiKey: "AIzaSyCHN5cjLBbUnVgBqzZeceMkRZ49tB0SOes",  // Wrong API key
  // ...other wrong values
};

// Correct configuration
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
```

**Fix**: Updated all Firebase configurations to match the correct values.

### 2. Academic Year Field Name Mismatch

The Academic Year model in the database used the `name` field for the academic year (e.g., "2024/2025"), but the code was looking for a `year` field:

```javascript
// Before: Would result in undefined for academicYear.year
await updateSystemAcademicPeriod(
  academicYear.id,
  academicYear.year,  // This was undefined!
  semesterId,
  semesterName,
  userId
);
```

**Fix**: Added fallbacks to use either field or a default value:

```javascript
await updateSystemAcademicPeriod(
  academicYear.id,
  academicYear.year || academicYear.name || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
  semesterId,
  semesterName,
  userId
);
```

### 3. Storage Bucket Configuration

Both portals had incorrect `storageBucket` values:

```javascript
// Before
storageBucket: "ucaes2025.appspot.com",

// After
storageBucket: "ucaes2025.firebasestorage.app",
```

**Fix**: Updated the `storageBucket` value in both Firebase configurations.

## How the System Works

### 1. System Configuration Structure

The system uses a Firestore document at `systemConfig/academicPeriod` with this structure:

```javascript
{
  "currentAcademicYearId": "RJmqu3dugnEbaFWdYMjF",  // Document ID
  "currentAcademicYear": "2024/2025",                // Display name
  "currentSemesterId": "abc123",                     // Document ID (or null)
  "currentSemester": "First Semester",               // Display name (or null)
  "lastUpdated": Timestamp,
  "updatedBy": "user_id_or_system"
}
```

### 2. Update Flow in Academic Affairs

When a director sets an academic year or semester as active:

1. The year/semester is updated in its own collection
2. Other years/semesters in the same category are marked as inactive
3. The system configuration is updated via `updateSystemAcademicPeriod()`

```javascript
// Example: Setting an academic year as active
if (editYearData.status === "active") {
  // Deactivate other years...
  
  // Update system config
  await updateSystemAcademicPeriod(
    editYearData.id,
    academicYearString,
    activeSemester?.id || null,
    activeSemester?.name || null,
    auth.currentUser?.uid || "unknown"
  );
}
```

### 3. Student Portal Integration

The Student Portal uses a `SystemConfigProvider` to share this information:

```javascript
// 1. Provider setup in layout.tsx
<AuthProvider>
  <SystemConfigProvider>
    <ClientLayout>{children}</ClientLayout>
  </SystemConfigProvider>
</AuthProvider>

// 2. Consuming the context in components
const { currentAcademicYear, currentSemester } = useSystemConfig();

// 3. Displaying in UI
<p className="text-lg font-semibold">{currentAcademicYear || 'Loading...'}</p>
```

### 4. Real-time Updates

The `SystemConfigProvider` uses Firestore's `onSnapshot` to listen for changes:

```javascript
useEffect(() => {
  const configRef = doc(db, "systemConfig", "academicPeriod");
  const unsubscribe = onSnapshot(configRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      setConfig({
        currentAcademicYear: data.currentAcademicYear,
        currentAcademicYearId: data.currentAcademicYearId,
        currentSemester: data.currentSemester,
        currentSemesterId: data.currentSemesterId,
        lastUpdated: data.lastUpdated?.toDate() || null,
      });
    }
    setIsLoading(false);
  });
  
  return () => unsubscribe();
}, []);
```

## Initialization Process

A standalone script (`update-system-config.js`) initializes or updates the system configuration:

1. Checks if the configuration already exists
2. Finds the active academic year from `academic-years` collection
3. Finds any active semester for that year
4. Updates the `systemConfig/academicPeriod` document

## Security Rules

Firebase security rules ensure that:
- All authenticated users can read the system configuration
- Only directors and staff with admin/academic_administration permissions can write to it

## Usage in the UI

The centralized academic information is used in various places:

1. **Student Dashboard**: Shows current academic year and semester
2. **Academic Records**: Displays current academic period
3. **Grades**: Uses current year/semester as default filter values

## Future Recommendations

1. **Schema Consistency**: Standardize on either `year` or `name` field for academic years
2. **Error Handling**: Add better error logging and user feedback
3. **Fallback Mechanism**: Implement a more robust fallback if the centralized config fails
4. **Admin Interface**: Add a direct admin interface to modify system configuration 