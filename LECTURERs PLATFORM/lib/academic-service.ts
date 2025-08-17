import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  doc,
  getDoc
} from 'firebase/firestore';
import type { AcademicYear, AcademicSemester } from './types';

/**
 * Service for fetching academic data (years, semesters) from Firestore
 * This service ensures the lecturer platform uses the same academic data
 * that is set by the academic affairs director
 */
export const AcademicService = {
  /**
   * Get the current active academic year
   */
  async getCurrentAcademicYear(): Promise<AcademicYear | null> {
    try {
      // Query the academic-years collection for active year
      const yearsRef = collection(db, 'academic-years');
      const q = query(
        yearsRef,
        where('status', '==', 'active'),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('No active academic year found');
        return null;
      }
      
      const yearDoc = snapshot.docs[0];
      const yearData = yearDoc.data();
      
      console.log('Found active academic year:', yearData);
      
      // Convert Firestore timestamp to Date if needed
      const startDate = yearData.startDate ? 
        (typeof yearData.startDate.toDate === 'function' ? yearData.startDate.toDate() : new Date(yearData.startDate)) : 
        new Date();
        
      const endDate = yearData.endDate ? 
        (typeof yearData.endDate.toDate === 'function' ? yearData.endDate.toDate() : new Date(yearData.endDate)) : 
        new Date();
      
      // Make sure we use the exact year format from academic affairs (e.g., "2026-2027")
      // The year field should be prioritized as this is what academic affairs uses
      const yearValue = yearData.year || yearData.name;
      
      return {
        id: yearDoc.id,
        year: yearValue,
        name: yearValue, // Use the same value for both to ensure consistency
        startDate,
        endDate,
        status: yearData.status
      };
    } catch (error) {
      console.error('Error fetching current academic year:', error);
      return null;
    }
  },
  
  /**
   * Get all academic years
   */
  async getAllAcademicYears(): Promise<AcademicYear[]> {
    try {
      const yearsRef = collection(db, 'academic-years');
      const snapshot = await getDocs(yearsRef);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Make sure we use the exact year format from academic affairs
        const yearValue = data.year || data.name;
        
        return {
          id: doc.id,
          year: yearValue,
          name: yearValue, // Use the same value for both to ensure consistency
          startDate: data.startDate ? 
            (typeof data.startDate.toDate === 'function' ? data.startDate.toDate() : new Date(data.startDate)) : 
            new Date(),
          endDate: data.endDate ? 
            (typeof data.endDate.toDate === 'function' ? data.endDate.toDate() : new Date(data.endDate)) : 
            new Date(),
          status: data.status
        };
      });
    } catch (error) {
      console.error('Error fetching academic years:', error);
      return [];
    }
  },
  
  /**
   * Get current semesters (both Regular and Weekend)
   */
  async getCurrentSemesters(): Promise<{
    regularSemester: AcademicSemester | null,
    weekendSemester: AcademicSemester | null
  }> {
    try {
      // First get the active academic year
      const currentYear = await this.getCurrentAcademicYear();
      
      if (!currentYear) {
        return { regularSemester: null, weekendSemester: null };
      }
      
      // Query the academic-semesters collection for active semesters in this year
      const semestersRef = collection(db, 'academic-semesters');
      const q = query(
        semestersRef,
        where('academicYear', '==', currentYear.id),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(q);
      
      let regularSemester: AcademicSemester | null = null;
      let weekendSemester: AcademicSemester | null = null;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log('Found active semester:', data);
        
        const semester: AcademicSemester = {
          id: doc.id,
          name: data.name,
          academicYear: data.academicYear,
          programType: data.programType || 'Regular', // Default to Regular if not specified
          startDate: data.startDate ? 
            (typeof data.startDate.toDate === 'function' ? data.startDate.toDate() : new Date(data.startDate)) : 
            new Date(),
          endDate: data.endDate ? 
            (typeof data.endDate.toDate === 'function' ? data.endDate.toDate() : new Date(data.endDate)) : 
            new Date(),
          status: data.status
        };
        
        if (semester.programType === 'Regular') {
          regularSemester = semester;
        } else if (semester.programType === 'Weekend') {
          weekendSemester = semester;
        }
      });
      
      return { regularSemester, weekendSemester };
    } catch (error) {
      console.error('Error fetching current semesters:', error);
      return { regularSemester: null, weekendSemester: null };
    }
  },
  
  /**
   * Get semesters for a specific academic year
   */
  async getSemestersByYear(yearId: string): Promise<AcademicSemester[]> {
    try {
      const semestersRef = collection(db, 'academic-semesters');
      const q = query(
        semestersRef,
        where('academicYear', '==', yearId)
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          academicYear: data.academicYear,
          programType: data.programType || 'Regular',
          startDate: data.startDate ? 
            (typeof data.startDate.toDate === 'function' ? data.startDate.toDate() : new Date(data.startDate)) : 
            new Date(),
          endDate: data.endDate ? 
            (typeof data.endDate.toDate === 'function' ? data.endDate.toDate() : new Date(data.endDate)) : 
            new Date(),
          status: data.status
        };
      });
    } catch (error) {
      console.error('Error fetching semesters by year:', error);
      return [];
    }
  }
}; 