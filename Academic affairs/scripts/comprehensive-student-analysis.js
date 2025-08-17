// Comprehensive analysis of all student and grade collections across the system
const https = require('https');
const http = require('http');

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

async function comprehensiveAnalysis() {
  console.log('🔍 COMPREHENSIVE STUDENT & GRADE ANALYSIS');
  console.log('=' .repeat(80));
  console.log('Analyzing all collections to find student UCAES20240001 and understand the grade flow\n');

  // 1. Debug Database Structure
  console.log('📊 Step 1: Database Structure Analysis');
  console.log('-' .repeat(50));
  
  try {
    const debugResult = await makeApiCall('/api/director/transcripts/debug-students');
    
    if (debugResult.status === 200) {
      const debug = debugResult.data;
      
      console.log(`📋 Student-Registrations: ${debug.collections['student-registrations']?.totalRecords || 0} records`);
      console.log(`👥 Students Collection: ${debug.collections['students']?.totalRecords || 0} records`);
      console.log(`📊 Student-Grades: ${debug.collections['student-grades']?.totalRecords || 0} records`);
      
      // Show sample student data if available
      if (debug.sampleData['student-registrations']?.firstThreeStudents) {
        console.log('\n📝 Sample Students in Database:');
        debug.sampleData['student-registrations'].firstThreeStudents.forEach((student, index) => {
          console.log(`   ${index + 1}. ${student.name} (${student.registrationNumber})`);
          console.log(`      Email: ${student.email}`);
        });
      }
      
      if (debug.sampleData['student-grades']?.sampleStudentIds) {
        console.log('\n📚 Students with Grades:');
        debug.sampleData['student-grades'].sampleStudentIds.forEach((studentId, index) => {
          console.log(`   ${index + 1}. Student ID: ${studentId}`);
        });
      }
      
      console.log('\n💡 Recommendations:');
      debug.recommendations?.forEach(rec => console.log(`   ${rec}`));
      
    } else {
      console.log('❌ Failed to get debug information');
    }
  } catch (error) {
    console.log('❌ Error getting database structure:', error.message);
  }

  console.log('\n');

  // 2. Search for UCAES20240001 specifically
  console.log('🎯 Step 2: Searching for UCAES20240001');
  console.log('-' .repeat(50));
  
  try {
    const searchResult = await makeApiCall('/api/director/transcripts', 'POST', { searchTerm: 'UCAES20240001' });
    
    if (searchResult.status === 200) {
      const students = searchResult.data;
      console.log(`📊 Search Result: Found ${students.length} student(s) matching "UCAES20240001"`);
      
      if (students.length > 0) {
        students.forEach((student, index) => {
          console.log(`✅ Student ${index + 1}:`);
          console.log(`   Name: ${student.name}`);
          console.log(`   Registration: ${student.registrationNumber}`);
          console.log(`   Email: ${student.email}`);
          console.log(`   Program: ${student.program}`);
          console.log(`   Level: ${student.level}`);
        });
      } else {
        console.log('❌ Student UCAES20240001 not found in database');
      }
    } else {
      console.log('❌ Search request failed:', searchResult.data);
    }
  } catch (error) {
    console.log('❌ Error searching for student:', error.message);
  }

  console.log('\n');

  // 3. Try variations of the student ID
  console.log('🔄 Step 3: Trying Student ID Variations');
  console.log('-' .repeat(50));
  
  const variations = [
    'UCAES20250001', // 2025 instead of 2024
    'UCAES2024001',  // Missing zero
    'ucaes20240001', // Lowercase
    '20240001',      // Just the number
    'UCAES'          // Just the prefix
  ];
  
  for (const variation of variations) {
    try {
      const searchResult = await makeApiCall('/api/director/transcripts', 'POST', { searchTerm: variation });
      
      if (searchResult.status === 200) {
        const students = searchResult.data;
        if (students.length > 0) {
          console.log(`✅ Found ${students.length} student(s) with "${variation}":`);
          students.forEach(student => {
            console.log(`   - ${student.name} (${student.registrationNumber})`);
          });
        } else {
          console.log(`❌ No students found with "${variation}"`);
        }
      }
    } catch (error) {
      console.log(`❌ Error searching "${variation}":`, error.message);
    }
  }

  console.log('\n');

  // 4. Understanding the Grade Flow
  console.log('📚 Step 4: Grade Flow Analysis');
  console.log('-' .repeat(50));
  console.log('Understanding how grades flow from lecturer submission to student viewing:\n');
  
  console.log('📋 Expected Grade Flow:');
  console.log('   1. Lecturer submits grades → "grade-submissions" collection (status: pending_approval)');
  console.log('   2. Director approves → status becomes "approved"');
  console.log('   3. Director publishes → "student-grades" collection (status: published)');
  console.log('   4. Students see published grades in portal');
  console.log('   5. Transcripts pull from "student-grades" where status = "published"');

  console.log('\n📊 Collections Used:');
  console.log('   - student-registrations: Student personal info');
  console.log('   - students: Synced student data for course registration');
  console.log('   - grade-submissions: Pending grades from lecturers');
  console.log('   - student-grades: Published grades (used by transcripts)');
  console.log('   - grades: Legacy grade collection (may still be used)');

  console.log('\n');

  // 5. Check for any students at all
  console.log('👥 Step 5: Finding ANY Students for Testing');
  console.log('-' .repeat(50));
  
  const commonFirstNames = ['john', 'jane', 'mary', 'david', 'sarah', 'michael', 'kwame', 'akua', 'kofi', 'ama'];
  
  for (const name of commonFirstNames) {
    try {
      const searchResult = await makeApiCall('/api/director/transcripts', 'POST', { searchTerm: name });
      
      if (searchResult.status === 200) {
        const students = searchResult.data;
        if (students.length > 0) {
          console.log(`✅ Found ${students.length} student(s) with name "${name}":`);
          students.slice(0, 2).forEach(student => {
            console.log(`   - ${student.name} (${student.registrationNumber})`);
            console.log(`     Email: ${student.email}`);
          });
          break; // Found some students, no need to continue
        }
      }
    } catch (error) {
      // Continue to next name
    }
  }

  console.log('\n');

  // 6. Recommendations
  console.log('💡 Step 6: Recommendations');
  console.log('-' .repeat(50));
  
  console.log('Based on this analysis:');
  console.log('');
  console.log('✅ If students were found:');
  console.log('   → Use the registration numbers shown above to test transcripts');
  console.log('   → Check if these students have published grades');
  console.log('   → Test the complete transcript generation flow');
  console.log('');
  console.log('❌ If no students were found:');
  console.log('   → Use the Test Data page to populate sample students');
  console.log('   → Or import real students from your admission system');
  console.log('   → Ensure grade data is published properly');
  console.log('');
  console.log('🔧 For UCAES20240001 specifically:');
  console.log('   → Check if this student exists in your admission records');
  console.log('   → Verify the correct registration number format');
  console.log('   → May need to create this student manually if needed');

  console.log('\n🏁 Analysis Complete');
}

// Run the comprehensive analysis
comprehensiveAnalysis()
  .then(() => {
    console.log('\n✅ All checks completed. Use the information above to resolve the transcript issue.');
  })
  .catch(error => {
    console.error('❌ Analysis failed:', error);
  });














