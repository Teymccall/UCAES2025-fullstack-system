"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Define the context type
interface SystemConfigContextType {
  academicYear: string | null; // For backward compatibility
  semester: string | null; // For backward compatibility
  currentAcademicYear: string | null;
  currentAcademicYearId: string | null;
  currentSemester: string | null;
  currentSemesterId: string | null;
  currentProgramType: string | null;
  lastUpdated: Date | null;
  isLoading: boolean;
}

// Create context with default values
const SystemConfigContext = createContext<SystemConfigContextType>({
  academicYear: null,
  semester: null,
  currentAcademicYear: null,
  currentAcademicYearId: null,
  currentSemester: null,
  currentSemesterId: null,
  currentProgramType: null,
  lastUpdated: null,
  isLoading: true,
});

// Provider component
export function SystemConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState({
    academicYear: null,
    semester: null,
    currentAcademicYear: null,
    currentAcademicYearId: null,
    currentSemester: null,
    currentSemesterId: null,
    currentProgramType: null,
    lastUpdated: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to changes in system config
    const configRef = doc(db, "systemConfig", "academicPeriod");
    const unsubscribe = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        console.log("System config updated:", data);
        setConfig({
          academicYear: data.currentAcademicYear, // For backward compatibility
          semester: data.currentSemester, // For backward compatibility
          currentAcademicYear: data.currentAcademicYear,
          currentAcademicYearId: data.currentAcademicYearId,
          currentSemester: data.currentSemester,
          currentSemesterId: data.currentSemesterId,
          currentProgramType: data.currentProgramType,
          lastUpdated: data.lastUpdated?.toDate() || null,
        });
      } else {
        console.log("No system config found");
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error getting system config:", error);
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <SystemConfigContext.Provider value={{ ...config, isLoading }}>
      {children}
    </SystemConfigContext.Provider>
  );
}

// Custom hook for using the context
export function useSystemConfig() {
  return useContext(SystemConfigContext);
} 