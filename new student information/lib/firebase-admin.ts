import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import * as path from 'path';
import * as fs from 'fs';

// Initialize Firebase Admin SDK only once
if (!getApps().length) {
  try {
    console.log('Initializing Firebase Admin SDK...');
    
    // Path to the service account key file
    const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      // Use service account key file
      console.log('Using service account key file for admin initialization');
      
      try {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: 'https://ucaes2025-default-rtdb.firebaseio.com',
        });
        
        console.log('Firebase Admin SDK initialized with service account');
      } catch (fileError) {
        console.error('Error loading service account:', fileError);
        throw fileError;
      }
    } else {
      // Fall back to environment variables or application default credentials
      console.log('Service account key file not found, using environment variables or application default');
      
      if (process.env.FIREBASE_ADMIN_PROJECT_ID) {
        // Use environment variables if available
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
          databaseURL: process.env.FIREBASE_ADMIN_DATABASE_URL || 'https://ucaes2025-default-rtdb.firebaseio.com',
        });
        
        console.log('Firebase Admin SDK initialized with environment variables');
      } else {
        // Use application default credentials (for production environments)
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: 'ucaes2025',
          databaseURL: 'https://ucaes2025-default-rtdb.firebaseio.com',
        });
        
        console.log('Firebase Admin SDK initialized with application default credentials');
      }
    }
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    throw error; // Re-throw to make startup failures obvious
  }
}

// Test Firebase connection to verify setup
(async () => {
  try {
    const snapshot = await admin.firestore().collection('student-registrations').limit(1).get();
    console.log(`Firebase Admin SDK connection verified. Found ${snapshot.size} document(s)`);
  } catch (error) {
    console.error('Firebase Admin connection test failed:', error);
  }
})();

export default admin; 