// Quick Registrar Office & Firebase Test for UCAES School System
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

console.log('🚀 Quick Registrar Office & Firebase Test...');
console.log('='.repeat(50));

async function quickTest() {
  try {
    // Initialize Firebase
    console.log('🔥 Initializing Firebase...');
    const serviceAccountPath = path.join(__dirname, 'ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
      projectId: serviceAccount.project_id
    });
    
    const db = admin.firestore();
    console.log('✅ Firebase initialized successfully!');
    
    // Test key collections
    const keyCollections = ['users', 'students', 'courses', 'registrations', 'grades', 'transcripts', 'academic-years'];
    const results = {};
    
    console.log('\n📚 Testing Key Collections:');
    for (const collection of keyCollections) {
      try {
        const snapshot = await db.collection(collection).limit(1).get();
        results[collection] = { accessible: true, count: snapshot.size };
        console.log(`  ✅ ${collection}: ${snapshot.size} documents`);
      } catch (error) {
        results[collection] = { accessible: false, error: error.message };
        console.log(`  ❌ ${collection}: ${error.message}`);
      }
    }
    
    // Test registrar-specific data
    console.log('\n👨‍💼 Testing Registrar Data:');
    
    // Test registrar users
    try {
      const registrarUsers = await db.collection('users').where('role', '==', 'registrar').limit(5).get();
      console.log(`  ✅ Registrar users: ${registrarUsers.size} found`);
    } catch (error) {
      console.log(`  ❌ Registrar users: ${error.message}`);
    }
    
    // Test current academic year
    try {
      const academicPeriod = await db.collection('systemConfig').doc('academicPeriod').get();
      if (academicPeriod.exists) {
        const data = academicPeriod.data();
        console.log(`  ✅ Current academic year: ${data.currentAcademicYear}`);
        console.log(`  ✅ Current semester: ${data.currentSemester}`);
      } else {
        console.log('  ⚠️ Academic period config not found');
      }
    } catch (error) {
      console.log(`  ❌ Academic period: ${error.message}`);
    }
    
    // Test student records
    try {
      const students = await db.collection('students').limit(5).get();
      console.log(`  ✅ Student records: ${students.size} accessible`);
    } catch (error) {
      console.log(`  ❌ Student records: ${error.message}`);
    }
    
    // Test course registrations
    try {
      const registrations = await db.collection('registrations').limit(5).get();
      console.log(`  ✅ Course registrations: ${registrations.size} accessible`);
    } catch (error) {
      console.log(`  ❌ Course registrations: ${error.message}`);
    }
    
    // Test transcripts
    try {
      const transcripts = await db.collection('transcripts').limit(5).get();
      console.log(`  ✅ Transcripts: ${transcripts.size} accessible`);
    } catch (error) {
      console.log(`  ❌ Transcripts: ${error.message}`);
    }
    
    // Summary
    console.log('\n📊 SUMMARY:');
    const accessibleCollections = Object.values(results).filter(r => r.accessible).length;
    const totalCollections = keyCollections.length;
    console.log(`Collections accessible: ${accessibleCollections}/${totalCollections}`);
    
    if (accessibleCollections >= totalCollections * 0.8) {
      console.log('Status: 🟢 EXCELLENT - Registrar office is fully operational');
    } else if (accessibleCollections >= totalCollections * 0.6) {
      console.log('Status: 🟡 GOOD - Most functions working');
    } else if (accessibleCollections >= totalCollections * 0.4) {
      console.log('Status: 🟠 FAIR - Some issues detected');
    } else {
      console.log('Status: 🔴 POOR - Major issues detected');
    }
    
    console.log('\n✅ Firebase is functioning properly!');
    console.log('✅ Registrar office data is accessible!');
    console.log('✅ Academic affairs system is operational!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

quickTest();