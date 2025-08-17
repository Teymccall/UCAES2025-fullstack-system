# 🔧 APPLICATION WORKFLOW - CODE FIXES

## 🎯 **Fix 1: Update AuthContext Registration (CRITICAL)**

### **File: `src/contexts/AuthContext.tsx`**

**BEFORE (Lines 108-114):**
```typescript
if (role === 'applicant') {
  applicationId = await generateSequentialApplicationId();
  // Store application data in Firebase
  await storeApplicationData(userId, email, name, applicationId);
  console.log("✅ Application data stored with ID:", applicationId);
}
```

**AFTER (Replace with):**
```typescript
if (role === 'applicant') {
  applicationId = await generateSequentialApplicationId();
  
  // ✅ FIXED: Only store user profile, don't create application record
  await setDoc(doc(db, 'user-profiles', userId), {
    applicationId,
    email,
    name,
    role: 'applicant',
    createdAt: serverTimestamp()
  });
  
  console.log("✅ User profile created with Application ID:", applicationId);
  // ❌ REMOVED: storeApplicationData call that created premature application record
}
```

**Add these imports at the top:**
```typescript
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../firebase';
```

---

## 🎯 **Fix 2: Update Application Submission (CRITICAL)**

### **File: `src/contexts/ApplicationContext.tsx`**

**Find the `submitApplication` function and replace it:**

**BEFORE:**
```typescript
const submitApplication = async () => {
  if (!user?.id) return;
  
  const currentTime = new Date().toISOString();
  
  setApplicationData(prev => ({
    ...prev,
    applicationStatus: 'submitted',
    submittedAt: currentTime
  }));

  try {
    await saveApplicationData(user.id, {
      applicationStatus: 'submitted',
      submittedAt: currentTime,
      currentStep: 7
    });
  } catch (error) {
    console.error('Error submitting application to Firebase:', error);
  }
};
```

**AFTER:**
```typescript
const submitApplication = async () => {
  if (!user?.id) return;
  
  const currentTime = new Date().toISOString();
  
  setApplicationData(prev => ({
    ...prev,
    applicationStatus: 'submitted',
    submittedAt: currentTime
  }));

  try {
    // ✅ FIXED: Create application record only when submitted
    await createSubmittedApplication(user.id, {
      ...applicationData,
      applicationStatus: 'submitted',
      submittedAt: currentTime,
      currentStep: 7
    });
    
    console.log("✅ Application submitted successfully");
  } catch (error) {
    console.error('Error submitting application to Firebase:', error);
  }
};
```

**Add this new function to the file:**
```typescript
// ✅ NEW: Create application record only when submitted
const createSubmittedApplication = async (userId: string, appData: any) => {
  try {
    // Get user's applicationId from profile
    const userProfileRef = doc(db, 'user-profiles', userId);
    const userProfileDoc = await getDoc(userProfileRef);
    
    if (!userProfileDoc.exists()) {
      throw new Error('User profile not found');
    }
    
    const userProfile = userProfileDoc.data();
    const applicationId = userProfile.applicationId;
    
    const submissionData = {
      applicationId,
      userId,
      email: userProfile.email,
      name: userProfile.name,
      ...appData,
      status: 'submitted', // ✅ Start with submitted, not draft
      submittedAt: serverTimestamp(),
      createdAt: serverTimestamp()
      // ❌ NO registration number assigned yet
    };
    
    // ✅ Create application record only when submitted
    await addDoc(collection(db, 'admission-applications'), submissionData);
    
    console.log("✅ Application record created with status: submitted");
  } catch (error) {
    console.error("❌ Error creating submitted application:", error);
    throw error;
  }
};
```

**Add these imports:**
```typescript
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
```

---

## 🎯 **Fix 3: Update Staff Dashboard Query (HIGH PRIORITY)**

### **File: `src/pages/StaffDashboard.tsx`**

**Replace the mock data with real Firebase data:**

**BEFORE (Mock data):**
```typescript
const recentApplications = [
  {
    id: 'APP-2024-156',
    name: 'John Doe',
    // ... mock data
  }
];
```

**AFTER (Real Firebase data):**
```typescript
const [applications, setApplications] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadSubmittedApplications();
}, []);

const loadSubmittedApplications = async () => {
  try {
    setLoading(true);
    
    // ✅ FIXED: Only load submitted applications (not drafts)
    const applicationsRef = collection(db, 'admission-applications');
    const q = query(
      applicationsRef,
      where('status', 'in', ['submitted', 'under_review', 'accepted', 'rejected']),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const apps = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedDate: doc.data().submittedAt?.toDate()?.toLocaleDateString() || 'Unknown'
    }));
    
    setApplications(apps);
    console.log(`✅ Loaded ${apps.length} submitted applications`);
  } catch (error) {
    console.error('❌ Error loading applications:', error);
  } finally {
    setLoading(false);
  }
};
```

**Add these imports:**
```typescript
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
```

**Update the table to use real data:**
```typescript
<tbody className="bg-white divide-y divide-gray-200">
  {loading ? (
    <tr>
      <td colSpan="7" className="px-6 py-4 text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <span className="ml-2">Loading applications...</span>
        </div>
      </td>
    </tr>
  ) : applications.length === 0 ? (
    <tr>
      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
        No submitted applications found
      </td>
    </tr>
  ) : (
    applications.map((application) => (
      <tr key={application.id} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {application.applicationId}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {application.name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {application.programSelection?.programType || 'Not specified'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {application.submittedDate}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
            {application.status.replace('_', ' ')}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            application.paymentStatus === 'paid' 
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {application.paymentStatus || 'pending'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <button 
            className="text-green-600 hover:text-green-900 flex items-center"
            onClick={() => handleReviewApplication(application.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Review
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>
```

---

## 🎯 **Fix 4: Create Registration Number Assignment Function**

### **File: `src/utils/applicationUtils.ts`**

**Add this new function:**
```typescript
// ✅ NEW: Assign registration number only when approved by director
export const assignRegistrationNumber = async (applicationId: string): Promise<string> => {
  try {
    console.log(`🎓 Assigning registration number to application: ${applicationId}`);
    
    // Generate registration number
    const registrationNumber = await generateSequentialRegistrationNumber();
    
    // Update application with registration number and approved status
    const applicationsRef = collection(db, 'admission-applications');
    const q = query(applicationsRef, where('applicationId', '==', applicationId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error(`Application ${applicationId} not found`);
    }
    
    const docRef = doc(db, 'admission-applications', querySnapshot.docs[0].id);
    await updateDoc(docRef, {
      registrationNumber,
      status: 'accepted',
      approvedAt: serverTimestamp(),
      approvedBy: 'director' // You can make this dynamic
    });
    
    // ✅ Create student record for portal access
    await createStudentRecord(applicationId, registrationNumber, querySnapshot.docs[0].data());
    
    console.log(`✅ Registration number assigned: ${registrationNumber}`);
    return registrationNumber;
    
  } catch (error) {
    console.error("❌ Error assigning registration number:", error);
    throw error;
  }
};

// ✅ NEW: Create student record when application is approved
export const createStudentRecord = async (applicationId: string, registrationNumber: string, applicationData: any): Promise<void> => {
  try {
    const studentData = {
      registrationNumber,
      applicationId,
      name: applicationData.name,
      email: applicationData.email,
      programme: applicationData.programSelection?.programType || 'Unknown',
      level: '100', // First year
      yearOfAdmission: new Date().getFullYear(),
      status: 'active',
      dateOfBirth: applicationData.personalInfo?.dateOfBirth,
      phone: applicationData.contactInfo?.phone,
      address: applicationData.contactInfo?.address,
      createdAt: serverTimestamp(),
      createdFrom: 'admission-system'
    };
    
    // Add to student-registrations collection (for student portal)
    await addDoc(collection(db, 'student-registrations'), studentData);
    
    console.log(`✅ Student record created for: ${registrationNumber}`);
  } catch (error) {
    console.error("❌ Error creating student record:", error);
    throw error;
  }
};
```

