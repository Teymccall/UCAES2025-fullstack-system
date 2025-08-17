// Test the semester formatting logic
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

console.log('🧪 TESTING SEMESTER FORMATTING');
console.log('=' .repeat(40));

// Test cases based on the transcript image
console.log('\n📋 Test Cases:');

// Case 1: Normal format
console.log('1. Normal format:');
console.log('   Input: academicYear="2026-2027", semester="1"');
console.log('   Output:', formatAcademicYearWithSemester("2026-2027", "1"));

// Case 2: Split format (the likely issue)
console.log('\n2. Split format (likely issue):');
console.log('   Input: academicYear="2026", semester="2027"');
console.log('   Output:', formatAcademicYearWithSemester("2026", "2027"));

// Case 3: Single year
console.log('\n3. Single year:');
console.log('   Input: academicYear="2026", semester="1"');
console.log('   Output:', formatAcademicYearWithSemester("2026", "1"));

// Case 4: Different semester formats
console.log('\n4. Different semester formats:');
console.log('   Input: academicYear="2026-2027", semester="first"');
console.log('   Output:', formatAcademicYearWithSemester("2026-2027", "first"));
console.log('   Input: academicYear="2026-2027", semester="Second"');
console.log('   Output:', formatAcademicYearWithSemester("2026-2027", "Second"));

console.log('\n✅ The fix should handle the case where "2026" and "2027" are split incorrectly!');














