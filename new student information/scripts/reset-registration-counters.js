/**
 * Script to reset registration counters for fresh start
 * This will clear all existing counters so students can start with clean registration numbers
 */

// Import Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Try to initialize with default credentials
    admin.initializeApp();
    console.log("✅ Firebase Admin initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin:", error.message);
    console.log("💡 Make sure you have proper Firebase credentials configured");
    process.exit(1);
  }
}

const db = admin.firestore();

async function resetRegistrationCounters() {
  try {
    console.log("🧹 Resetting registration counters for fresh start...");
    
    // Get all documents in the registration-counters collection
    const countersRef = db.collection('registration-counters');
    const snapshot = await countersRef.get();
    
    if (snapshot.empty) {
      console.log("✅ No existing counters found - starting fresh!");
      return;
    }
    
    console.log(`📊 Found ${snapshot.size} existing counter(s) to delete:`);
    
    // Delete all existing counters
    const batch = db.batch();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   🗑️ Deleting counter: ${doc.id} (last number: ${data.lastNumber || 0})`);
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log("✅ All registration counters have been reset!");
    
    console.log("\n📋 Summary:");
    console.log("✅ Registration counters cleared");
    console.log("✅ Next registrations will start from 0001 for each academic year");
    console.log("✅ Format: UCAES{YEAR}0001, UCAES{YEAR}0002, etc.");
    
  } catch (error) {
    console.error("❌ Error resetting registration counters:", error);
    throw error;
  }
}

// Run the reset
resetRegistrationCounters()
  .then(() => {
    console.log("\n🎉 Registration counter reset completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed to reset registration counters:", error);
    process.exit(1);
  });























