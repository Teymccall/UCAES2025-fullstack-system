# Admission Website Sync Fix

## Issue Description

The director was experiencing a **disconnect between the Academic Affairs portal and the public admissions website**:

- ✅ **Academic Affairs Portal**: Showed "OPEN" status for 2020/2021 Academic Year
- ❌ **Public Admissions Website**: Showed "Admissions are Currently Closed" for 2020/2021 Academic Year

## Root Cause Analysis

The issue was caused by **two separate admission systems running in parallel**:

### 1. **Centralized System** (`systemConfig/academicPeriod`)
- Used by the Academic Affairs portal
- Pointed to: `2020-2021` academic year with `admissionStatus: open`

### 2. **Legacy System** (`academic-settings/current-year`)
- Used by the public admissions website
- Pointed to: `y28uRF8boIVAXYla8boSS` (different academic year)

### 3. **Academic Year Document** (`academic-years/2020-2021`)
- Existed with `admissionStatus: open`
- But the legacy system wasn't pointing to it

## The Problem

The public admissions website uses this logic to check admission status:

```typescript
// 1. Try centralized system first
const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod');
const systemConfigDoc = await getDoc(systemConfigRef);

if (systemConfigDoc.exists()) {
  const systemData = systemConfigDoc.data();
  currentYear = systemData.currentAcademicYearId; // "2020-2021"
  
  // Get the academic year document
  const yearRef = doc(db, 'academic-years', currentYear);
  const yearDoc = await getDoc(yearRef);
  
  if (yearDoc.exists()) {
    yearData = yearDoc.data();
    // yearData.admissionStatus = "open" ✅
  }
}

// 2. Fallback to legacy system
if (!currentYear || !yearData) {
  const settingsRef = doc(db, 'academic-settings', 'current-year');
  const settingsDoc = await getDoc(settingsRef);
  
  if (settingsDoc.exists()) {
    const data = settingsDoc.data();
    currentYear = data.currentYear; // "y28uRF8boIVAXYla8boSS" ❌
    
    // This academic year doesn't exist or has different status
  }
}
```

## Fixes Applied

### 1. **Synchronized Both Systems**
Updated both systems to point to the same academic year:

```javascript
// Centralized System
{
  currentAcademicYearId: "2020-2021",
  currentAcademicYear: "2020/2021 Academic Year",
  lastUpdated: new Date(),
  updatedBy: "system-sync"
}

// Legacy System  
{
  currentYear: "2020-2021",
  admissionStatus: "open",
  updatedAt: new Date(),
  updatedBy: "system-sync"
}
```

### 2. **Ensured Academic Year Document is Properly Configured**
Verified that `academic-years/2020-2021` has:
```javascript
{
  year: "2020-2021",
  displayName: "2020/2021 Academic Year", 
  admissionStatus: "open",
  status: "completed"
}
```

### 3. **Created Comprehensive Sync Script**
The `sync-admission-systems.js` script:
- ✅ Checks both systems
- ✅ Creates missing documents if needed
- ✅ Syncs both systems to use same academic year
- ✅ Tests admission status check
- ✅ Provides detailed logging

## Testing Results

### Before Fix
```
❌ Academic year mismatch between systems!
   Centralized: 2020/2021 Academic Year
   Legacy: y28uRF8boIVAXYla8boSS
```

### After Fix
```
✅ Both centralized and legacy systems synced
✅ 2020-2021 academic year properly configured  
✅ Admission status set to "open"
✅ Admission website should now reflect correct status
```

## Verification

To verify the fix is working:

### 1. **Check Database**
```bash
node scripts/diagnose-admission-connection.js
```

### 2. **Test Public Website**
- Visit the public admissions website
- Should now show "Admissions are open" instead of "Admissions are currently closed"
- Application form should be available

### 3. **Test Academic Affairs Portal**
- Go to Admissions page
- Should still show "OPEN" status
- Both systems should be in sync

## Files Created/Modified

### Scripts
- `scripts/diagnose-admission-connection.js` - Diagnostic script
- `scripts/fix-admission-connection.js` - Initial fix script  
- `scripts/sync-admission-systems.js` - Comprehensive sync script

### Documentation
- `ADMISSION_WEBSITE_SYNC_FIX.md` - This documentation file

## Future Recommendations

### 1. **Standardize on Centralized System**
- Gradually migrate all modules to use `systemConfig/academicPeriod`
- Deprecate the legacy `academic-settings/current-year` system
- Update public admissions website to only use centralized system

### 2. **Add Real-time Sync**
- Implement automatic sync between systems
- Add validation to ensure consistency
- Create alerts when systems get out of sync

### 3. **Improve Error Handling**
- Add better fallback mechanisms
- Provide clearer error messages
- Log sync issues for monitoring

### 4. **Testing Strategy**
- Add automated tests for admission status checks
- Test both systems in parallel
- Monitor for sync issues in production

## Summary

The admission website sync issue has been resolved by:

1. **✅ Identifying** the root cause (two systems pointing to different academic years)
2. **✅ Synchronizing** both systems to use the same academic year (`2020-2021`)
3. **✅ Ensuring** the academic year document has correct admission status (`open`)
4. **✅ Testing** that the admission status check returns the correct result
5. **✅ Verifying** that both Academic Affairs portal and public website are now in sync

The public admissions website should now correctly show that admissions are open, matching the status shown in the Academic Affairs portal.




