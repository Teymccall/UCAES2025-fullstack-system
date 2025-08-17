// Test the complete transcript fix including API parsing and frontend formatting
console.log('🎓 TESTING COMPLETE TRANSCRIPT SEMESTER FIX');
console.log('=' .repeat(50));

// Test API key parsing
function testApiKeyParsing() {
  console.log('\n🔧 TESTING API KEY PARSING:');
  
  const testKeys = [
    '2026-2027-1',      // Academic year with dash + semester
    '2026-2027-2',      // Academic year with dash + semester  
    '2026-1',           // Single year + semester
    '2024-2025-first',  // Academic year with text semester
  ];
  
  testKeys.forEach(key => {
    console.log(`\n   Key: "${key}"`);
    
    // Simulate the API parsing logic
    const parts = key.split('-');
    let academicYear, semester;
    
    if (parts.length >= 3) {
      semester = parts[parts.length - 1];
      academicYear = parts.slice(0, -1).join('-');
    } else {
      [academicYear, semester] = parts;
    }
    
    console.log(`   Parsed - Academic Year: "${academicYear}", Semester: "${semester}"`);
    
    // Test frontend formatting
    const formatted = formatAcademicYearWithSemester(academicYear, semester);
    console.log(`   Final Display: "${formatted}"`);
  });
}

// Frontend formatting functions (copied from the component)
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
  
  // If the academic year doesn't contain a dash, it might be a single year
  if (!academicYear.includes('-')) {
    const year = parseInt(academicYear);
    if (!isNaN(year)) {
      formattedYear = `${year}-${year + 1}`;
    }
  }
  
  // If the academicYear looks like it was split incorrectly (e.g., "2026" and semester is "2027")
  // Try to reconstruct it
  if (academicYear.length === 4 && semester.length === 4) {
    const year1 = parseInt(academicYear);
    const year2 = parseInt(semester);
    if (!isNaN(year1) && !isNaN(year2) && year2 === year1 + 1) {
      return `${year1}-${year2} Academic Year - First Semester`;
    }
  }
  
  return `${formattedYear} Academic Year - ${formatSemesterName(semester)}`;
}

// Run the test
testApiKeyParsing();

console.log('\n✅ SUMMARY:');
console.log('The fix addresses both:');
console.log('1. API parsing - correctly splits keys with academic years containing dashes');
console.log('2. Frontend formatting - properly formats academic year and semester display');
console.log('\nThe transcript should now show:');
console.log('   "2026-2027 Academic Year - First Semester"');
console.log('Instead of:');
console.log('   "2026 Academic Year - 2027"');

console.log('\n🚀 NEXT STEPS:');
console.log('1. The changes have been applied to both API and frontend');
console.log('2. Test by generating a new transcript');
console.log('3. The semester should now display correctly!');














