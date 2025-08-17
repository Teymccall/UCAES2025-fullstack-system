# 🧪 Testing Guide: Registration Restriction System

## Overview
This guide will help you test the new registration restriction system that prevents students from registering for courses multiple times in the same semester.

## 🚀 Quick Start Testing

### 1. Start the Development Server
```bash
cd "new student portal"
npm run dev
```

### 2. Access the Course Registration Page
- Navigate to: `http://localhost:3000/course-registration`
- Login as a student user

## 📋 Test Scenarios

### Test Case 1: First-Time Registration
**Objective**: Verify that a student can register when they have no existing registration

**Steps**:
1. Login as a student who has never registered for courses
2. Navigate to Course Registration page
3. **Expected Result**: 
   - ✅ Course selection interface is visible
   - ✅ Submit button is enabled
   - ✅ No restriction messages displayed
   - ✅ Can select courses and register

### Test Case 2: Duplicate Registration Prevention
**Objective**: Verify that a student cannot register twice for the same semester

**Steps**:
1. Complete a course registration for Semester 1
2. Try to register again for Semester 1
3. **Expected Result**:
   - ❌ Registration form shows restriction message
   - ❌ Submit button is disabled
   - ✅ Current registration details are displayed
   - ✅ Clear explanation of why registration is blocked

### Test Case 3: Different Semester Registration
**Objective**: Verify that a student can register for a different semester

**Steps**:
1. Have an existing registration for Semester 1
2. Try to register for Semester 2
3. **Expected Result**:
   - ✅ Course selection interface is visible
   - ✅ Submit button is enabled
   - ✅ No restriction messages displayed
   - ✅ Can select courses and register

### Test Case 4: Pending Registration Handling
**Objective**: Verify that pending registrations block new registrations

**Steps**:
1. Create a registration with 'pending' status
2. Try to register again for the same semester
3. **Expected Result**:
   - ❌ Registration form shows restriction message
   - ❌ Submit button is disabled
   - ✅ Pending status is clearly indicated
   - ✅ Message explains need to wait for approval

## 🔧 Manual Testing Steps

### Step 1: Check Registration Eligibility
1. Open browser console (F12)
2. Run the frontend test script:
```javascript
// Copy and paste the content from scripts/test-frontend-registration.js
```

### Step 2: Test UI Elements
1. **Registration Restriction Alert**: Look for red alert box with restriction message
2. **Disabled Submit Button**: Button should show "Registration Not Allowed"
3. **Existing Registration Display**: Blue box showing current registration details
4. **Course Selection**: Checkboxes should be disabled if registration is blocked

### Step 3: Test Course Selection
1. **Search Functionality**: Try searching for courses
2. **Filtering**: Test course type filters (Core/Elective)
3. **Tabs**: Switch between All/Core/Elective tabs
4. **Credit Calculation**: Verify total credits update when selecting courses

### Step 4: Test Registration Flow
1. **Valid Registration**: Complete a registration successfully
2. **Duplicate Attempt**: Try to register again for same semester
3. **Different Semester**: Register for a different semester
4. **Error Handling**: Verify error messages are clear and helpful

## 🐛 Debugging Common Issues

### Issue 1: Registration Restriction Not Working
**Symptoms**: Student can register multiple times for same semester

**Debug Steps**:
1. Check browser console for errors
2. Verify `canStudentRegisterForSemester` function is called
3. Check Firestore for existing registrations
4. Verify student ID matching logic

**Solution**: Ensure the eligibility check is properly integrated in the component

### Issue 2: UI Not Updating
**Symptoms**: Restriction message not showing despite existing registration

**Debug Steps**:
1. Check React state updates
2. Verify `useEffect` dependencies
3. Check component re-rendering
4. Verify error state management

**Solution**: Ensure state updates trigger component re-renders

### Issue 3: Course Loading Issues
**Symptoms**: No courses displayed or courses not filtering correctly

**Debug Steps**:
1. Check `getAvailableCoursesForStudent` function
2. Verify program ID resolution
3. Check course data structure
4. Verify filtering logic

**Solution**: Ensure course loading and filtering functions work correctly

## 📊 Expected Test Results

### Successful Test Run
```
🧪 Testing Frontend Registration Restriction System...

📋 Test 1: Checking UI Elements
✅ Registration restriction alert found
✅ Disabled submit button found
✅ Existing registration display found

📋 Test 2: Simulating Registration Attempt
❌ Submit button is disabled - cannot test registration

📋 Test 3: Testing Course Selection
❌ No course checkboxes found

📋 Test 4: Testing Filtering Functionality
✅ Search input found
✅ Course type filter found

📋 Test 5: Testing Tab Functionality
✅ Found 3 tabs

✅ All frontend tests completed!
```

### Failed Test Run
```
🧪 Testing Frontend Registration Restriction System...

📋 Test 1: Checking UI Elements
❌ Registration restriction alert not found
❌ Disabled submit button not found
❌ Existing registration display not found

📋 Test 2: Simulating Registration Attempt
✅ Submit button is enabled - attempting registration

📋 Test 3: Testing Course Selection
✅ Found 5 course checkboxes

📋 Test 4: Testing Filtering Functionality
✅ Search input found
✅ Course type filter found

📋 Test 5: Testing Tab Functionality
✅ Found 3 tabs

✅ All frontend tests completed!
```

## 🔍 Database Testing

### Check Existing Registrations
```javascript
// In browser console
// Check if student has existing registrations
const studentId = 'your-student-id';
const academicYear = '2024/2025';
const semester = 1;

// This should return existing registration if any
fetch(`/api/students/${studentId}/registrations?academicYear=${academicYear}&semester=${semester}`)
  .then(res => res.json())
  .then(data => console.log('Existing registrations:', data));
```

### Create Test Registration
```javascript
// Create a test registration to test restriction
const testRegistration = {
  studentId: 'test-student',
  academicYear: '2024/2025',
  semester: 1,
  courses: [{ id: 'test-course', code: 'TEST101', title: 'Test Course', credits: 3 }],
  status: 'pending'
};

// This should fail if restriction is working
fetch('/api/registrations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testRegistration)
})
.then(res => res.json())
.then(data => console.log('Registration result:', data));
```

## ✅ Success Criteria

The registration restriction system is working correctly if:

1. **✅ Students cannot register twice for the same semester**
2. **✅ Clear error messages are displayed**
3. **✅ UI is properly disabled when restrictions apply**
4. **✅ Students can register for different semesters**
5. **✅ Pending registrations are handled correctly**
6. **✅ Existing registration details are shown**
7. **✅ System gracefully handles errors**

## 🚨 Known Issues

1. **TypeScript Errors**: Some type mismatches in the academic service (non-blocking)
2. **Firebase Configuration**: Ensure proper Firebase setup for testing
3. **Student Data**: Verify student has proper program and level data

## 📞 Support

If you encounter issues during testing:

1. Check the browser console for error messages
2. Verify Firebase connection and permissions
3. Ensure student data is properly configured
4. Check the network tab for failed API calls

## 🎯 Next Steps

After successful testing:

1. **Deploy to Production**: Test in production environment
2. **User Training**: Train students on new registration process
3. **Monitor Usage**: Track registration patterns and issues
4. **Gather Feedback**: Collect user feedback for improvements
