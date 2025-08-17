'use client';

import { db } from './firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

/**
 * Generate fallback academic years from 2010 to current+2
 * @returns Array of academic years sorted by most recent first
 */
export function generateFallbackYears(): string[] {
  const years = [];
  const currentYear = new Date().getFullYear();
  
  // Generate academic years from 2010 to current+2
  for (let year = 2010; year <= Math.max(currentYear + 2, 2026); year++) {
    years.push(`${year}/${year + 1}`);
  }
  
  // Sort with most recent first
  return years.sort((a, b) => {
    const yearA = parseInt(a.split('/')[0]);
    const yearB = parseInt(b.split('/')[0]);
    return yearB - yearA;
  });
}

// Create a non-client version of the function for server use
export const generateServerFallbackYears = typeof window === 'undefined' 
  ? generateFallbackYears 
  : () => [];

/**
 * Get all academic years from Firestore
 * @returns Promise with array of academic years
 */
export async function getAcademicYears(): Promise<string[]> {
  try {
    const academicYearsRef = collection(db, 'academic-years');
    const q = query(academicYearsRef, orderBy('year', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('No academic years found in database, using fallbacks');
      return generateFallbackYears();
    }
    
    // Extract year strings from documents
    const academicYears = snapshot.docs.map(doc => doc.data().year);
    
    // If we have years from Firestore, use them, otherwise use fallback
    if (academicYears.length > 0) {
      console.log(`Found ${academicYears.length} academic years in database`);
      return academicYears;
    } else {
      console.log('No valid academic years in database, using fallbacks');
      return generateFallbackYears();
    }
  } catch (error) {
    console.error('Error fetching academic years:', error);
    return generateFallbackYears();
  }
}

/**
 * Get the current academic year
 * @returns Promise with the current academic year or null
 */
export async function getCurrentAcademicYear(): Promise<string | null> {
  try {
    const academicYearsRef = collection(db, 'academic-years');
    const q = query(academicYearsRef, where('isCurrent', '==', true));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].data().year;
    }
    
    // If no current year is set, use the current calendar year
    const currentYear = new Date().getFullYear();
    return `${currentYear}/${currentYear + 1}`;
  } catch (error) {
    console.error('Error fetching current academic year:', error);
    const currentYear = new Date().getFullYear();
    return `${currentYear}/${currentYear + 1}`;
  }
}

/**
 * Initialize academic years in local storage for faster access
 */
export async function initializeAcademicYears(): Promise<void> {
  try {
    const academicYears = await getAcademicYears();
    
    // Cache the result in localStorage for faster access
    if (typeof window !== 'undefined') {
      localStorage.setItem('academicYears', JSON.stringify(academicYears));
    }
    
    console.log('Academic years initialized:', academicYears);
  } catch (error) {
    console.error('Error initializing academic years:', error);
  }
} 