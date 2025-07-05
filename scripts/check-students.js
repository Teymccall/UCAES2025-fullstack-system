// Helper function to log student information
function logStudents(snapshot) {
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`\nStudent ID: ${doc.id}`);
    console.log(`- Registration Number: ${data.registrationNumber || 'N/A'}`);
    console.log(`- Student Index Number: ${data.studentIndexNumber || 'N/A'}`);
    console.log(`- Index Number: ${data.indexNumber || 'N/A'}`);
    console.log(`- Name: ${data.surname || ''} ${data.otherNames || ''}`);
    
    // Detailed analysis of date of birth field
    console.log('\nDate of Birth Analysis:');
    const dob = data.dateOfBirth;
    console.log(`- Raw value: "${dob}"`);
    console.log(`- Type: ${typeof dob}`);
    console.log(`- Length: ${dob ? dob.length : 0}`);
    
    if (dob) {
      console.log('- Character codes:');
      for (let i = 0; i < dob.length; i++) {
        console.log(`  Position ${i}: "${dob[i]}" (char code: ${dob.charCodeAt(i)})`);
      }
    }
    
    console.log('\nLogin Instructions:');
    console.log(`1. Student ID/Index: ${data.studentIndexNumber || data.registrationNumber || data.indexNumber}`);
    console.log(`2. Date of Birth: ${data.dateOfBirth} (Format: DD-MM-YYYY)`);
  });
} 