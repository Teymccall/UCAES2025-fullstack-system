// Firebase compatibility layer for code expecting MongoDB
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

// Mongoose compatibility object
export const mongoose = {
  connect: async () => {
    return { connection: { db: { databaseName: 'firebase-firestore' } } };
  },
  connection: { isConnected: true },
  models: {}
};

// Connection function for compatibility
export async function connectToDatabase() {
  console.log("=> using Firebase Firestore as database");
  return { connection: { isConnected: true } };
}

// Test Firestore connection
export async function testFirestoreConnection() {
  try {
    // Try to access a test collection
    await getDocs(collection(db, 'connection_test'));
    
    return {
      success: true,
      database: 'firebase-firestore',
      message: 'Connected to Firebase Firestore'
    };
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Failed to connect to Firestore. Check your Firebase security rules and authentication.'
    };
  }
}

// Maintain MongoDB function name for backwards compatibility
export const testMongoDBConnection = testFirestoreConnection;