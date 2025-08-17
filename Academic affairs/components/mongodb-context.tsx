'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface FirestoreContextType {
  isConnected: boolean;
  connectionError: string | null;
  isConnecting: boolean;
  retryConnection: () => Promise<void>;
}

const FirestoreContext = createContext<FirestoreContextType>({
  isConnected: false,
  connectionError: null,
  isConnecting: false,
  retryConnection: async () => {}
});

export function FirestoreProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);

  const checkFirestoreConnection = async () => {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      
      // For Firebase, we'll test the connection by trying to fetch a document
      try {
        // Try to access a test collection to verify Firestore connection
        await getDocs(collection(db, 'connection_test'));
        setIsConnected(true);
      } catch (error) {
        console.error('Firestore connection test failed:', error);
        setIsConnected(false);
        setConnectionError('Could not connect to Firestore. Check your permissions.');
      }
      
      setIsConnecting(false);
    } catch (error) {
      console.error('Error checking Firebase connection:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to check Firebase connection');
      setIsConnected(false);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    checkFirestoreConnection();
  }, []);

  const retryConnection = async () => {
    await checkFirestoreConnection();
  };

  return (
    <FirestoreContext.Provider
      value={{
        isConnected,
        connectionError,
        isConnecting,
        retryConnection
      }}
    >
      {children}
    </FirestoreContext.Provider>
  );
}

export function useFirestore() {
  return useContext(FirestoreContext);
}

// Maintain the MongoDB name for backward compatibility
export const MongoDBProvider = FirestoreProvider;
export const useMongoDB = useFirestore;

// Default export for dynamic import
export default { FirestoreProvider, MongoDBProvider }; 