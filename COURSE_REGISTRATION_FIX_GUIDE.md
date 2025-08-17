# Course Registration Fix Guide

## Problem Identified
The director's course registration page is not showing courses because the programs are missing their `coursesPerLevel` structure, which maps courses to specific levels and semesters.

## Root Cause Analysis

1. **Database Structure Issue**: Programs in Firebase are missing the `coursesPerLevel` field
2. **Course Mapping Missing**: Courses exist in the curriculum collection but aren't properly linked to programs
3. **Fallback Logic**: The getProgramCourses function falls back to filtering by programId, but courses don't have the correct programId field

## Solution Steps

### Step 1: Verify Current Data Structure

From our analysis, we have:
- ✅ Programs exist (BSc. Sustainable Agriculture, BSc. Environmental Science and Management)
- ✅ Courses exist in curriculum collection (41+ courses for each program)
- ❌ Missing `coursesPerLevel` structure in program documents
- ❌ Courses don't have proper `programId` field

### Step 2: Manual Fix Required

Since Firebase access is restricted, we need to manually update the program documents. Here's the structure needed:

#### Required Program Structure
```javascript
{
  "coursesPerLevel": {
    "100": {
      "First Semester": {
        "all": {
          "Regular": ["AGM 151", "AGM 153", "AGM 155", "AGM 157", "AGM 159", "AGM 161", "AGM 163", "AGM 165"],
          "Weekend": ["AGM 151", "AGM 153", "AGM 155", "AGM 157", "AGM 159", "AGM 161", "AGM 163", "AGM 165"]
        }
      },
      "Second Semester": {
        "all": {
          "Regular": ["AGM 152", "AGM 154", "AGM 156", "AGM 158", "AGM 160", "AGM 162", "AGM 164", "AGM 166"],
          "Weekend": ["AGM 152", "AGM 154", "AGM 156", "AGM 158", "AGM 160", "AGM 162", "AGM 164", "AGM 166"]
        }
      }
    },
    "200": {
      "First Semester": {
        "all": {
          "Regular": ["AGM 251", "AGM 253", "AGM 255", "AGM 257", "AGM 259", "AGM 261", "AGM 263"],
          "Weekend": ["AGM 251", "AGM 253", "AGM 255", "AGM 257", "AGM 259", "AGM 261", "AGM 263"]
        }
      },
      "Second Semester": {
        "all": {
          "Regular": ["AGM 252", "AGM 254", "AGM 256", "AGM 258", "AGM 260", "AGM 262"],
          "Weekend": ["AGM 252", "AGM 254", "AGM 256", "AGM 258", "AGM 260", "AGM 262"]
        }
      }
    },
    "300": {
      "First Semester": {
        "all": {
          "Regular": ["AGM 351", "AGM 353", "AGM 355", "AGM 357", "AGM 359", "AGM 361"],
          "Weekend": ["AGM 351", "AGM 353", "AGM 355", "AGM 357", "AGM 359", "AGM 361"]
        }
      },
      "Second Semester": {
        "all": {
          "Regular": ["AGM 352", "AGM 354", "AGM 356", "AGM 358", "AGM 360", "AGM 362", "AGM 364", "AGM 366"],
          "Weekend": ["AGM 352", "AGM 354", "AGM 356", "AGM 358", "AGM 360", "AGM 362", "AGM 364", "AGM 366"]
        }
      }
    },
    "400": {
      "First Semester": {
        "all": {
          "Regular": ["AGM 451", "AGM 453", "AGM 455"],
          "Weekend": ["AGM 451", "AGM 453", "AGM 455"]
        }
      },
      "Second Semester": {
        "all": {
          "Regular": ["AGM 452", "AGM 454"],
          "Weekend": ["AGM 452", "AGM 454"]
        }
      }
    }
  }
}
```

### Step 3: Firebase Console Updates

1. **Open Firebase Console**: Go to https://console.firebase.google.com
2. **Navigate to Firestore**: Select your project → Firestore Database
3. **Find Programs**: Go to `academic-programs` collection
4. **Update Each Program**: Add the `coursesPerLevel` field to each program document

#### Programs to Update:

**BSc. Sustainable Agriculture** (ID: 8FFH2FkxK18Rd9ONr6RJ)
- Add coursesPerLevel with AGM course codes

**BSc. Environmental Science and Management** (ID: your-environmental-science-id)
- Add coursesPerLevel with ESM course codes

**BSc. Aquaculture and Water Resources Management** (ID: your-aquaculture-id)
- Add coursesPerLevel with AQM course codes

### Step 4: Alternative Fix - Update Course Context

If you can't update the program structure, modify the course-context.tsx fallback logic:

```javascript
// In getProgramCourses function, improve the fallback
const getProgramCourses = (programId: string, level: string, semester: string, year?: string, studyMode?: string): Course[] => {
  if (!programId) return [];

  const program = programs.find(p => p.id === programId)
  // ... existing structured mapping logic ...

  // Enhanced fallback: Search by program name instead of programId
  if (codesFromMapping.size === 0) {
    const programName = program?.name || '';
    let filteredCourses = courses.filter(course => {
      // Match by program name in course.program field
      if (course.program !== programName) return false;
      
      const levelNum = parseInt(level, 10);
      if (!isNaN(levelNum)) {
        if (course.level !== levelNum) return false;
      }
      
      const sKey = normalizeSemester(semester);
      const courseSem = normalizeSemester(String(course.semester));
      if (courseSem !== sKey) return false;
      
      return true;
    });
    return filteredCourses;
  }
  
  return result;
}
```

### Step 5: Test the Fix

1. **Navigate to Director Course Registration**: `/director/course-registration`
2. **Search for a student**: Enter registration number
3. **Select program**: Choose from dropdown
4. **Select level and semester**: Should now show available courses
5. **Verify course display**: Courses should appear in the table

### Step 6: Debug Commands

If courses still don't appear, use these browser console commands:

```javascript
// Check if programs have coursesPerLevel
console.log('Programs:', programs);
console.log('Selected program:', selectedProgram);
console.log('Available courses:', availableCourses);

// Check course data structure
console.log('All courses:', courses);
console.log('Course sample:', courses[0]);
```

### Quick Manual Test

1. **Open browser dev tools** (F12)
2. **Go to Network tab** and refresh the page
3. **Check for any failed requests** to Firestore
4. **Check Console tab** for error messages
5. **Verify data structure** matches expected format

## Expected Result

After implementing these fixes, the director's course registration page should:
- ✅ Show programs in the dropdown
- ✅ Display levels based on selected program
- ✅ Show semesters based on selected level
- ✅ Display available courses for the selected criteria
- ✅ Allow course selection and registration

## Troubleshooting

If issues persist:
1. Check browser console for errors
2. Verify program IDs match between student records and program documents
3. Ensure all course codes exist in the curriculum collection
4. Check Firestore security rules allow read access to programs and courses