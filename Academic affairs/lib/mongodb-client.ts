// Firebase client interface
// This file provides compatibility with code expecting MongoDB

import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

// For compatibility with code expecting mongoose
export const mongoose = {
  connection: {
    isConnected: true
  }
};

// Check Firestore connection by performing a simple query
export async function checkConnection() {
  try {
    // Try to access a test collection
    const querySnapshot = await getDocs(collection(db, 'connection_test'));
    return { isConnected: true };
  } catch (error) {
    console.error("Firestore connection error:", error);
  return { 
      isConnected: false, 
      error: error instanceof Error ? error.message : "Unknown connection error" 
  };
  }
}

// Export functions for client components
export async function connectToClientDatabase() {
  return checkConnection();
}