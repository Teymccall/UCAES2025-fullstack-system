// Test script to check if students can be found via the transcript API
const readline = require('readline');
const https = require('https');

async function testTranscriptAPI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('🔍 Testing Student Transcript API...\n');
  
  // Test the search endpoint
  const searchData = JSON.stringify({ searchTerm: 'test' });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/director/transcripts',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(searchData)
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const students = JSON.parse(data);
          console.log(`📊 API Response Status: ${res.statusCode}`);
          console.log(`👥 Students found: ${students.length}`);
          
          if (students.length > 0) {
            console.log('\n📋 Sample student data:');
            students.slice(0, 3).forEach((student, index) => {
              console.log(`${index + 1}. ${student.name} (${student.registrationNumber})`);
              console.log(`   Program: ${student.program}`);
              console.log(`   Email: ${student.email}`);
              console.log(`   Level: ${student.level}\n`);
            });
          } else {
            console.log('❌ No students found in the database.');
            console.log('\nPossible issues:');
            console.log('1. No student data in Firebase collections');
            console.log('2. Firebase connection issues');
            console.log('3. Search term "test" doesn\'t match any students');
          }
        } catch (error) {
          console.error('❌ Error parsing API response:', error.message);
          console.log('Raw response:', data);
        }
        
        rl.close();
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ API request failed:', error.message);
      console.log('\nMake sure the development server is running on http://localhost:3000');
      rl.close();
      resolve();
    });

    req.write(searchData);
    req.end();
  });
}

testTranscriptAPI();














