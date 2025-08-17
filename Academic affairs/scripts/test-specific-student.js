// Test script to check if student UCAES20240001 exists and can generate transcript
const https = require('https');
const http = require('http');

async function testStudentTranscript(studentId) {
  console.log(`🔍 Testing transcript for student: ${studentId}`);
  console.log('=' .repeat(50));

  // Test 1: Search for the student
  console.log('📋 Step 1: Searching for student...');
  
  const searchData = JSON.stringify({ searchTerm: studentId });
  
  const searchOptions = {
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
    const searchReq = http.request(searchOptions, (res) => {
      let searchResult = '';
      
      res.on('data', (chunk) => {
        searchResult += chunk;
      });
      
      res.on('end', () => {
        try {
          const students = JSON.parse(searchResult);
          console.log(`   📊 Search Result: Found ${students.length} student(s)`);
          
          if (students.length > 0) {
            const student = students[0];
            console.log(`   ✅ Student Found:`);
            console.log(`      Name: ${student.name}`);
            console.log(`      Registration: ${student.registrationNumber}`);
            console.log(`      Email: ${student.email}`);
            console.log(`      Program: ${student.program}`);
            console.log(`      Level: ${student.level}`);
            
            // Test 2: Get the transcript
            console.log('\n📊 Step 2: Fetching transcript...');
            
            const transcriptOptions = {
              hostname: 'localhost',
              port: 3000,
              path: `/api/director/transcripts?studentId=${encodeURIComponent(student.id)}`,
              method: 'GET'
            };

            const transcriptReq = http.request(transcriptOptions, (transcriptRes) => {
              let transcriptData = '';
              
              transcriptRes.on('data', (chunk) => {
                transcriptData += chunk;
              });
              
              transcriptRes.on('end', () => {
                try {
                  const transcript = JSON.parse(transcriptData);
                  
                  if (transcriptRes.statusCode === 200) {
                    console.log(`   ✅ Transcript Generated Successfully!`);
                    console.log(`      Student: ${transcript.student.name}`);
                    console.log(`      Total Semesters: ${transcript.semesters.length}`);
                    console.log(`      Total Credits Attempted: ${transcript.summary.totalCreditsAttempted}`);
                    console.log(`      Total Credits Earned: ${transcript.summary.totalCreditsEarned}`);
                    console.log(`      Cumulative GPA: ${transcript.summary.cumulativeGPA.toFixed(2)}`);
                    console.log(`      Class Standing: ${transcript.summary.classStanding}`);
                    console.log(`      Academic Status: ${transcript.summary.academicStatus}`);
                    
                    if (transcript.semesters.length > 0) {
                      console.log('\n   📚 Course History:');
                      transcript.semesters.forEach((semester, index) => {
                        console.log(`      ${semester.academicYear} - ${semester.semester}:`);
                        console.log(`         Courses: ${semester.courses.length}`);
                        console.log(`         Credits: ${semester.totalCredits}`);
                        console.log(`         GPA: ${semester.semesterGPA.toFixed(2)}`);
                        
                        semester.courses.forEach(course => {
                          console.log(`         - ${course.courseCode}: ${course.grade} (${course.total}%)`);
                        });
                      });
                    } else {
                      console.log('   ⚠️ No course history found (no published grades)');
                    }
                  } else {
                    console.log(`   ❌ Transcript Error: ${transcript.error}`);
                  }
                } catch (error) {
                  console.log(`   ❌ Error parsing transcript: ${error.message}`);
                  console.log(`   Raw response: ${transcriptData}`);
                }
                resolve();
              });
            });

            transcriptReq.on('error', (error) => {
              console.log(`   ❌ Transcript request failed: ${error.message}`);
              resolve();
            });

            transcriptReq.end();
            
          } else {
            console.log(`   ❌ Student "${studentId}" not found in database`);
            console.log('\n💡 Suggestions:');
            console.log('   1. Check if the registration number is correct');
            console.log('   2. Try searching by name instead');
            console.log('   3. Use the Debug DB button to see what students exist');
            console.log('   4. The student might be in a different format (e.g., UCAES20250001)');
            resolve();
          }
        } catch (error) {
          console.log(`   ❌ Error parsing search result: ${error.message}`);
          console.log(`   Raw response: ${searchResult}`);
          resolve();
        }
      });
    });

    searchReq.on('error', (error) => {
      console.log(`❌ Search request failed: ${error.message}`);
      console.log('💡 Make sure the development server is running on http://localhost:3000');
      resolve();
    });

    searchReq.write(searchData);
    searchReq.end();
  });
}

// Test the specific student
const studentToTest = process.argv[2] || 'UCAES20240001';
testStudentTranscript(studentToTest)
  .then(() => {
    console.log('\n🏁 Test completed');
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });
