"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface AcademicContextType {
  activeYear: string | null;
  activeSemester: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AcademicContext = createContext<AcademicContextType>({
  activeYear: null,
  activeSemester: null,
  loading: true,
  refresh: async () => {},
});

export function AcademicProvider({ children }: { children: ReactNode }) {
  const [activeYear, setActiveYear] = useState<string | null>(null);
  const [activeSemester, setActiveSemester] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAcademicData = async () => {
    setLoading(true);
    try {
      // Fetch active academic year
      const yearSnap = await getDocs(
        query(collection(db, "academic-years"), where("status", "==", "active"), limit(1))
      );
      if (!yearSnap.empty) {
        const yearDoc = yearSnap.docs[0];
        setActiveYear(yearDoc.data().year);
        // Fetch active semester for that year
        const semSnap = await getDocs(
          query(
            collection(db, "academic-semesters"),
            where("academicYear", "==", yearDoc.id),
            where("status", "==", "active"),
            limit(1)
          )
        );
        if (!semSnap.empty) {
          setActiveSemester(semSnap.docs[0].data().name);
        } else {
          setActiveSemester(null);
        }
      } else {
        setActiveYear(null);
        setActiveSemester(null);
      }
    } catch (e) {
      setActiveYear(null);
      setActiveSemester(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicData();
  }, []);

  return (
    <AcademicContext.Provider value={{ activeYear, activeSemester, loading, refresh: fetchAcademicData }}>
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic() {
  return useContext(AcademicContext);
} 