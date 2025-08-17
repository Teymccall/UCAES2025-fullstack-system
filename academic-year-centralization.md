# UCAES Academic Year Centralization Implementation Plan

## Overview

This document outlines the implementation plan for centralizing academic year management across the UCAES system. The goal is to create a single source of truth for the current academic year and semester that will be used by both the Academic Affairs portal and Student Portal.

## Current State

The system currently has two separate implementations:

1. **Academic Affairs Portal**:
   - Directors can set active academic years and semesters
   - Uses `academic-years` collection in Firebase
   - Has a dedicated management UI

2. **Student Portal**:
   - Students specify their entry academic year during registration
   - Uses hardcoded year ranges in some places
   - Queries for academic years with `isCurrent: true`
   - Course registrations are filtered by academic year

## Implementation Strategy

We will implement a gradual, non-disruptive approach that runs in parallel with the existing system to ensure no functionality is broken.

### Phase 1: Create Central Configuration

**Goal**: Create a centralized configuration store without affecting existing functionality.

#### Step 1.1: Create System Configuration Collection

```javascript
// systemConfig collection structure
{
  "academicPeriod": {
    "currentAcademicYearId": "reference_to_year_doc",
    "currentAcademicYear": "2024/2025",
    "currentSemesterId": "reference_to_semester_doc",
    "currentSemester": "First Semester",
    "lastUpdated": Timestamp,
    "updatedBy": "director_user_id"
  }
}
```

#### Step 1.2: Initialize with Current Values

```javascript
async function initializeSystemConfig() {
  // Check if config already exists
  const configRef = doc(db, "systemConfig", "academicPeriod");
  const configSnap = await getDoc(configRef);
  
  if (!configSnap.exists()) {
    // Get current active academic year from existing system
    const yearsRef = collection(db, "academic-years");
    const q = query(yearsRef, where("status", "==", "active"), limit(1));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const activeYear = snapshot.docs[0];
      
      // Find active semester if any
      const semestersRef = collection(db, "semesters");
      const semQ = query(
        semestersRef, 
        where("academicYear", "==", activeYear.id),
        where("status", "==", "active"),
        limit(1)
      );
      const semSnapshot = await getDocs(semQ);
      let semesterId = null;
      let semesterName = null;
      
      if (!semSnapshot.empty) {
        const activeSem = semSnapshot.docs[0];
        semesterId = activeSem.id;
        semesterName = activeSem.data().name;
      }
      
      // Create initial config that matches current state
      await setDoc(configRef, {
        currentAcademicYearId: activeYear.id,
        currentAcademicYear: activeYear.data().year,
        currentSemesterId: semesterId,
        currentSemester: semesterName,
        lastUpdated: serverTimestamp(),
        updatedBy: "system_initialization"
      });
      
      console.log("System config initialized with existing academic year");
    }
  }
}
```

#### Step 1.3: Add Security Rules

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // System config rules
    match /systemConfig/academicPeriod {
      // Anyone can read
      allow read: if request.auth != null;
      
      // Only directors can write
      allow write: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "director";
    }
  }
}
```

### Phase 2: Update Academic Affairs Portal

**Goal**: Extend the Academic Affairs portal to update the central configuration without changing existing behavior.

#### Step 2.1: Create Utility Functions

```javascript
// lib/system-config.js
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Update the system academic period configuration
 */
export async function updateSystemAcademicPeriod(yearId, yearString, semesterId, semesterString, userId) {
  try {
    const configRef = doc(db, "systemConfig", "academicPeriod");
    
    await setDoc(configRef, {
      currentAcademicYearId: yearId,
      currentAcademicYear: yearString,
      currentSemesterId: semesterId,
      currentSemester: semesterString,
      lastUpdated: serverTimestamp(),
      updatedBy: userId
    }, { merge: true });
    
    console.log("System academic period updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating system academic period:", error);
    return false;
  }
}

/**
 * Get the current system academic period
 */
