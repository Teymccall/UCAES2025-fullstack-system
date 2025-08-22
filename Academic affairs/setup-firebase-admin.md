# 🔥 Firebase Admin SDK Setup Guide

## 🚨 **Current Issue**
The admissions dashboard is failing because the Firebase Admin SDK service account file is missing.

## 🔧 **Quick Fix Options**

### **Option 1: Use Firebase CLI (Recommended for Development)**
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set the project
firebase use ucaes2025
```

### **Option 2: Create Service Account File**

1. **Go to Firebase Console**: https://console.firebase.google.com/project/ucaes2025
2. **Navigate**: Project Settings → Service Accounts
3. **Click**: "Generate New Private Key"
4. **Download** the JSON file
5. **Rename** it to: `ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json`
6. **Place** it in the root of `Academic affairs` folder

### **Option 3: Use Environment Variable**
Set the service account as an environment variable:
```bash
# Create .env.local file in Academic affairs folder
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"ucaes2025",...}
```

## 🎯 **Expected File Structure**
```
Academic affairs/
├── ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json  ← Service account file
├── app/
├── lib/
└── ...
```

## ✅ **Verification**
After setting up, you should see:
- ✅ No "Service account is required" errors
- ✅ Admissions dashboard loads successfully
- ✅ Applications appear in the dashboard

## 🚀 **Alternative: Modified Code**
I've updated the Firebase Admin configuration to work without service account for development, but you'll still need proper credentials for production.

The code now:
- ✅ Tries to use service account file if available
- ✅ Falls back to default application credentials
- ✅ Provides better error messages
- ✅ Works with Firebase CLI login

## 🧪 **Test the Fix**
1. **Try Option 1** (Firebase CLI login)
2. **Refresh** the admissions dashboard
3. **Check console** for Firebase connection messages
4. **Verify** applications load without errors






