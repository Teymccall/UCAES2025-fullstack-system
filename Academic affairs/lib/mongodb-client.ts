// Client-safe MongoDB connection utility
// This file is for client components and avoids using Node.js-specific features

import mongoose from 'mongoose';

// MongoDB configuration
let MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI;

// Cache for connection status
declare global {
  var mongooseClientConnection: {
    isConnected: boolean;
  };
}

// Initialize the mongoose connection status
global.mongooseClientConnection = global.mongooseClientConnection || { isConnected: false };

// Simple connection check function for client components
export async function checkConnection() {
  return { 
    isConnected: global.mongooseClientConnection?.isConnected || false 
  };
}

// Dummy function that returns connection status for client components
// Real connections should happen only in API routes or server components
export async function connectToClientDatabase() {
  return checkConnection();
}

// Export mongoose for type usage in client components
export { mongoose }; 