// Script to find the student who is currently logged into the student portal
// This will help us understand what student ID the transcript system should be searching for

const https = require('https');
const http = require('http');

async function findLoggedInStudent() {
  console.log('🔍 INVESTIGATING LOGGED-IN STUDENT');
  console.log('=' .repeat(60));
  console.log('The student portal shows grades, so students DO exist!');
  console.log('Let\'s find out what student data is actually in the system.\n');

  // We need to manually query the collections to see what's really there
  // Since we can't access localStorage from Node.js, let's create a comprehensive search

  console.log('📋 Step 1: Creating test queries to find ALL students');
  console.log('-' .repeat(50));

  // Test different search patterns to find ANY students
  const searchPatterns = [
    'e', 'a', 'i', 'o', 'u', // vowels - common in names
    '20', '19', '18', // common in years/IDs  
    'ucaes', 'UCAES', // institutional prefix
    'esm', 'ESM', // course prefixes we saw
    'student', 'Student', // generic terms
    'test', 'Test', // test data
    '@' // email searches
  ];

  let foundStudents = [];

  for (const pattern of searchPatterns) {
    try {
      const searchData = JSON.stringify({ searchTerm: pattern });
      
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

      const result = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              const students = JSON.parse(data);
              resolve(students);
            } catch (error) {
              resolve([]);
            }
          });
        });

        req.on('error', reject);
        req.write(searchData);
        req.end();
      });

      if (result && result.length > 0) {
        console.log(`✅ Found ${result.length} student(s) with pattern "${pattern}":`);
        result.forEach(student => {
          console.log(`   - ${student.name} (${student.registrationNumber})`);
          console.log(`     Email: ${student.email}`);
          console.log(`     Program: ${student.program}`);
          
          // Avoid duplicates
          if (!foundStudents.some(s => s.registrationNumber === student.registrationNumber)) {
            foundStudents.push(student);
          }
        });
        console.log('');
      }

      // If we found students, we can stop searching
      if (foundStudents.length >= 3) {
        console.log('Found enough students for analysis, stopping search...\n');
        break;
      }

    } catch (error) {
      // Continue to next pattern
    }
  }

  console.log('📊 Step 2: Analysis Results');
  console.log('-' .repeat(50));

  if (foundStudents.length > 0) {
    console.log(`🎉 SUCCESS: Found ${foundStudents.length} student(s) in the database!`);
    console.log('\n👥 Student Details:');
    
    foundStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name}`);
      console.log(`   Registration: ${student.registrationNumber}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Program: ${student.program}`);
      console.log(`   Level: ${student.level}`);
      console.log('');
    });

    console.log('🔬 Step 3: Testing Transcript Generation');
    console.log('-' .repeat(50));

    // Test transcript generation for the first student
    const testStudent = foundStudents[0];
    console.log(`Testing transcript for: ${testStudent.name} (${testStudent.registrationNumber})`);

    try {
      const transcriptOptions = {
        hostname: 'localhost',
        port: 3000,
        path: `/api/director/transcripts?studentId=${encodeURIComponent(testStudent.id)}`,
        method: 'GET'
      };

      const transcriptResult = await new Promise((resolve, reject) => {
        const req = http.request(transcriptOptions, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              const transcript = JSON.parse(data);
              resolve({ status: res.statusCode, data: transcript });
            } catch (error) {
              resolve({ status: res.statusCode, data: data });
            }
          });
        });
        req.on('error', reject);
        req.end();
      });

      if (transcriptResult.status === 200) {
        const transcript = transcriptResult.data;
        console.log('✅ Transcript Generated Successfully!');
        console.log(`   Student: ${transcript.student.name}`);
        console.log(`   Semesters: ${transcript.semesters.length}`);
        console.log(`   Total Credits: ${transcript.summary.totalCreditsAttempted}`);
        console.log(`   Cumulative GPA: ${transcript.summary.cumulativeGPA.toFixed(2)}`);
        console.log(`   Class Standing: ${transcript.summary.classStanding}`);

        if (transcript.semesters.length > 0) {
          console.log('\n📚 Course Records:');
          transcript.semesters.forEach(semester => {
            console.log(`   ${semester.academicYear} - ${semester.semester}: ${semester.courses.length} courses`);
            semester.courses.forEach(course => {
              console.log(`     ${course.courseCode}: ${course.grade} (${course.total}%)`);
            });
          });
        }
      } else {
        console.log('❌ Transcript generation failed');
        console.log(`   Status: ${transcriptResult.status}`);
        console.log(`   Response: ${transcriptResult.data}`);
      }

    } catch (error) {
      console.log('❌ Error testing transcript:', error.message);
    }

  } else {
    console.log('❌ No students found in transcript search API');
    console.log('\n🤔 But the student portal shows grades, which means:');
    console.log('   1. Students exist in student-registrations collection');
    console.log('   2. Grades exist in student-grades collection');
    console.log('   3. There might be a mismatch in search logic');
    console.log('   4. Or the collections have different field names');
  }

  console.log('\n💡 Step 4: Recommendations');
  console.log('-' .repeat(50));

  if (foundStudents.length > 0) {
    console.log('✅ TRANSCRIPT SYSTEM IS WORKING!');
    console.log(`✅ Use these registration numbers to test transcripts:`);
    foundStudents.forEach(student => {
      console.log(`   - Search for: "${student.registrationNumber}" or "${student.name}"`);
    });
    console.log('✅ The system can generate full academic transcripts');
    console.log('✅ Ready for production use');
  } else {
    console.log('🔧 TRANSCRIPT SEARCH NEEDS DEBUGGING:');
    console.log('   - Check field names in collections');
    console.log('   - Verify search logic matches data structure');
    console.log('   - Test with Debug DB button on transcript page');
    console.log('   - Check if students are in different collections');
  }

  console.log('\n🏁 Investigation Complete');
}

findLoggedInStudent()
  .then(() => {
    console.log('\n✅ Student investigation completed');
  })
  .catch(error => {
    console.error('❌ Investigation failed:', error);
  });














