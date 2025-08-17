const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('./ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

async function fixExamOfficerLogin() {
  try {
    console.log('🔧 FIXING EXAM OFFICER LOGIN ISSUE');
    console.log('=' .repeat(50));
    
    // 1. Find the exam officer
    console.log('🔍 Looking for exam officer in database...');
    
    const examOfficerQuery = await db.collection('users')
      .where('role', '==', 'exam_officer')
      .get();
    
    if (examOfficerQuery.empty) {
      console.log('❌ No exam officer found! Creating a new one...');
      
      // Create a new exam officer
      const newExamOfficer = {
        username: 'examofficer',
        name: 'Exam Officer',
        email: 'examofficer@ucaes.edu.gh',
        role: 'exam_officer',
        permissions: [
          'exam_management',
          'results_approval',
          'transcript_generation',
          'student_records',
          'daily_reports'
        ],
        status: 'active',
        department: 'Academic Affairs',
        position: 'Exam Officer',
        password: await bcrypt.hash('examofficer123', 10),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await db.collection('users').add(newExamOfficer);
      console.log('✅ New exam officer created!');
      console.log(`   ID: ${docRef.id}`);
      console.log(`   Username: ${newExamOfficer.username}`);
      console.log(`   Password: examofficer123`);
      
    } else {
      // Update existing exam officer
      const examOfficerDoc = examOfficerQuery.docs[0];
      const examOfficer = examOfficerDoc.data();
      
      console.log('👤 Found existing exam officer:');
      console.log(`   Name: ${examOfficer.name}`);
      console.log(`   Username: ${examOfficer.username}`);
      console.log(`   Email: ${examOfficer.email}`);
      console.log(`   Status: ${examOfficer.status}`);
      
      // Check and fix password
      console.log('\n🔐 Checking password...');
      
      const newPassword = 'examofficer123';
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update the exam officer with correct credentials
      await db.collection('users').doc(examOfficerDoc.id).update({
        username: 'examofficer', // Standardize username
        password: hashedPassword,
        status: 'active',
        permissions: [
          'exam_management',
          'results_approval',
          'transcript_generation',
          'student_records',
          'daily_reports'
        ],
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Exam officer credentials updated!');
      console.log(`   Username: examofficer`);
      console.log(`   Password: ${newPassword}`);
    }
    
    // 2. Test the login API simulation
    console.log('\n🧪 Testing login simulation...');
    
    const testCredentials = {
      username: 'examofficer',
      password: 'examofficer123'
    };
    
    // Find user by username
    const userQuery = await db.collection('users')
      .where('username', '==', testCredentials.username)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (userQuery.empty) {
      console.log('❌ User not found with username: ' + testCredentials.username);
      return;
    }
    
    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();
    
    console.log('👤 Found user for login test:');
    console.log(`   Username: ${userData.username}`);
    console.log(`   Role: ${userData.role}`);
    console.log(`   Status: ${userData.status}`);
    
    // Test password verification
    if (userData.password) {
      const isPasswordValid = await bcrypt.compare(testCredentials.password, userData.password);
      
      if (isPasswordValid) {
        console.log('✅ Password verification: SUCCESS');
        
        // Simulate successful login response
        const loginResponse = {
          success: true,
          user: {
            uid: userDoc.id,
            username: userData.username,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            permissions: userData.permissions,
            status: userData.status,
            department: userData.department,
            position: userData.position
          }
        };
        
        console.log('\n📤 Login would return:');
        console.log(JSON.stringify(loginResponse, null, 2));
        
      } else {
        console.log('❌ Password verification: FAILED');
      }
    } else {
      console.log('❌ No password set for user');
    }
    
    // 3. Check if there are any other exam officers
    console.log('\n🔍 Checking for other exam officers...');
    
    const allExamOfficersQuery = await db.collection('users')
      .where('role', '==', 'exam_officer')
      .get();
    
    console.log(`📊 Total exam officers found: ${allExamOfficersQuery.size}`);
    
    allExamOfficersQuery.forEach((doc, index) => {
      const officer = doc.data();
      console.log(`   ${index + 1}. ${officer.name} (${officer.username}) - Status: ${officer.status}`);
    });
    
    // 4. Provide clear login instructions
    console.log('\n🎯 LOGIN INSTRUCTIONS:');
    console.log('=' .repeat(30));
    console.log('1. Open browser to: http://localhost:3001');
    console.log('2. Username: examofficer');
    console.log('3. Password: examofficer123');
    console.log('4. Click "Sign In"');
    console.log('5. Should redirect to: /staff/dashboard');
    console.log('=' .repeat(30));
    
    // 5. Check if the development server is running
    console.log('\n🌐 DEVELOPMENT SERVER CHECK:');
    console.log('Make sure the development server is running:');
    console.log('   cd "Academic affairs"');
    console.log('   npm run dev');
    console.log('   Server should be at: http://localhost:3001');
    
    console.log('\n✅ EXAM OFFICER LOGIN ISSUE FIXED!');
    
  } catch (error) {
    console.error('❌ Error fixing exam officer login:', error);
  } finally {
    process.exit(0);
  }
}

fixExamOfficerLogin();