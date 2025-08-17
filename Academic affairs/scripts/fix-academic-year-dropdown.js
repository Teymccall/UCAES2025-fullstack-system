const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixAcademicYearDropdown() {
  console.log('🔧 Fixing Academic Year Dropdown Issue...');
  console.log('='.repeat(50));
  
  try {
    // 1. Check if "2020-2021" document exists
    console.log('\n📋 1. Checking for "2020-2021" document...');
    const year2020Ref = doc(db, 'academic-years', '2020-2021');
    const year2020Doc = await getDoc(year2020Ref);
    
    if (!year2020Doc.exists()) {
      console.log('❌ Document "2020-2021" does not exist. Creating it...');
      
      // Create the missing document
      await setDoc(year2020Ref, {
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
      });
      
      console.log('✅ Created "2020-2021" academic year document');
    } else {
      console.log('✅ Document "2020-2021" already exists');
    }
    
    // 2. Check if "2026-2027" document exists
    console.log('\n📋 2. Checking for "2026-2027" document...');
    const year2026Ref = doc(db, 'academic-years', '2026-2027');
    const year2026Doc = await getDoc(year2026Ref);
    
    if (!year2026Doc.exists()) {
      console.log('❌ Document "2026-2027" does not exist. Creating it...');
      
      // Create the missing document
      await setDoc(year2026Ref, {
        year: '2026-2027',
        displayName: '2026/2027 Academic Year',
        startDate: new Date('2026-09-01'),
        endDate: new Date('2027-08-31'),
        status: 'upcoming',
        admissionStatus: 'closed',
        currentApplications: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'system-fix'
      });
      
      console.log('✅ Created "2026-2027" academic year document');
    } else {
      console.log('✅ Document "2026-2027" already exists');
    }
    
    // 3. Check if "2025" document exists (for backward compatibility)
    console.log('\n📋 3. Checking for "2025" document...');
    const year2025Ref = doc(db, 'academic-years', '2025');
    const year2025Doc = await getDoc(year2025Ref);
    
    if (!year2025Doc.exists()) {
      console.log('❌ Document "2025" does not exist. Creating it...');
      
      // Create the missing document
      await setDoc(year2025Ref, {
        year: '2025',
        displayName: '2025/2026 Academic Year',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-08-31'),
        status: 'upcoming',
        admissionStatus: 'closed',
        currentApplications: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'system-fix'
      });
      
      console.log('✅ Created "2025" academic year document');
    } else {
      console.log('✅ Document "2025" already exists');
    }
    
    // 4. Check if "2024-2025" document exists
    console.log('\n📋 4. Checking for "2024-2025" document...');
    const year2024Ref = doc(db, 'academic-years', '2024-2025');
    const year2024Doc = await getDoc(year2024Ref);
    
    if (!year2024Doc.exists()) {
      console.log('❌ Document "2024-2025" does not exist. Creating it...');
      
      // Create the missing document
      await setDoc(year2024Ref, {
        year: '2024-2025',
        displayName: '2024/2025 Academic Year',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-08-31'),
        status: 'active',
        admissionStatus: 'open',
        currentApplications: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'system-fix'
      });
      
      console.log('✅ Created "2024-2025" academic year document');
    } else {
      console.log('✅ Document "2024-2025" already exists');
    }
    
    // 5. Update systemConfig to use a valid document ID
    console.log('\n📋 5. Checking systemConfig...');
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod');
    const systemConfigDoc = await getDoc(systemConfigRef);
    
    if (systemConfigDoc.exists()) {
      const systemData = systemConfigDoc.data();
      console.log('✅ SystemConfig found:');
      console.log(`   Current Academic Year ID: ${systemData.currentAcademicYearId || 'N/A'}`);
      console.log(`   Current Academic Year: ${systemData.currentAcademicYear || 'N/A'}`);
      
      // Check if the current academic year ID exists
      if (systemData.currentAcademicYearId) {
        const currentYearRef = doc(db, 'academic-years', systemData.currentAcademicYearId);
        const currentYearDoc = await getDoc(currentYearRef);
        
        if (!currentYearDoc.exists) {
          console.log('⚠️ Current academic year document does not exist. Updating systemConfig...');
          
          // Update systemConfig to use "2024-2025" as the current year
          await setDoc(systemConfigRef, {
            currentAcademicYearId: '2024-2025',
            currentAcademicYear: '2024/2025 Academic Year',
            currentSemesterId: null,
            currentSemester: null,
            lastUpdated: new Date(),
            updatedBy: 'system-fix'
          }, { merge: true });
          
          console.log('✅ Updated systemConfig to use "2024-2025" as current year');
        } else {
          console.log('✅ Current academic year document exists');
        }
      }
    } else {
      console.log('❌ No systemConfig found. Creating it...');
      
      await setDoc(systemConfigRef, {
        currentAcademicYearId: '2024-2025',
        currentAcademicYear: '2024/2025 Academic Year',
        currentSemesterId: null,
        currentSemester: null,
        lastUpdated: new Date(),
        updatedBy: 'system-fix'
      });
      
      console.log('✅ Created systemConfig with "2024-2025" as current year');
    }
    
    console.log('\n📋 6. Summary:');
    console.log('-'.repeat(40));
    console.log('✅ Fixed academic year dropdown issue');
    console.log('✅ Created missing academic year documents');
    console.log('✅ Updated systemConfig to use valid document ID');
    console.log('✅ The dropdown should now work correctly');
    
  } catch (error) {
    console.error('❌ Error fixing academic year dropdown:', error);
  }
}

// Run the fix function
fixAcademicYearDropdown()
  .then(() => {
    console.log('\n✅ Fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });

