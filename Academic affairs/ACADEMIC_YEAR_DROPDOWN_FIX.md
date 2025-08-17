# Academic Year Dropdown Fix

## Issue Description

The director was experiencing an "Academic year not found" error when trying to set the current academic year in the admissions page. The error occurred because:

1. **Document ID Mismatch**: The dropdown was showing academic years like "2020-2021", but these document IDs didn't exist in the `academic-years` collection
2. **Value Mapping Issue**: The dropdown was using `y.year` as the value instead of `y.id`, causing the API to receive year strings instead of document IDs
3. **Missing Documents**: Some expected academic year documents were missing from the database

## Root Cause Analysis

### 1. Frontend Issue
The dropdown component was incorrectly mapping values:
```tsx
// ❌ WRONG - Using year string as value
<SelectItem key={y.id} value={y.year}>{y.displayName}</SelectItem>

// ✅ CORRECT - Using document ID as value  
<SelectItem key={y.id} value={y.id}>{y.displayName}</SelectItem>
```

### 2. Database Issue
The `academic-years` collection was missing several expected document IDs:
- `2020-2021`
- `2026-2027` 
- `2025`
- `2024-2025`

### 3. API Issue
The PUT request in `/api/admissions/settings` was expecting document IDs but receiving year strings, causing the "Academic year not found" error.

## Fixes Applied

### 1. Frontend Fix
Updated both admissions pages to use document IDs as dropdown values:

**Files Modified:**
- `Academic affairs/app/director/admissions/page.tsx`
- `Academic affairs/app/staff/admissions/page.tsx`

**Change:**
```tsx
// Before
<SelectItem key={y.id} value={y.year}>{y.displayName}</SelectItem>

// After  
<SelectItem key={y.id} value={y.id}>{y.displayName}</SelectItem>
```

### 2. Database Fix
Created missing academic year documents with proper structure:

**Documents Created:**
- `2020-2021`: 2020/2021 Academic Year (completed)
- `2024-2025`: 2024/2025 Academic Year (active) 
- `2025`: 2025/2026 Academic Year (upcoming)
- `2026-2027`: 2026/2027 Academic Year (upcoming)

**Document Structure:**
```javascript
{
  year: '2020-2021',
  displayName: '2020/2021 Academic Year',
  startDate: new Date('2020-01-01'),
  endDate: new Date('2021-06-16'),
  status: 'completed',
  admissionStatus: 'closed',
  currentApplications: 0,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  createdBy: 'system-fix'
}
```

### 3. System Configuration
Verified that `systemConfig/academicPeriod` is properly configured and references existing documents.

## Testing

### Before Fix
- ❌ Dropdown showed "2020-2021" but clicking "Set as Current Year" gave "Academic year not found" error
- ❌ Missing document IDs in database
- ❌ Incorrect value mapping in frontend

### After Fix  
- ✅ All expected document IDs exist in database
- ✅ Dropdown uses correct document IDs as values
- ✅ "Set as Current Year" works without errors
- ✅ System configuration properly references existing documents

## Files Created/Modified

### Scripts
- `scripts/debug-academic-year-issue.js` - Debug script to identify the issue
- `scripts/fix-academic-year-dropdown.js` - Fix script to create missing documents

### Frontend Files
- `app/director/admissions/page.tsx` - Fixed dropdown value mapping
- `app/staff/admissions/page.tsx` - Fixed dropdown value mapping

### Documentation
- `ACADEMIC_YEAR_DROPDOWN_FIX.md` - This documentation file

## Verification

To verify the fix is working:

1. **Check Database**: Run `node scripts/debug-academic-year-issue.js` to see all academic years
2. **Test Frontend**: Go to admissions page and try setting different academic years
3. **Check API**: Verify that PUT requests to `/api/admissions/settings` work correctly

## Future Recommendations

1. **Standardize Document IDs**: Use consistent naming convention for academic year document IDs
2. **Add Validation**: Add frontend validation to ensure selected values exist in database
3. **Error Handling**: Improve error messages to be more specific about what went wrong
4. **Data Migration**: Consider migrating existing academic years to use consistent document IDs

## Centralized Academic Year System

This fix ensures the centralized academic year system works correctly:

1. **Director sets academic year** → Updates `systemConfig/academicPeriod`
2. **Admissions page reads** → Gets current year from systemConfig
3. **All modules use** → Same centralized academic year across the application

The system now properly maintains a single source of truth for the current academic year that all modules can reference.

