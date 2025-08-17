# 🎯 Course Results Report - Access Guide

## Step-by-Step Instructions to Access the Interface

### 1. **Ensure Server is Running**
```bash
cd "Academic affairs"
npm run dev
```
- Server should be running on `http://localhost:3001`

### 2. **Login as Exam Officer**
1. Open browser to `http://localhost:3001`
2. Enter credentials:
   - **Username**: `examofficer`
   - **Password**: `examofficer123`
3. Click "Sign In"
4. Should redirect to `/staff/dashboard`

### 3. **Navigate to Course Reports**
**Option A: Via Sidebar Menu**
1. Look for "Results • Course Report" in the left sidebar
2. Click on it
3. Should navigate to `/staff/results/reports`

**Option B: Direct URL**
1. Go directly to: `http://localhost:3001/staff/results/reports`

### 4. **Test Pages Available**
If the main page doesn't load, try these test pages:

**Simple Test Page:**
- URL: `http://localhost:3001/staff/results/reports/simple`
- This is a simplified version to test basic functionality

**Basic Test Page:**
- URL: `http://localhost:3001/staff/results/reports/test-page`
- This tests if routing and components work

## 🔧 Troubleshooting

### If You Don't See the Interface:

1. **Check Browser Console**
   - Press F12 to open Developer Tools
   - Look for any red error messages
   - Share any errors you see

2. **Check Network Tab**
   - In Developer Tools, go to Network tab
   - Refresh the page
   - Look for any failed requests (red entries)

3. **Verify Login Status**
   - Make sure you're logged in as exam officer
   - Check if you see the sidebar menu
   - Verify you have "results_approval" permission

4. **Clear Browser Cache**
   - Press Ctrl+Shift+R to hard refresh
   - Or clear browser cache and cookies

5. **Check Server Logs**
   - Look at the terminal where `npm run dev` is running
   - Check for any error messages

### Common Issues:

**Issue 1: "Permission Denied" or Redirect to Login**
- **Solution**: Make sure you're logged in as exam officer with correct credentials

**Issue 2: Blank Page or Loading Forever**
- **Solution**: Check browser console for JavaScript errors

**Issue 3: "Page Not Found" (404)**
- **Solution**: Verify the URL is correct: `/staff/results/reports`

**Issue 4: Components Not Loading**
- **Solution**: Try the simple test page first

## 📋 What You Should See

When the page loads correctly, you should see:

1. **Header Section**
   - "Course Results Report" title with chart icon
   - Description text

2. **Statistics Cards** (after loading data)
   - Total Students
   - Average Score
   - Pass Rate
   - Programmes

3. **Grade Distribution Chart** (after loading data)
   - Visual breakdown of grades A, B, C, D, F

4. **Main Report Card**
   - Filter inputs for Academic Year, Semester, Course Code
   - Search and filter options
   - Load Results button
   - Print and Export buttons

5. **Results Table** (after loading data)
   - Student registration numbers
   - Names and programmes
   - Scores and grades
   - Pass/Fail status

## 🎯 Quick Test

1. Navigate to: `http://localhost:3001/staff/results/reports/simple`
2. If this loads, the routing works
3. Try entering: Academic Year: "2024/2025", Semester: "First", Course: "TEST101"
4. Click "Load Results" (will show alert for now)

## 📞 Next Steps

If you still can't see the interface:

1. **Try the simple test page first**
2. **Check browser console for errors**
3. **Share any error messages you see**
4. **Let me know which step fails**

The interface should be working - let's identify where the issue is occurring!