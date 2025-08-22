# 🧪 Course Registration Lock - Testing Checklist

## 🎯 **Test Objective**
Verify that student **JUDITH STLYES** (ID: `iJ5wJl9oW6rbMVHMZJzP`) with unpaid fees **cannot** access the "Register Courses" tab.

---

## 🔧 **Pre-Test Setup**

### ✅ **Fixes Applied**
- [x] Default state: Tab locked until verification (`canRegister = false`)
- [x] Enhanced debugging with emoji logs
- [x] Timeout protection (10 seconds)
- [x] Force Check button for manual testing
- [x] Prerequisites validation
- [x] System config loading check

---

## 🧪 **Test Steps**

### **Step 1: Open Course Registration Page**
1. Navigate to the student portal
2. Login as **JUDITH STLYES** (Registration: UCAES20250022)
3. Go to **Course Registration** page
4. **Open browser console** (Press F12)

### **Step 2: Check Debug Logs**
Look for these logs **in order**:

```
📊 System Config Changed: {currentAcademicYear: "2020-2021", currentSemester: "Second Semester"}
🚀 ELIGIBILITY CHECK USEEFFECT TRIGGERED
Student ID: iJ5wJl9oW6rbMVHMZJzP
Student object: {id: "iJ5wJl9oW6rbMVHMZJzP", surname: "STLYES", ...}
System Config: {currentAcademicYear: "2020-2021", ...}
System Config loading: false
⏳ Waiting for prerequisites: {hasStudentId: true, systemConfigLoading: false, systemConfigExists: true}
✅ Prerequisites met, running eligibility check
🔍 Checking registration eligibility for student: iJ5wJl9oW6rbMVHMZJzP
📅 Academic Year: 2020-2021, Semester: Second Semester
🔢 Normalized semester number: 2
✅ Found student in student-registrations: {...}
👨‍🎓 Student iJ5wJl9oW6rbMVHMZJzP: Programme type regular, Level 100
💵 Fee check result for student iJ5wJl9oW6rbMVHMZJzP: {balance: [amount], ...}
✅ Eligibility check result: {canRegister: false, reason: "Fees must be paid..."}
🔒 Registration locked: [reason]
```

### **Step 3: Verify UI State**
Check the page interface:

**✅ Expected Behavior:**
- [ ] "Register Courses" tab is **DISABLED** (grayed out)
- [ ] Lock icon (🔒) appears next to "Register Courses"
- [ ] Red notice card appears below tabs
- [ ] Notice shows: "Registration Locked" with fee payment message
- [ ] "Go to Fees Portal" button is visible
- [ ] "Check Again" button is visible
- [ ] "Force Check" button is visible

**❌ If Tab is Still Unlocked:**
- Tab is clickable and shows course list
- No lock icon visible
- No red notice appears

### **Step 4: Manual Force Check**
If automatic check didn't work:
1. Click the **"Force Check"** button in the red notice
2. Check console for: `🔄 Manual eligibility check triggered`
3. Look for: `🔄 Manual check result: {canRegister: false, ...}`
4. Verify tab becomes locked after manual check

---

## 🚨 **Troubleshooting**

### **Issue 1: No Debug Logs Appear**
**Symptoms:** Console is empty, no emoji logs
**Causes:** 
- useEffect not running
- JavaScript error preventing execution
- System config not loading

**Solutions:**
1. Check browser console for JavaScript errors
2. Refresh the page
3. Check if student is logged in properly

### **Issue 2: Missing Eligibility Check Logs**
**Symptoms:** See system config logs but no 🚀 or 🔍 logs
**Causes:**
- Prerequisites not met
- Student ID missing
- System config still loading

**Solutions:**
1. Look for `⏳ Waiting for prerequisites` log
2. Check what prerequisites are missing
3. Use Force Check button

### **Issue 3: Tab Still Unlocked**
**Symptoms:** Can click "Register Courses" tab, courses load
**Causes:**
- Eligibility check returned `canRegister: true`
- Fee check failed or returned no balance
- Academic year mismatch (2020-2021 vs 2024-2025)

**Solutions:**
1. Check `💵 Fee check result` in console
2. Update academic year in Firebase
3. Use Force Check button

### **Issue 4: Academic Year Problem**
**Symptoms:** Using "2020-2021" instead of current year
**Impact:** Fee calculations may be incorrect

**Fix Options:**
- **Firebase Console:** Update `systemConfig/academicPeriod` document
- **Director Portal:** Set current academic year through admin interface

---

## 📊 **Test Results**

### ✅ **PASS Criteria**
- [ ] All debug logs appear in correct order
- [ ] "Register Courses" tab is disabled with lock icon
- [ ] Red notice appears with clear fee payment message
- [ ] Force Check button works if needed
- [ ] Fee balance is correctly detected as > 0

### ❌ **FAIL Criteria**
- [ ] Tab remains clickable and unlocked
- [ ] No debug logs in console
- [ ] No red notice appears
- [ ] Can access course registration form

---

## 🎯 **Next Steps After Testing**

### **If Test PASSES:**
✅ Registration lock is working correctly!
- Student with unpaid fees cannot register
- Clear guidance provided to pay fees
- Real-time updates when payments are made

### **If Test FAILS:**
1. **Check console logs** to identify where it fails
2. **Use Force Check button** to trigger manual check
3. **Update academic year** in Firebase if needed
4. **Report specific error messages** for further debugging

---

## 🔄 **Quick Test Command**
```bash
# Run this to see the test checklist
node test-registration-lock.js
```

**Ready to test! 🚀**

