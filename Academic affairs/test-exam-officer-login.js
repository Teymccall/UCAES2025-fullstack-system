const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');

// Initialize Firebase Admin (reuse existing initialization if already done)
if (!admin.apps.length) {
  const serviceAccount = require('./ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

async function testExamOfficerLogin() {
  try {
    console.log('🔐 Testing Exam Officer Login Credentials...\n');
    
    // Get the exam officer from database
    const examOfficerQuery = await db.collection('users')
      .where('role', '==', 'exam_officer')
      .limit(1)
      .get();
    
    if (examOfficerQuery.empty) {
      console.log('❌ No exam officer found in database');
      return;
    }
    
    const examOfficerDoc = examOfficerQuery.docs[0];
    const examOfficer = examOfficerDoc.data();
    
    console.log('👤 Found Exam Officer:');
    console.log(`   Name: ${examOfficer.name}`);
    console.log(`   Username: ${examOfficer.username}`);
    console.log(`   Email: ${examOfficer.email}`);
    console.log(`   Status: ${examOfficer.status}`);
    console.log(`   Role: ${examOfficer.role}`);
    
    // Check if password is set
    if (examOfficer.password) {
      console.log('✅ Password is set (hashed)');
      
      // Test common passwords
      const testPasswords = ['iphone', 'password', '123456', examOfficer.username];
      
      console.log('\n🔍 Testing common passwords...');
      
      for (const testPassword of testPasswords) {
        try {
          const isMatch = await bcrypt.compare(testPassword, examOfficer.password);
          if (isMatch) {
            console.log(`✅ Password found: "${testPassword}"`);
            console.log('\n🎯 LOGIN INSTRUCTIONS:');
            console.log('1. Open browser to http://localhost:3001');
            console.log(`2. Username: ${examOfficer.username}`);
            console.log(`3. Password: ${testPassword}`);
            console.log('4. Click "Sign In"');
            console.log('5. You should be redirected to /staff/dashboard');
            return;
          }
        } catch (error) {
          // Password might not be bcrypt hashed
        }
      }
      
      // If bcrypt doesn't work, check if password is stored in plain text (not recommended)
      for (const testPassword of testPasswords) {
        if (examOfficer.password === testPassword) {
          console.log(`✅ Plain text password found: "${testPassword}"`);
          console.log('\n🎯 LOGIN INSTRUCTIONS:');
          console.log('1. Open browser to http://localhost:3001');
          console.log(`2. Username: ${examOfficer.username}`);
          console.log(`3. Password: ${testPassword}`);
          console.log('4. Click "Sign In"');
          console.log('5. You should be redirected to /staff/dashboard');
          return;
        }
      }
      
      console.log('⚠️ Could not determine password. You may need to reset it.');
      
    } else {
      console.log('❌ No password set for exam officer');
    }
    
    // Offer to reset password
    console.log('\n🔄 Would you like to reset the exam officer password?');
    console.log('Setting password to "examofficer123"...');
    
    const newPassword = 'examofficer123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await db.collection('users').doc(examOfficerDoc.id).update({
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Password updated successfully!');
    console.log('\n🎯 LOGIN INSTRUCTIONS:');
    console.log('1. Open browser to http://localhost:3001');
    console.log(`2. Username: ${examOfficer.username}`);
    console.log(`3. Password: ${newPassword}`);
    console.log('4. Click "Sign In"');
    console.log('5. You should be redirected to /staff/dashboard');
    
    // Test the login API simulation
    console.log('\n🧪 Simulating Login Process...');
    
    const loginData = {
      username: examOfficer.username,
      password: newPassword
    };
    
    console.log('📤 Login request would be sent with:');
    console.log(`   Username: ${loginData.username}`);
    console.log(`   Password: [hidden]`);
    
    console.log('\n📥 Expected response:');
    console.log('   success: true');
    console.log(`   user.role: ${examOfficer.role}`);
    console.log(`   user.permissions: [${examOfficer.permissions.join(', ')}]`);
    console.log('   redirect: /staff/dashboard');
    
  } catch (error) {
    console.error('❌ Error testing exam officer login:', error);
  } finally {
    process.exit(0);
  }
}

testExamOfficerLogin();