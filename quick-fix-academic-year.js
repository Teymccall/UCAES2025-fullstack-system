// Quick fix to update academic year to current
console.log("🔧 Quick fix for academic year configuration");

// For testing, let's update the system to use 2024-2025
// In production, you would run this with proper Firebase credentials

const mockUpdate = {
  currentAcademicYear: "2024-2025",
  currentSemester: "First Semester",
  message: "This would update the systemConfig/academicPeriod document in Firebase"
};

console.log("📅 Would update system config to:", mockUpdate);
console.log("");
console.log("🚀 To apply this fix:");
console.log("1. Go to Firebase Console");
console.log("2. Navigate to Firestore Database");
console.log("3. Find collection: systemConfig");
console.log("4. Find document: academicPeriod");
console.log("5. Update fields:");
console.log("   - currentAcademicYear: '2024-2025'");
console.log("   - currentSemester: 'First Semester'");
console.log("");
console.log("🔒 This will fix the registration lock to use current academic year");

