import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface SystemConfig {
  currentAcademicYear: string | null;
  currentAcademicYearId: string | null;
  currentSemester: string | null;
  currentSemesterId: string | null;
  lastUpdated: Date | null;
  admissionStatus: string | null;
}

interface SystemConfigContextType extends SystemConfig {
  isLoading: boolean;
  refreshConfig: () => void;
}

const SystemConfigContext = createContext<SystemConfigContextType | undefined>(undefined);

export const useSystemConfig = () => {
  const context = useContext(SystemConfigContext);
  if (context === undefined) {
    throw new Error('useSystemConfig must be used within a SystemConfigProvider');
  }
  return context;
};

export const SystemConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SystemConfig>({
    currentAcademicYear: null,
    currentAcademicYearId: null,
    currentSemester: null,
    currentSemesterId: null,
    lastUpdated: null,
    admissionStatus: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔧 SystemConfigProvider: Setting up real-time listener...');
    
    // Subscribe to changes in system config
    const configRef = doc(db, 'systemConfig', 'academicPeriod');
    const unsubscribe = onSnapshot(
      configRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const newConfig: SystemConfig = {
            currentAcademicYear: data.currentAcademicYear || null,
            currentAcademicYearId: data.currentAcademicYearId || null,
            currentSemester: data.currentSemester || null,
            currentSemesterId: data.currentSemesterId || null,
            lastUpdated: data.lastUpdated?.toDate() || null,
            admissionStatus: data.admissionStatus || null,
          };
          
          console.log('✅ SystemConfigProvider: Received updated configuration:', newConfig);
          setConfig(newConfig);
        } else {
          console.log('⚠️ SystemConfigProvider: No system configuration found');
          setConfig({
            currentAcademicYear: null,
            currentAcademicYearId: null,
            currentSemester: null,
            currentSemesterId: null,
            lastUpdated: null,
            admissionStatus: null,
          });
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('❌ SystemConfigProvider: Error listening to system config:', error);
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      console.log('🔧 SystemConfigProvider: Cleaning up listener...');
      unsubscribe();
    };
  }, []);

  const refreshConfig = () => {
    console.log('🔄 SystemConfigProvider: Manual refresh requested');
    // The onSnapshot listener will automatically pick up any changes
  };

  return (
    <SystemConfigContext.Provider value={{ ...config, isLoading, refreshConfig }}>
      {children}
    </SystemConfigContext.Provider>
  );
};