export async function getSystemAcademicPeriod() {
  try {
    const configRef = doc(db, "systemConfig", "academicPeriod");
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      return configSnap.data();
    }
    
    return null;
  } catch (error) {
    console.error("Error getting system academic period:", error);
    return null;
  }
}
```

#### Step 2.2: Extend Academic Year Management

```javascript
// In Academic Affairs portal, extend the existing setActiveYear function
async function setActiveYear(yearId) {
  try {
    // KEEP EXISTING CODE UNCHANGED
    // This updates the academic-years collection as before
    await AcademicYearsService.update(yearId, { status: 'active' });
    
    // Get year details
    const yearDoc = await getDoc(doc(db, "academic-years", yearId));
    if (!yearDoc.exists()) {
      throw new Error("Academic year not found");
    }
    
    // Find active semester for this year
    const semestersRef = collection(db, "semesters");
    const semQ = query(
      semestersRef, 
      where("academicYear", "==", yearId),
      where("status", "==", "active"),
      limit(1)
    );
    const semSnapshot = await getDocs(semQ);
    let semesterId = null;
    let semesterName = null;
    
    if (!semSnapshot.empty) {
      const activeSem = semSnapshot.docs[0];
      semesterId = activeSem.id;
      semesterName = activeSem.data().name;
    }
    
    // ADD NEW CODE that also updates systemConfig
    await updateSystemAcademicPeriod(
      yearId,
      yearDoc.data().year,
      semesterId,
      semesterName,
      auth.currentUser?.uid || "unknown"
    );
    
    // Success message remains the same
    toast({
      title: "Success",
      description: `${yearDoc.data().year} is now the active academic year`,
    });
  } catch (error) {
    console.error("Error setting active year:", error);
    toast({
      title: "Error",
      description: "Failed to update academic year",
      variant: "destructive",
    });
  }
}
```

#### Step 2.3: Update UI to Show System-Wide Status

```jsx
// In Academic Affairs academic year management page
function AcademicYearTable({ years }) {
  const [systemConfig, setSystemConfig] = useState(null);
  
  useEffect(() => {
    // Get system config to highlight the system-wide active year
    async function getConfig() {
      const config = await getSystemAcademicPeriod();
      setSystemConfig(config);
    }
    
    getConfig();
  }, []);
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Academic Year</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>System Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {years.map((year) => (
          <TableRow key={year.id}>
            <TableCell className="font-medium">{year.year}</TableCell>
            <TableCell>{new Date(year.startDate).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(year.endDate).toLocaleDateString()}</TableCell>
            <TableCell>
              <Badge
                variant={
                  year.status === "active" ? "default" : year.status === "completed" ? "secondary" : "outline"
                }
              >
                {year.status}
              </Badge>
            </TableCell>
            <TableCell>
              {systemConfig && systemConfig.currentAcademicYearId === year.id && (
                <Badge variant="success">System Active</Badge>
              )}
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Phase 3: Create Student Portal Integration

**Goal**: Add support for the centralized academic year in the Student Portal without breaking existing functionality.

#### Step 3.1: Create System Config Provider

```jsx
// components/system-config-provider.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Define the context type
interface SystemConfigContextType {
  currentAcademicYear: string | null;
  currentAcademicYearId: string | null;
  currentSemester: string | null;
  currentSemesterId: string | null;
  lastUpdated: Date | null;
  isLoading: boolean;
}

// Create context with default values
const SystemConfigContext = createContext<SystemConfigContextType>({
  currentAcademicYear: null,
  currentAcademicYearId: null,
  currentSemester: null,
  currentSemesterId: null,
  lastUpdated: null,
  isLoading: true,
});

// Provider component
export function SystemConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState({
    currentAcademicYear: null,
    currentAcademicYearId: null,
    currentSemester: null,
    currentSemesterId: null,
    lastUpdated: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to changes in system config
    const configRef = doc(db, "systemConfig", "academicPeriod");
    const unsubscribe = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        setConfig({
          currentAcademicYear: doc.data().currentAcademicYear,
          currentAcademicYearId: doc.data().currentAcademicYearId,
          currentSemester: doc.data().currentSemester,
          currentSemesterId: doc.data().currentSemesterId,
          lastUpdated: doc.data().lastUpdated?.toDate() || null,
        });
      }
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <SystemConfigContext.Provider value={{ ...config, isLoading }}>
      {children}
    </SystemConfigContext.Provider>
  );
}

// Custom hook for using the context
export function useSystemConfig() {
  return useContext(SystemConfigContext);
}
```

#### Step 3.2: Add Provider to Layout

```jsx
// app/layout.tsx
import { SystemConfigProvider } from "@/components/system-config-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SystemConfigProvider>
            {/* Existing providers remain unchanged */}
            {children}
          </SystemConfigProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

#### Step 3.3: Create Utility Functions with Fallbacks

```javascript
// lib/academic-utils.js
import { getSystemAcademicPeriod } from "@/lib/system-config";
import { getCurrentAcademicYear as getLegacyCurrentYear } from "@/lib/academic-year-utils";

/**
 * Get the current academic year with fallback to legacy method
 */
export async function getCurrentAcademicYear() {
  try {
    // Try new centralized system first
    const systemConfig = await getSystemAcademicPeriod();
    
    if (systemConfig?.currentAcademicYear) {
      console.log("Using system academic year:", systemConfig.currentAcademicYear);
      return systemConfig.currentAcademicYear;
    }
    
    // Fall back to existing method if new system doesn't have data
    console.log("Falling back to legacy academic year method");
    return await getLegacyCurrentYear();
  } catch (error) {
    console.error("Error in getCurrentAcademicYear:", error);
    // Always fall back to existing method on error
    return await getLegacyCurrentYear();
  }
}

/**
 * Get the current semester with fallback
 */
export async function getCurrentSemester() {
  try {
    // Try new centralized system first
    const systemConfig = await getSystemAcademicPeriod();
    
    if (systemConfig?.currentSemester) {
      return systemConfig.currentSemester;
    }
    
    // Fall back to default if not available
    return "First Semester"; // Default fallback
  } catch (error) {
    console.error("Error in getCurrentSemester:", error);
    return "First Semester"; // Default fallback
  }
}
```

### Phase 4: Gradual Component Updates

**Goal**: Update individual components to use the centralized system without breaking existing functionality.

#### Step 4.1: Update Course Registration Service

```javascript
// lib/academic-service.ts

// Import the new utility function
import { getCurrentAcademicYear, getCurrentSemester } from "@/lib/academic-utils";

// Update the getStudentCourseRegistration function to use system academic year
export async function getStudentCourseRegistration(studentId: string, academicYear?: string, semester?: string) {
  try {
    if (!studentId) {
      console.error("No student ID provided to getStudentCourseRegistration");
      return null;
    }
    
    // If no academic year provided, get from system config
    if (!academicYear) {
      academicYear = await getCurrentAcademicYear();
      console.log(`Using system academic year: ${academicYear}`);
    }
    
    // If no semester provided, get from system config
    if (!semester) {
      semester = await getCurrentSemester();
      console.log(`Using system semester: ${semester}`);
    }
    
    console.log(`Fetching registration for student ${studentId} (Year: ${academicYear || 'any'}, Semester: ${semester || 'any'})`);
    
    // Rest of the function remains the same...
    // ...
  } catch (error) {
    console.error("Error in getStudentCourseRegistration:", error);
    throw error;
  }
}
```

#### Step 4.2: Update Course Registration Component

```jsx
// app/course-registration/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useStudent } from "@/hooks/use-student";
import { getStudentCourseRegistration } from "@/lib/academic-service";
import { useSystemConfig } from "@/components/system-config-provider";

export default function CourseRegistration() {
  const { student } = useStudent();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get system config - but don't require it
  const systemConfig = useSystemConfig();
  
  useEffect(() => {
    async function loadRegistrations() {
      if (!student?.id) return;
      
      try {
        setLoading(true);
        
        // Use system academic year if available, otherwise let the function handle fallback
        const academicYear = systemConfig?.currentAcademicYear || undefined;
        const semester = systemConfig?.currentSemester || undefined;
        
        const data = await getStudentCourseRegistration(student.id, academicYear, semester);
        setRegistrations(data || []);
      } catch (error) {
        console.error("Error loading registrations:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadRegistrations();
  }, [student?.id, systemConfig?.currentAcademicYear, systemConfig?.currentSemester]);
  
  // Rest of component remains the same
  // ...
}
```

### Phase 5: Testing and Verification

**Goal**: Ensure the centralized system works correctly without breaking existing functionality.

#### Step 5.1: Testing Checklist

1. **Academic Affairs Portal**:
   - [ ] Can create and manage academic years as before
   - [ ] Setting an active year updates both local and system-wide status
   - [ ] UI correctly shows which year is system-wide active

2. **Student Portal**:
   - [ ] Course registrations show for the correct academic year
   - [ ] Changing the active year in Academic Affairs updates the Student Portal
   - [ ] Fallback works if system config is not available

3. **Error Handling**:
   - [ ] System gracefully handles missing configuration
   - [ ] Errors in the new system don't break existing functionality

#### Step 5.2: Rollback Plan

If issues are encountered:

1. **Immediate Rollback**:
   - Disable the SystemConfigProvider in the Student Portal
   - Revert academic-service.ts to use only the legacy methods
   - Keep the systemConfig collection for future use

2. **Partial Rollback**:
   - If only specific components have issues, revert just those components
   - Continue using the centralized system for working components

## Future Enhancements

Once the centralized system is stable, consider these enhancements:

1. **Academic Year Transition Workflow**:
   - Guided process for directors to transition to a new year
   - Automated data migration and verification

2. **Scheduled Transitions**:
   - Allow scheduling future academic year changes
   - Automatic activation on specific dates

3. **Enhanced Notifications**:
   - Notify students when the academic year changes
   - Provide context-aware messages about the current period

4. **Analytics and Reporting**:
   - Track academic year usage across the system
   - Generate reports on registration patterns by academic period

## Conclusion

This implementation plan provides a gradual, non-disruptive approach to centralizing academic year management across the UCAES system. By running the new system in parallel with existing functionality and providing fallbacks, we ensure that the transition is smooth and risk-free.

The end result will be a more consistent user experience across both portals, with a single source of truth for the current academic period that simplifies year transitions and improves data consistency. 