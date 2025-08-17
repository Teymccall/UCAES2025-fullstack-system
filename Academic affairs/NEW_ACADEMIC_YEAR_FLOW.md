# New Academic Year Flow - Complete Guide

## Overview

When the director sets a new academic year, it triggers a comprehensive process that updates the centralized system and propagates changes across all modules. Here's the complete flow:

## 🎯 **Step 1: Director Creates New Academic Year**

### Location: Academic Management Page (`/director/academic-management`)

The director can create a new academic year in two ways:

#### **Method 1: Add Academic Year Form**
```tsx
// Director fills out the form:
{
  year: "2027-2028",
  startDate: "2027-09-01", 
  endDate: "2028-08-31",
  status: "upcoming"
}
```

#### **Method 2: Quick Add (Lecturer Management)**
```tsx
// Director clicks "Add Academic Year" button
// Prompts for year name (e.g., "2027-2028")
// Automatically creates with default dates
```

### What Happens:
1. **Validation**: Checks required fields (year, startDate, endDate)
2. **Data Processing**: Converts dates to proper format
3. **Database Creation**: Calls `addAcademicYear()` function
4. **Firebase Storage**: Creates document in `academic-years` collection

## 🎯 **Step 2: Academic Year Creation Process**

### Function: `addAcademicYear()` in Academic Context

```typescript
const addAcademicYear = async (yearData) => {
  // 1. Transform data for Firebase
  const firebaseYear = {
    year: yearData.year,
    startDate: new Date(yearData.startDate),
    endDate: new Date(yearData.endDate),
    status: yearData.status
  };
  
  // 2. Create in Firebase
  await AcademicYearsService.create(firebaseYear);
  
  // 3. Refresh data
  await refreshAcademicData();
}
```

### Database Structure Created:
```javascript
{
  id: "auto-generated-document-id",
  year: "2027-2028",
  startDate: Timestamp,
  endDate: Timestamp,
  status: "upcoming",
  createdAt: Timestamp,
  // Additional fields added by different services
}
```

## 🎯 **Step 3: Director Sets as Current Year**

### Location: Admissions Page (`/director/admissions` or `/staff/admissions`)

The director can set any academic year as the current year:

#### **Process:**
1. **Dropdown Selection**: Director selects from available academic years
2. **API Call**: Triggers PUT request to `/api/admissions/settings`
3. **System Update**: Updates `systemConfig/academicPeriod`

### API Endpoint: `PUT /api/admissions/settings`

```typescript
// Request body
{
  year: "document-id-of-academic-year",
  userId: "director-user-id"
}

// What happens:
// 1. Validates document exists in academic-years collection
// 2. Gets display name from the document
// 3. Updates systemConfig/academicPeriod
```

### SystemConfig Update:
```javascript
// systemConfig/academicPeriod document
{
  currentAcademicYearId: "document-id",
  currentAcademicYear: "2027/2028 Academic Year",
  currentSemesterId: null,
  currentSemester: null,
  lastUpdated: Timestamp,
  updatedBy: "director-user-id"
}
```

## 🎯 **Step 4: Centralized System Propagation**

### Real-time Updates Across All Modules:

#### **1. Academic Affairs Portal**
- ✅ Admissions page shows new current year
- ✅ Course management uses new year
- ✅ Staff management reflects new year
- ✅ Results and transcripts use new year

#### **2. Student Portal**
- ✅ Dashboard displays current academic year
- ✅ Course registration filters by current year
- ✅ Grades display for current year
- ✅ Academic records show current year

#### **3. Lecturer Platform**
- ✅ Course assignments use current year
- ✅ Grade submissions for current year
- ✅ Academic calendar reflects new year

#### **4. Fees Portal**
- ✅ Fee calculations for current year
- ✅ Payment tracking by academic year
- ✅ Financial reports for current year

## 🎯 **Step 5: Automatic Status Management**

### When Setting as Active:

