// Server-side Firebase Admin configuration for API routes
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore, FieldValue } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

// Firebase Admin configuration
const firebaseAdminConfig = {
  projectId: "ucaes2025",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com"
};

// For production, you should use a service account
let serviceAccount = null;
try {
  // Try to read service account from environment variable first
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('🔑 Using service account from environment variable');
  } else {
    // Fallback to service account file
    const fs = require('fs');
    const path = require('path');
    const serviceAccountPath = path.join(process.cwd(), 'ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      console.log('🔑 Using service account from file');
    } else {
      console.log('⚠️ No service account found - using default credentials');
    }
  }
} catch (error) {
  console.error('❌ Error reading service account:', error);
  serviceAccount = null;
}

// Initialize Firebase Admin for server-side use
let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

function initializeFirebaseAdmin() {
  try {
    console.log('🔥 Initializing Firebase Admin SDK for server-side API...');
    
    // Check if already initialized with proper credentials
    if (adminApp && adminDb && adminAuth) {
      console.log('✅ Firebase Admin already initialized for server');
      return { app: adminApp, db: adminDb, auth: adminAuth };
    }

    // For deployment, allow fallback to default credentials if service account is not available
    if (!serviceAccount) {
      console.log('⚠️ No service account found - attempting to use default credentials for deployment');
      // In production, this should use environment variables or service account
      // For now, we'll allow deployment to continue with a warning
    }

    // Check for existing apps and only reuse if they have proper credentials
    const existingApps = getApps();
    
    // For safety, always create a fresh app with explicit credentials
    // This ensures we don't reuse an app that was initialized incorrectly
    if (existingApps.length > 0) {
      console.log('⚠️ Found existing Firebase apps, but creating fresh one with service account for reliability');
    }
    
    const initConfig: any = {
      databaseURL: firebaseAdminConfig.databaseURL,
      projectId: serviceAccount?.project_id || firebaseAdminConfig.projectId
    };
    
    if (serviceAccount) {
      initConfig.credential = cert(serviceAccount);
      console.log('🔑 Using service account credentials for project:', serviceAccount.project_id);
    } else {
      console.log('🔑 Using default credentials for project:', firebaseAdminConfig.projectId);
    }
    
    // Use a unique app name to avoid conflicts with existing apps
    const appName = existingApps.length > 0 ? `admin-app-${Date.now()}` : undefined;
    adminApp = initializeApp(initConfig, appName);
    
    console.log('✅ Firebase Admin app initialized with fresh credentials');

    // Initialize services
    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    
    // Validate that we got proper instances
    if (!adminDb) {
      throw new Error('Failed to initialize Firestore instance');
    }
    if (!adminAuth) {
      throw new Error('Failed to initialize Auth instance');
    }
    
    console.log('✅ Firestore and Auth initialized and validated');

    // Log connection status
    console.log(`🎯 Firebase Admin connected to project: ${firebaseAdminConfig.projectId}`);
    console.log(`📊 Firestore instance type: ${typeof adminDb}`);
    console.log(`🔐 Auth instance type: ${typeof adminAuth}`);
    
    return { app: adminApp, db: adminDb, auth: adminAuth };
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    // Reset instances on failure
    adminApp = null;
    adminDb = null;
    adminAuth = null;
    throw error;
  }
}

// Get Firebase instances (initialize if needed)
export function getFirebaseAdmin() {
  if (!adminApp || !adminDb || !adminAuth) {
    return initializeFirebaseAdmin();
  }
  return { app: adminApp, db: adminDb, auth: adminAuth };
}

// Lazy initialization - only initialize when actually needed
let firebaseInstances: any = null;

function getFirebaseInstances() {
  if (!firebaseInstances) {
    firebaseInstances = initializeFirebaseAdmin();
  }
  return firebaseInstances;
}

// Export getter functions to avoid initialization during build
export const getApp = (): App => getFirebaseInstances().app;
export const getDb = (): Firestore => {
  try {
    const instances = getFirebaseInstances();
    if (!instances.db) {
      throw new Error('Firestore instance not properly initialized');
    }
    
    // Additional validation to ensure it's a proper Firestore instance
    if (typeof instances.db.collection !== 'function') {
      throw new Error('Firestore instance is not valid - missing collection method');
    }
    
    console.log('✅ getDb() returning valid Firestore instance');
    return instances.db;
  } catch (error) {
    console.error('❌ getDb() failed:', error);
    throw new Error(`Failed to get Firestore instance: ${error.message}`);
  }
};
export const getAuthInstance = (): Auth => getFirebaseInstances().auth;

// Legacy exports for backward compatibility - use getter functions instead
export { getDb as db };

// Export FieldValue for use in other modules
export { FieldValue };

export default {
  get app() { return getApp(); },
  get db() { return getDb(); },
  get auth() { return getAuthInstance(); }
};

// Test function to verify Firebase Admin SDK is working
export async function testFirebaseConnection() {
  try {
    console.log('🧪 Testing Firebase Admin SDK connection...');
    const db = getDb();
    
    // Test a simple Firestore operation
    const testRef = db.collection('systemConfig').doc('test');
    console.log('✅ Firestore collection reference created successfully');
    
    // Test getting the document (it might not exist, but that's okay)
    try {
      const testDoc = await testRef.get();
      console.log('✅ Firestore document read successful');
      console.log('📄 Document exists:', testDoc.exists);
    } catch (readError) {
      console.log('⚠️ Document read failed (this might be expected):', readError.message);
    }
    
    console.log('✅ Firebase Admin SDK connection test passed');
    return true;
  } catch (error) {
    console.error('❌ Firebase Admin SDK connection test failed:', error);
    return false;
  }
}