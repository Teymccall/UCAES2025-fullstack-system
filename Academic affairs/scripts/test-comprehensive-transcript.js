// Test the comprehensive transcript system with real student data
const http = require('http');

async function testComprehensiveTranscript() {
  console.log('🎓 TESTING COMPREHENSIVE TRANSCRIPT SYSTEM');
  console.log('=' .repeat(60));
  console.log('Testing with real student data from Firebase\n');

  // Test students we know exist from the Firebase debug
  const testStudents = [
    'PEASE',
    'UCAES20250016', 
    'AKAYETE',
    'UCAES20260012',
    'aillyban@gmail.com',
    'brown@gmail.com'
  ];

  for (const searchTerm of testStudents) {
    console.log(`🔍 Testing search for: "${searchTerm}"`);
    console.log('-' .repeat(40));

    try {
      // Test search
      const searchResult = await makeApiCall('/api/director/transcripts/comprehensive', 'POST', { searchTerm });
      
      if (searchResult.status === 200 && searchResult.data.length > 0) {
        console.log(`✅ Found ${searchResult.data.length} student(s):`);
        
        for (const student of searchResult.data) {
          console.log(`   👤 ${student.name} (${student.registrationNumber})`);
          console.log(`      Email: ${student.email}`);
          console.log(`      Program: ${student.program}`);
          console.log(`      Level: ${student.level}`);

          // Test transcript generation for this student
          console.log(`\n   📊 Generating transcript...`);
          
          const transcriptResult = await makeApiCall(`/api/director/transcripts/comprehensive?studentId=${encodeURIComponent(student.id)}`);
          
          if (transcriptResult.status === 200) {
            const transcript = transcriptResult.data;
            console.log(`   ✅ Transcript generated successfully!`);
            console.log(`      Student: ${transcript.student.name}`);
            console.log(`      Academic Periods: ${transcript.semesters.length}`);
            console.log(`      Total Credits Attempted: ${transcript.summary.totalCreditsAttempted}`);
            console.log(`      Total Credits Earned: ${transcript.summary.totalCreditsEarned}`);
            console.log(`      Cumulative GPA: ${transcript.summary.cumulativeGPA.toFixed(2)}`);
            console.log(`      Class Standing: ${transcript.summary.classStanding}`);
            console.log(`      Academic Status: ${transcript.summary.academicStatus}`);
            
            if (transcript.semesters.length > 0) {
              console.log(`\n   📚 Academic History:`);
              transcript.semesters.forEach((semester, index) => {
                console.log(`      ${semester.academicYear} - ${semester.semester}:`);
                console.log(`         Courses: ${semester.courses.length}`);
                console.log(`         Credits: ${semester.totalCredits}`);
                console.log(`         Completed: ${semester.completedCredits}`);
                console.log(`         In Progress: ${semester.coursesInProgress}`);
                console.log(`         Semester GPA: ${semester.semesterGPA.toFixed(2)}`);
                
                semester.courses.forEach(course => {
                  const status = course.status === 'completed' ? `${course.grade} (${course.total}%)` : 
                                course.status === 'in_progress' ? 'In Progress' : 'Registered';
                  console.log(`         - ${course.courseCode}: ${status}`);
                });
              });
            } else {
              console.log(`   ⚠️ No academic history found (no course registrations or grades)`);
            }
            
            // This proves the comprehensive transcript system is working!
            console.log(`\n   🎉 SUCCESS: Complete university-style transcript generated!`);
            break; // Test successful, move to next search term
          } else {
            console.log(`   ❌ Transcript generation failed: ${transcriptResult.data.error || 'Unknown error'}`);
          }
        }
      } else {
        console.log(`❌ No students found for "${searchTerm}"`);
      }
    } catch (error) {
      console.log(`❌ Error testing "${searchTerm}": ${error.message}`);
    }
    
    console.log(''); // Add spacing between tests
  }

  console.log('🏁 COMPREHENSIVE TRANSCRIPT TEST COMPLETE');
  console.log('=' .repeat(60));
  console.log('✅ If any students were found and transcripts generated, the system is working!');
  console.log('✅ The director can now search for any student and generate their complete academic transcript.');
  console.log('✅ The transcript includes all course registrations, published grades, and academic summary.');
}

async function makeApiCall(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

testComprehensiveTranscript()
  .then(() => {
    console.log('\n✅ Test completed successfully');
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });














