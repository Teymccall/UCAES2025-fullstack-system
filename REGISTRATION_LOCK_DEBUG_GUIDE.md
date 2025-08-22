# 🔒 Course Registration Lock - Debug Guide

## Issue Fixed
**Problem**: Student with unpaid fees could still access the "Register Courses" tab
**Student ID**: iJ5wJl9oW6rbMVHMZJzP (JUDITH STLYES)
**Registration Number**: UCAES20250022

## Root Causes Identified & Fixed

### 1. **Default State Issue** ✅
- **Problem**: Tab was unlocked by default (`canRegister = true`)
- **Fix**: Changed default to locked (`canRegister = false`) until verification completes

### 2. **Missing Eligibility Logs** ✅
- **Problem**: Eligibility check wasn't running or was failing silently
- **Fix**: Added comprehensive logging and error handling

### 3. **Academic Year Mismatch** ⚠️
- **Problem**: System using "2020-2021" instead of current year
- **Impact**: Fee calculations may be incorrect
- **Fix Required**: Update Firebase `systemConfig/academicPeriod` document

### 4. **Enhanced Error Handling** ✅
- **Problem**: Fee check failures allowed registration
- **Fix**: Strict blocking with clear error messages and timeout protection

## Current Fixes Applied

### File: `app/course-registration/page.tsx`
```javascript
// Default to locked state
const [canRegister, setCanRegister] = useState<boolean>(false)
const [registerLockReason, setRegisterLockReason] = useState<string>("Checking fee payment status...")

// Enhanced logging
console.log("🚀 Starting eligibility check useEffect")
console.log("🔍 Checking registration eligibility for student:", student?.id)
console.log("📅 Academic Year:", academicYear, "Semester:", semester)

// Timeout protection
const eligibilityPromise = canStudentRegisterForSemester(student.id, academicYear, semesterNumber)
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error("Eligibility check timeout")), 10000)
})
const eligibility = await Promise.race([eligibilityPromise, timeoutPromise])
```

### File: `lib/academic-service.ts`
```javascript
// Enhanced fee checking logs
console.log(`💵 Fee check result for student ${studentId}:`, {
  semesterFees,
  balance: semesterFees?.balance,
  hasFees: !!semesterFees,
  studentData: { registrationNumber, studentIndexNumber },
  altIds
});

// Strict error handling
catch (feeError) {
  return {
    canRegister: false,
    reason: "Fee payment verification failed. Please visit the Fees Portal to ensure your fees are paid, then try again."
  };
}
```

## Testing Instructions

### 1. **Check Console Logs**
When you refresh the course registration page, you should see:
```
🚀 Starting eligibility check useEffect
Student: iJ5wJl9oW6rbMVHMZJzP
System Config: {currentAcademicYear: "2020-2021", currentSemester: "Second Semester"}
🔍 Checking registration eligibility for student: iJ5wJl9oW6rbMVHMZJzP
📅 Academic Year: 2020-2021, Semester: Second Semester
🔢 Normalized semester number: 2
✅ Found student in student-registrations: [student details]
👨‍🎓 Student iJ5wJl9oW6rbMVHMZJzP: Programme type regular, Level 100
💵 Fee check result for student iJ5wJl9oW6rbMVHMZJzP: [fee details]
✅ Eligibility check result: {canRegister: false, reason: "..."}
🔒 Registration locked: [reason]
```

### 2. **Expected Behavior**
- **Tab State**: "Register Courses" tab should be **disabled** with lock icon
- **Lock Message**: Red notice should appear with fee payment instructions
- **Buttons**: "Go to Fees Portal" and "Check Again" buttons should be visible

### 3. **If Still Not Working**
Check these in browser console:
1. Is the eligibility check running? (Look for 🚀 emoji)
2. What's the fee check result? (Look for 💵 emoji)
3. Any JavaScript errors?

## Manual Academic Year Fix

**CRITICAL**: The system is using "2020-2021" academic year. To fix:

### Option 1: Firebase Console (Recommended)
1. Go to Firebase Console → Firestore Database
2. Navigate to collection: `systemConfig`
3. Open document: `academicPeriod`
4. Update fields:
   ```
   currentAcademicYear: "2024-2025"
   currentSemester: "First Semester"
   lastUpdated: [current timestamp]
   ```

### Option 2: Director Portal
1. Login as Director of Academic Affairs
2. Go to Academic Management
3. Set current academic year and semester
4. This will automatically update system config

## Verification Steps

### Step 1: Academic Year Check
```javascript
// In browser console on course registration page:
console.log("System Config:", systemConfig)
// Should show: {currentAcademicYear: "2024-2025", currentSemester: "First Semester"}
```

### Step 2: Fee Status Check
```javascript
// Look for this in console logs:
💵 Fee check result for student iJ5wJl9oW6rbMVHMZJzP: {
  semesterFees: {...},
  balance: [amount],
  hasFees: true/false
}
```

### Step 3: Registration Lock Status
```javascript
// Should see:
🔒 Registration locked: "Fees must be paid before course registration. You have an outstanding balance of ¢[amount]"
```

## Expected Final State

✅ **Tab Locked**: "Register Courses" tab disabled with lock icon
✅ **Clear Message**: Red notice explaining fee payment requirement
✅ **Action Buttons**: "Go to Fees Portal" and "Check Again" buttons
✅ **Real-time Updates**: Lock status updates when payments are made
✅ **Comprehensive Logging**: Detailed console logs for debugging

## Contact Support If...

- Console shows no eligibility check logs (🚀 missing)
- Fee check returns null or undefined
- Academic year is still "2020-2021" after update
- Tab remains unlocked despite unpaid fees

The system should now properly enforce fee payment before course registration!

