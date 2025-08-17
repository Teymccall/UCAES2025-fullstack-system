// Debug the transcript data format to see how academic year and semester are stored
const http = require('http');

async function debugTranscriptData() {
  console.log('🔍 DEBUGGING TRANSCRIPT DATA FORMAT');
  console.log('=' .repeat(50));
  
  try {
    // Test with the student shown in the transcript image
    const studentId = 'UCAES20240001'; // From the transcript image
    
    console.log('📋 Fetching transcript data for:', studentId);
    
    const result = await makeApiCall('/api/director/transcripts', 'POST', { studentId });
    
    console.log('📊 API Response Status:', result.status);
    console.log('📊 Full Response:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 200 && result.data.success) {
      const transcriptData = result.data.transcript;
      
      console.log('\n👤 STUDENT INFO:');
      console.log('   Name:', transcriptData.student.name);
      console.log('   Registration:', transcriptData.student.registrationNumber);
      
      console.log('\n📚 SEMESTER DATA:');
      transcriptData.semesters.forEach((semester, index) => {
        console.log(`   Semester ${index + 1}:`);
        console.log(`     Academic Year (raw): "${semester.academicYear}"`);
        console.log(`     Semester (raw): "${semester.semester}"`);
        console.log(`     Currently displays as: "${semester.academicYear} Academic Year - ${formatSemesterName(semester.semester)}"`);
        console.log(`     Should display as: "${formatAcademicYearWithSemester(semester.academicYear, semester.semester)}"`);
        console.log('     ---');
      });
      
      console.log('\n🎯 ANALYSIS:');
      console.log('The issue is likely in how the academic year is being parsed or formatted.');
      
    } else {
      console.log('❌ Failed to fetch transcript data');
      console.log('   Error:', result.data?.error || 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

function formatSemesterName(semesterValue) {
  if (!semesterValue) return 'Unknown Semester'
  
  const semester = semesterValue.toLowerCase()
  if (semester.includes('first') || semester === '1' || semester === 'semester 1') {
    return 'First Semester'
  } else if (semester.includes('second') || semester === '2' || semester === 'semester 2') {
    return 'Second Semester'
  } else if (semester.includes('third') || semester === '3' || semester === 'semester 3') {
    return 'Third Semester'
  } else {
    return semesterValue.charAt(0).toUpperCase() + semesterValue.slice(1)
  }
}

function formatAcademicYearWithSemester(academicYear, semester) {
  // Ensure academic year is in YYYY-YYYY format
  let formattedYear = academicYear;
  if (!academicYear.includes('-')) {
    // If it's just a single year, create the range
    const year = parseInt(academicYear);
    formattedYear = `${year}-${year + 1}`;
  }
  
  return `${formattedYear} Academic Year - ${formatSemesterName(semester)}`;
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

debugTranscriptData();