```typescript
// If setting a year as "active":
if (editYearData.status === "active") {
  // 1. Deactivate all other years
  const yearsToUpdate = academicYears
    .filter(y => y.id !== editYearData.id && y.status === "active")
    .map(y => y.id);
    
  for (const yearId of yearsToUpdate) {
    await AcademicYearsService.update(yearId, { status: "inactive" });
  }
  
  // 2. Update systemConfig
  await updateSystemAcademicPeriod(
    editYearData.id,
    academicYearString,
    activeSemester?.id || null,
    activeSemester?.name || null,
    auth.currentUser?.uid || "unknown"
  );
}
```

## 🎯 **Step 6: Cross-Module Synchronization**

### Real-time Context Updates:

#### **Academic Context Provider**
```typescript
// All components using useAcademic() get updated:
const { currentAcademicYear, academicYears } = useAcademic();

// Automatically reflects:
// - New academic year in dropdown
// - Current year status
// - Available years list
```

#### **System Config Provider**
```typescript
// Student portal and other modules:
const { currentAcademicYear, currentSemester } = useSystemConfig();

// Real-time updates via Firestore onSnapshot
useEffect(() => {
  const configRef = doc(db, "systemConfig", "academicPeriod");
  const unsubscribe = onSnapshot(configRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      setConfig({
        currentAcademicYear: data.currentAcademicYear,
        currentAcademicYearId: data.currentAcademicYearId,
        // ... other fields
      });
    }
  });
  
  return () => unsubscribe();
}, []);
```

## 🎯 **Step 7: Data Consistency Checks**

### Automatic Validation:

#### **Document ID Verification**
```typescript
// API validates document exists before setting as current
const yearRef = adminDb.collection('academic-years').doc(year);
const yearDoc = await yearRef.get();

if (!yearDoc.exists) {
  return NextResponse.json(
    { success: false, error: 'Academic year not found' },
    { status: 404 }
  );
}
```

#### **Status Consistency**
```typescript
// Ensures only one year is active at a time
if (editYearData.status === "active") {
  // Deactivate others first
  await deactivateOtherYears(editYearData.id);
}
```

## 🎯 **Step 8: Impact on Existing Data**

### What Gets Updated:

#### **Admissions**
- ✅ New applications use current academic year
- ✅ Admission status for current year
- ✅ Application tracking by year

#### **Course Registration**
- ✅ Students register for current year courses
- ✅ Course availability by academic year
- ✅ Registration periods for current year

#### **Grades and Results**
- ✅ Grade submissions for current year
- ✅ Transcript generation for current year
- ✅ Academic progression tracking

#### **Financial Records**
- ✅ Fee calculations for current year
- ✅ Payment tracking by academic year
- ✅ Financial reporting by year

## 🎯 **Step 9: Fallback and Error Handling**

### Graceful Degradation:

#### **If systemConfig is missing:**
```typescript
// Fallback to current calendar year
const currentYear = new Date().getFullYear();
const fallbackYear = `${currentYear}/${currentYear + 1}`;
```

#### **If academic year document is missing:**
```typescript
// API returns error with specific message
{ success: false, error: 'Academic year not found' }
```

#### **If multiple active years exist:**
```typescript
// System automatically deactivates others
// Keeps only the most recently set active year
```

## 🎯 **Step 10: Verification and Testing**

### How to Verify the Process:

#### **1. Check Database**
```bash
node scripts/debug-academic-year-issue.js
```

#### **2. Test Frontend**
- Go to admissions page
- Try setting different academic years
- Verify dropdown shows all available years

#### **3. Check API**
- Test PUT requests to `/api/admissions/settings`
- Verify systemConfig updates correctly

#### **4. Cross-Module Testing**
- Check student portal reflects new year
- Verify lecturer platform uses current year
- Confirm fees portal shows correct year

## 🎯 **Summary**

When the director sets a new academic year:

1. **✅ Creates** new academic year document in Firebase
2. **✅ Updates** systemConfig with new current year
3. **✅ Propagates** changes across all modules in real-time
4. **✅ Maintains** data consistency and validation
5. **✅ Provides** fallback mechanisms for reliability
6. **✅ Ensures** single source of truth across the entire system

The centralized academic year system ensures that any change made by the director immediately affects all parts of the UCAES application, maintaining consistency and providing a seamless user experience across all modules.

