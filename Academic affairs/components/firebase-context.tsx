"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import type { Firestore } from "firebase/firestore";
import type { Auth } from "firebase/auth";

interface FirebaseContextType {
  db: Firestore;
  auth: Auth;
  isInitialized: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Initialize the database
    fetch("/api/init-db", { method: "POST" })
      .then(() => {
        console.log('Database initialized successfully');
        setIsInitialized(true);
      })
      .catch(error => {
        console.error('Error initializing database:', error);
        setIsInitialized(true);
      });
  }, []);
  
  return (
    <FirebaseContext.Provider value={{ db, auth, isInitialized }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
}