---

## 🎯 **Fix 5: Clean Up Existing Data**

### **Create cleanup script: `cleanup-draft-applications.cjs`**

```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('../../Academic affairs/ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

async function cleanupDraftApplications() {
  console.log('🧹 CLEANING UP DRAFT APPLICATIONS');
  console.log('=' .repeat(50));
  
  try {
    // Find all draft applications
    const applicationsRef = db.collection('admission-applications');
    const draftQuery = applicationsRef.where('status', '==', 'draft');
    const draftSnapshot = await draftQuery.get();
    
    console.log(`��� Found ${draftSnapshot.size} draft applications to clean up`);
    
    if (draftSnapshot.size === 0) {
      console.log('✅ No draft applications found - system is clean');
      return;
    }
    
    // Move draft applications to a separate collection
    const batch = db.batch();
    let moveCount = 0;
    
    draftSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Add to draft collection
      const draftRef = db.collection('application-drafts').doc();
      batch.set(draftRef, {
        ...data,
        originalId: doc.id,
        movedAt: admin.firestore.FieldValue.serverTimestamp(),
        reason: 'Cleanup - moved from main applications'
      });
      
      // Delete from main collection
      batch.delete(doc.ref);
      moveCount++;
    });
    
    await batch.commit();
    
    console.log(`✅ Moved ${moveCount} draft applications to application-drafts collection`);
    console.log('✅ Draft applications are no longer visible to staff');
    
    // Reset application counter to reflect only submitted applications
    const submittedQuery = applicationsRef.where('status', 'in', ['submitted', 'under_review', 'accepted', 'rejected']);
    const submittedSnapshot = await submittedQuery.get();
    
    console.log(`📊 ${submittedSnapshot.size} submitted applications remain in main collection`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    process.exit(0);
  }
}

cleanupDraftApplications();
```

---

## 🎯 **Implementation Order**

### **Step 1: IMMEDIATE (Critical)**
1. ✅ **Fix AuthContext** - Stop creating application records during registration
2. ✅ **Update Staff Dashboard** - Hide draft applications from staff view
3. ✅ **Run cleanup script** - Move existing draft applications

### **Step 2: HIGH PRIORITY**
1. ✅ **Fix Application Submission** - Create records only when submitted
2. ✅ **Add Registration Number Assignment** - Only when director approves
3. ✅ **Test new workflow** - Verify everything works correctly

### **Step 3: MEDIUM PRIORITY**
1. ✅ **Update other components** - Ensure consistency across the app
2. ✅ **Add status change notifications** - Email alerts for staff
3. ✅ **Create approval interface** - For director to approve applications

---

## 🧪 **Testing Checklist**

### **Test New User Registration:**
- [ ] User creates account
- [ ] Application ID generated and stored in user profile
- [ ] NO application record created in admission-applications
- [ ] Staff dashboard shows no new applications

### **Test Application Submission:**
- [ ] User completes application form
- [ ] User clicks "Submit Application"
- [ ] Application record created with status "submitted"
- [ ] Staff dashboard shows new submitted application

### **Test Staff Review:**
- [ ] Staff can see only submitted applications
- [ ] No draft applications visible
- [ ] Staff can change status to "under_review"

### **Test Director Approval:**
- [ ] Director can approve applications
- [ ] Registration number assigned only when approved
- [ ] Student record created for portal access

---

## 🎉 **Expected Results After Fix**

### **✅ Clean Staff Dashboard:**
- Only submitted applications visible
- No clutter from incomplete applications
- Clear workflow status tracking

### **✅ Proper Registration Numbers:**
- Assigned only when director approves
- No wasted numbers on incomplete applications
- Direct correlation with student portal access

### **✅ Clear Application Lifecycle:**
- Account creation ≠ Application submission
- Proper separation of concerns
- Enforced workflow stages

**This fix will resolve the critical workflow issue and ensure proper application management!** 🚀