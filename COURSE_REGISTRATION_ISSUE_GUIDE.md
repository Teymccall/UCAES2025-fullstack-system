# Course Registration Issue: "No courses found" Error

## Problem Description

When attempting to register courses for a student in the director's course registration page, you receive the error:
> "no course found for the selected criteria. try add courses from this program level and semester"

## Root Cause Analysis

This error occurs when the system cannot find any courses matching the selected criteria (program + level + semester combination). The system uses two methods to find courses:

1. **Structured Mapping** (Preferred): Looks for predefined course mappings in program data
2. **Catalog Filtering** (Fallback): Filters courses by programId, level, and semester

Both methods return empty results, indicating no courses are configured for the selected combination.

## Diagnostic Steps

### 1. Run the Diagnostic Tool
```bash
node diagnose-course-registration.js
```

This will show you:
- Available programs and their IDs
- Course distribution by program/level/semester
- Missing program references
- Invalid course data

### 2. Check Specific Program Courses
```bash
node check-courses.js "BSc. Environmental Science and Management"
```

### 3. Verify Database Structure
The system expects courses in the `academic-courses` collection with these fields:
- `programId` (must match a program ID)
- `level` (100, 200, 300, 400, 500, 600)
- `semester` (1, 2, or 3)
- `status` (should be 'active')

## Quick Fix Solutions

### Option 1: Auto-populate Missing Courses
```bash
node fix-missing-courses.js
```

This script will:
- Add sample courses for common programs (Environmental Science, Aquaculture)
- Ensure courses exist for levels 100-400, semesters 1-2
- Set up proper program-course relationships

### Option 2: Manual Course Addition

If you need to add specific courses manually:

1. **Find your program ID**:
```javascript
// Run this in browser console or create a script
const programsRef = collection(db, 'academic-programs');
const programsSnapshot = await getDocs(programsRef);
programsSnapshot.forEach(doc => {
  console.log(`${doc.data().name}: ${doc.id}`);
});
```

2. **Add courses using the enhanced course management**:
```javascript
import { EnhancedCourseManagement } from './Academic affairs/lib/enhanced-course-management.js';

await EnhancedCourseManagement.bulkAssignCoursesToProgram('your-program-id', [
  { code: "ESM 101", title: "Introduction to Environmental Science", credits: 3, level: 100, semester: 1, courseType: "core" },
  { code: "ESM 102", title: "Environmental Systems", credits: 3, level: 100, semester: 2, courseType: "core" },
  // Add more courses...
], "2024/2025");
```

### Option 3: Use Existing Scripts

1. **Seed Programs and Courses**:
```bash
cd "Academic affairs/scripts"
node seed-programs-courses.js
```

2. **Verify Course Setup**:
```bash
cd "Academic affairs/scripts"
node verify-courses.js
```

## Common Issues and Solutions

### Issue 1: Program ID Mismatch
**Problem**: Courses have wrong programId
**Solution**: Ensure course.programId matches exactly with program document ID

### Issue 2: Invalid Level/Semester Values
**Problem**: Courses have level as string or semester as "First" instead of 1
**Solution**: Standardize values:
- Level: 100, 200, 300, 400, 500, 600 (integers)
- Semester: 1, 2, 3 (integers)

### Issue 3: Missing Program-Course Assignment
**Problem**: Courses exist but aren't assigned to programs
**Solution**: Use program assignment interface in director/courses/program-assignment

### Issue 4: Inactive Courses
**Problem**: Courses exist but status is not 'active'
**Solution**: Update course status to 'active'

## Testing Your Fix

After applying fixes:

1. **Refresh the registration page**
2. **Select a student** with a valid program
3. **Choose appropriate level and semester**
4. **Verify courses appear in the list**

## Verification Commands

### Check specific program courses:
```bash
node diagnose-course-registration.js
```

### Test course loading:
```javascript
// In browser console (when registration page is open)
console.log("Available programs:", programOptions);
console.log("Testing course load...");
loadAvailableCourses('program-id', '100', '1');
```

## Program-Specific Instructions

### Environmental Science and Management
- Ensure program exists with name "BSc. Environmental Science and Management"
- Add courses for levels 100-400, semesters 1-2
- Use ESM prefix for course codes

### Aquaculture and Water Resources
- Ensure program exists with name "BSc. Aquaculture and Water Resources Management"
- Add courses for levels 100-400, semesters 1-2
- Use AQS prefix for course codes

### Other Programs
- Follow the same pattern with appropriate course prefixes
- Ensure consistent naming across program names and course codes

## Emergency Fallback

If all else fails, you can temporarily enable debug mode to see what's happening:

1. **Enable debug logging** in course registration page:
   - Add `?debug=true` to URL
   - Check browser console for detailed logs

2. **Manual course override**:
   - Use browser console to add courses directly:
   ```javascript
   setAvailableCourses([
     { id: "temp-1", code: "ESM 101", title: "Test Course", credits: 3, level: 100, semester: 1 }
   ]);
   ```

## Support Resources

- **Diagnostic Script**: `diagnose-course-registration.js`
- **Fix Script**: `fix-missing-courses.js`
- **Course Management**: `Academic affairs/lib/enhanced-course-management.js`
- **Original Scripts**: `Academic affairs/scripts/`

## Next Steps

1. Run the diagnostic tool to identify specific issues
2. Apply the appropriate fix based on your findings
3. Test course registration with a sample student
4. Document any additional courses needed for your specific programs

If issues persist after following these steps, check the browser console for detailed error messages and verify all database collections are properly populated.