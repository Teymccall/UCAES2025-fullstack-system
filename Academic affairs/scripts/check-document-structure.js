// Import Firebase Admin using CommonJS
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('../ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');

const adminApp = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount),
      databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
    })
  : getApps()[0];

const adminDb = getFirestore(adminApp);

async function checkDocumentStructure() {
  console.log('🔍 Checking document structure in admission applications...');
  
  try {
    const applicationsRef = adminDb.collection('admission-applications');
    const snapshot = await applicationsRef.limit(10).get();
    
    console.log(`📊 Found ${snapshot.docs.length} applications`);
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n📄 Application ${index + 1} (${doc.id}):`);
      console.log(`   - Name: ${data.personalInfo?.firstName || 'N/A'} ${data.personalInfo?.lastName || 'N/A'}`);
      console.log(`   - Email: ${data.contactInfo?.email || 'N/A'}`);
      console.log(`   - Status: ${data.applicationStatus || 'N/A'}`);
      
      // Check documents field structure
      console.log('\n   📁 Documents field:');
      if (data.documents) {
        console.log(`      Type: ${typeof data.documents}`);
        console.log(`      Structure:`, JSON.stringify(data.documents, null, 8));
        
        // Check for specific document types
        if (data.documents.idDocument) {
          console.log(`      ✅ ID Document: ${typeof data.documents.idDocument === 'object' ? 'Object with URL' : 'Direct URL'}`);
          if (typeof data.documents.idDocument === 'object') {
            console.log(`         URL: ${data.documents.idDocument.url || 'N/A'}`);
            console.log(`         Public ID: ${data.documents.idDocument.publicId || 'N/A'}`);
          } else {
            console.log(`         Value: ${data.documents.idDocument}`);
          }
        }
        
        if (data.documents.certificate) {
          console.log(`      ✅ Certificate: ${typeof data.documents.certificate === 'object' ? 'Object with URL' : 'Direct URL'}`);
          if (typeof data.documents.certificate === 'object') {
            console.log(`         URL: ${data.documents.certificate.url || 'N/A'}`);
            console.log(`         Public ID: ${data.documents.certificate.publicId || 'N/A'}`);
          } else {
            console.log(`         Value: ${data.documents.certificate}`);
          }
        }
        
        if (data.documents.transcript) {
          console.log(`      ✅ Transcript: ${typeof data.documents.transcript === 'object' ? 'Object with URL' : 'Direct URL'}`);
          if (typeof data.documents.transcript === 'object') {
            console.log(`         URL: ${data.documents.transcript.url || 'N/A'}`);
            console.log(`         Public ID: ${data.documents.transcript.publicId || 'N/A'}`);
          } else {
            console.log(`         Value: ${data.documents.transcript}`);
          }
        }
        
        if (data.documents.photo) {
          console.log(`      ✅ Photo: ${typeof data.documents.photo === 'object' ? 'Object with URL' : 'Direct URL'}`);
          if (typeof data.documents.photo === 'object') {
            console.log(`         URL: ${data.documents.photo.url || 'N/A'}`);
            console.log(`         Public ID: ${data.documents.photo.publicId || 'N/A'}`);
          } else {
            console.log(`         Value: ${data.documents.photo}`);
          }
        }
      } else {
        console.log('      ❌ No documents field found');
      }
      
      console.log('\n   ═══════════════════════════════════════');
    });
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error checking document structure:', error);
    return { success: false, error: error.message };
  }
}

// Run the check
checkDocumentStructure()
  .then(result => {
    if (result.success) {
      console.log('\n✅ Document structure check completed!');
    } else {
      console.log('\n❌ Check failed!');
      console.log(`🚨 Error: ${result.error}`);
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });


