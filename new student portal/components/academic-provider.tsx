"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { useAuth } from "@/components/auth-provider";

// Define academic year and semester types
interface AcademicYear {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "completed" | "upcoming";
}

interface AcademicSemester {
  id: string;
  name: string;
  programType: "Regular" | "Weekend";
  academicYear: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "completed" | "upcoming";
}

// Context interface
interface AcademicContextType {
  activeYear: AcademicYear | null;
  activeRegularSemester: AcademicSemester | null;
  activeWeekendSemester: AcademicSemester | null;
  currentStudentSemester: AcademicSemester | null;
  loading: boolean;
}

// Create context
const AcademicContext = createContext<AcademicContextType>({
  activeYear: null,
  activeRegularSemester: null,
  activeWeekendSemester: null,
  currentStudentSemester: null,
  loading: true,
});

// Provider component
export function AcademicProvider({ children }: { children: ReactNode }) {
  const [activeYear, setActiveYear] = useState<AcademicYear | null>(null);
  const [activeRegularSemester, setActiveRegularSemester] = useState<AcademicSemester | null>(null);
  const [activeWeekendSemester, setActiveWeekendSemester] = useState<AcademicSemester | null>(null);
  const [currentStudentSemester, setCurrentStudentSemester] = useState<AcademicSemester | null>(null);
  const [loading, setLoading] = useState(true);
  const { student } = useAuth();

  useEffect(() => {
    const fetchActiveAcademic = async () => {
      try {
        setLoading(true);

        // Fetch active academic year
        const yearsRef = collection(db, "academic-years");
        const yearQuery = query(yearsRef, where("status", "==", "active"), limit(1));
        const yearSnapshot = await getDocs(yearQuery);

        if (!yearSnapshot.empty) {
          const yearDoc = yearSnapshot.docs[0];
          const yearData = yearDoc.data();

          setActiveYear({
            id: yearDoc.id,
            name: yearData.name || yearData.year,
            startDate: yearData.startDate?.toDate() || new Date(),
            endDate: yearData.endDate?.toDate() || new Date(),
            status: yearData.status,
          });

          // Fetch active semesters for this year
          const semestersRef = collection(db, "academic-semesters");
          const semestersQuery = query(
            semestersRef,
            where("academicYear", "==", yearDoc.id),
            where("status", "==", "active")
          );
          const semestersSnapshot = await getDocs(semestersQuery);

          semestersSnapshot.forEach((doc) => {
            const semesterData = doc.data();
            const semester = {
              id: doc.id,
              name: semesterData.name,
              programType: semesterData.programType,
              academicYear: yearDoc.id,
              startDate: semesterData.startDate?.toDate() || new Date(),
              endDate: semesterData.endDate?.toDate() || new Date(),
              status: semesterData.status,
            };

            if (semesterData.programType === "Regular") {
              setActiveRegularSemester(semester);
            } else if (semesterData.programType === "Weekend") {
              setActiveWeekendSemester(semester);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching academic data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveAcademic();
  }, []);

  // Determine the current student's semester based on their program type
  useEffect(() => {
    if (student && student.studyMode) {
      if (student.studyMode === "Weekend" && activeWeekendSemester) {
        setCurrentStudentSemester(activeWeekendSemester);
      } else if (activeRegularSemester) {
        // Default to Regular program
        setCurrentStudentSemester(activeRegularSemester);
      }
    }
  }, [student, activeRegularSemester, activeWeekendSemester]);

  return (
    <AcademicContext.Provider
      value={{
        activeYear,
        activeRegularSemester,
        activeWeekendSemester,
        currentStudentSemester,
        loading,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
}

// Hook to use academic context
export function useAcademic() {
  const context = useContext(AcademicContext);
  if (context === undefined) {
    throw new Error("useAcademic must be used within an AcademicProvider");
  }
  return context;
} 