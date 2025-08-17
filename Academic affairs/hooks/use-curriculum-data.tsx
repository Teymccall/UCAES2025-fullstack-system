import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Define types for curriculum data
export interface AcademicProgram {
  id: string;
  name: string;
  code: string;
  faculty: string;
  department: string;
  type: string;
  description: string;
  durationYears: number;
  credits: number;
  entryRequirements: string;
  status: string;
}

export interface AcademicCourse {
  id: string;
  code: string;
  title: string;
  description: string;
  credits: number;
  theoryHours?: number;
  practicalHours?: number;
  level: number;
  semester: number;
  year?: number;
  department: string;
  prerequisites: string[];
  programId: string;
  specialization?: string;
  isCore?: boolean;
  courseGroup?: string;
  status: string;
}

export interface ProgramSpecialization {
  id: string;
  name: string;
  code: string;
  programId: string;
  description: string;
  year: number;
}

export interface CurriculumStructure {
  programId: string;
  structure: {
    year: number;
    semester: number;
    totalCredits: number;
    courses: string[];
    specialization?: string;
    coreCourses?: string[];
    electiveGroups?: {
      [groupName: string]: string[];
    };
  }[];
}

export interface AcademicCalendar {
  year: string;
  regularSemesters: {
    name: string;
    period: string;
    registrationStart: Date;
    registrationEnd: Date;
    classesStart: Date;
    classesEnd: Date;
    examStart: Date;
    examEnd: Date;
  }[];
  weekendSemesters: {
    name: string;
    period: string;
    registrationStart: Date;
    registrationEnd: Date;
    classesStart: Date;
    classesEnd: Date;
    examStart: Date;
    examEnd: Date;
  }[];
}

// Helper function to convert Firestore timestamp to Date
const convertTimestamps = (data: any): any => {
  if (!data) return data;
  
  const result = { ...data };
  
  // Convert timestamp fields in regularSemesters
  if (result.regularSemesters) {
    result.regularSemesters = result.regularSemesters.map((semester: any) => {
      const convertedSemester = { ...semester };
      ['registrationStart', 'registrationEnd', 'classesStart', 'classesEnd', 'examStart', 'examEnd'].forEach(field => {
        if (convertedSemester[field] && typeof convertedSemester[field].toDate === 'function') {
          convertedSemester[field] = convertedSemester[field].toDate();
        }
      });
      return convertedSemester;
    });
  }
  
  // Convert timestamp fields in weekendSemesters
  if (result.weekendSemesters) {
    result.weekendSemesters = result.weekendSemesters.map((semester: any) => {
      const convertedSemester = { ...semester };
      ['registrationStart', 'registrationEnd', 'classesStart', 'classesEnd', 'examStart', 'examEnd'].forEach(field => {
        if (convertedSemester[field] && typeof convertedSemester[field].toDate === 'function') {
          convertedSemester[field] = convertedSemester[field].toDate();
        }
      });
      return convertedSemester;
    });
  }
  
  return result;
};

// Hook for fetching programs
export function useAcademicPrograms() {
  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const programsCollection = collection(db, 'academic-programs');
        const programsSnapshot = await getDocs(programsCollection);
        
        const programsList = programsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AcademicProgram[];
        
        setPrograms(programsList);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching academic programs:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  return { programs, loading, error };
}

// Hook for fetching courses by program
export function useProgramCourses(programId: string | null) {
  const [courses, setCourses] = useState<AcademicCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!programId) {
      setCourses([]);
      setLoading(false);
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesCollection = collection(db, 'academic-courses');
        const coursesQuery = query(coursesCollection, where('programId', '==', programId));
        const coursesSnapshot = await getDocs(coursesQuery);
        
        const coursesList = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AcademicCourse[];
        
        setCourses(coursesList);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching program courses:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [programId]);

  return { courses, loading, error };
}

// Hook for fetching courses by year and semester
export function useSemesterCourses(programId: string | null, year: number | null, semester: number | null) {
  const [courses, setCourses] = useState<AcademicCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!programId || year === null || semester === null) {
      setCourses([]);
      setLoading(false);
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesCollection = collection(db, 'academic-courses');
        const coursesQuery = query(
          coursesCollection,
          where('programId', '==', programId),
          where('year', '==', year),
          where('semester', '==', semester)
        );
        const coursesSnapshot = await getDocs(coursesQuery);
        
        const coursesList = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AcademicCourse[];
        
        setCourses(coursesList);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching semester courses:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [programId, year, semester]);

  return { courses, loading, error };
}

// Hook for fetching program specializations
export function useProgramSpecializations(programId: string | null) {
  const [specializations, setSpecializations] = useState<ProgramSpecialization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!programId) {
      setSpecializations([]);
      setLoading(false);
      return;
    }

    const fetchSpecializations = async () => {
      try {
        setLoading(true);
        const specializationsCollection = collection(db, 'program-specializations');
        const specializationsQuery = query(specializationsCollection, where('programId', '==', programId));
        const specializationsSnapshot = await getDocs(specializationsQuery);
        
        const specializationsList = specializationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ProgramSpecialization[];
        
        setSpecializations(specializationsList);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching program specializations:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecializations();
  }, [programId]);

  return { specializations, loading, error };
}

// Hook for fetching curriculum structure
export function useCurriculumStructure(programCode: string | null) {
  const [structure, setStructure] = useState<CurriculumStructure | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!programCode) {
      setStructure(null);
      setLoading(false);
      return;
    }

    const fetchStructure = async () => {
      try {
        setLoading(true);
        const structureDocRef = doc(db, 'curriculum-structure', programCode);
        const structureSnapshot = await getDoc(structureDocRef);
        
        if (structureSnapshot.exists()) {
          setStructure({
            ...structureSnapshot.data()
          } as CurriculumStructure);
          setError(null);
        } else {
          setStructure(null);
          setError(new Error(`Curriculum structure for ${programCode} not found`));
        }
      } catch (err: any) {
        console.error('Error fetching curriculum structure:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStructure();
  }, [programCode]);

  return { structure, loading, error };
}

// Hook for fetching academic calendar
export function useAcademicCalendar(year: string = '2024-2025') {
  const [calendar, setCalendar] = useState<AcademicCalendar | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setLoading(true);
        const calendarDocRef = doc(db, 'academic-calendar', year);
        const calendarSnapshot = await getDoc(calendarDocRef);
        
        if (calendarSnapshot.exists()) {
          const calendarData = calendarSnapshot.data();
          // Convert Firestore timestamps to JavaScript Date objects
          setCalendar(convertTimestamps(calendarData) as AcademicCalendar);
          setError(null);
        } else {
          setCalendar(null);
          setError(new Error(`Academic calendar for ${year} not found`));
        }
      } catch (err: any) {
        console.error('Error fetching academic calendar:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [year]);

  return { calendar, loading, error };
}

// Export all hooks
export default {
  useAcademicPrograms,
  useProgramCourses,
  useSemesterCourses,
  useProgramSpecializations,
  useCurriculumStructure,
  useAcademicCalendar
}; 