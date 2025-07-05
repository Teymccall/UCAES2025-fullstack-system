'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { checkConnection, connectToClientDatabase } from '@/lib/mongodb-client';

interface MongoDBContextType {
  isConnected: boolean;
  connectionError: string | null;
  isConnecting: boolean;
  retryConnection: () => Promise<void>;
}

const MongoDBContext = createContext<MongoDBContextType>({
  isConnected: false,
  connectionError: null,
  isConnecting: false,
  retryConnection: async () => {}
});

export function MongoDBProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);

  const connectToMongoDB = async () => {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      
      // For client components, we'll just check if the connection is already established
      // The actual connection is handled by API routes and server components
      const connection = await checkConnection();
      setIsConnected(connection.isConnected);
      
      // If not connected, we'll try to call an API endpoint to check MongoDB status
      if (!connection.isConnected) {
        try {
          const response = await fetch('/api/mongodb/status');
          const data = await response.json();
          setIsConnected(data.connected);
        } catch (apiError) {
          console.error('Error checking MongoDB status:', apiError);
          // Don't set error here as it's expected in client components
        }
      }
      
      setIsConnecting(false);
    } catch (error) {
      console.error('Error checking MongoDB connection:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to check MongoDB connection');
      setIsConnected(false);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    connectToMongoDB();
  }, []);

  const retryConnection = async () => {
    await connectToMongoDB();
  };

  return (
    <MongoDBContext.Provider
      value={{
        isConnected,
        connectionError,
        isConnecting,
        retryConnection
      }}
    >
      {children}
    </MongoDBContext.Provider>
  );
}

export function useMongoDB() {
  return useContext(MongoDBContext);
}

// Default export for dynamic import
export default { MongoDBProvider }; 