'use client';

import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// Define program interface
interface Program {
  id: string;
  name: string;
  duration?: number;
  type?: string;
  [key: string]: any; // Allow for additional fields
}

// List of program names for the college (based on official university offerings)
export const COLLEGE_PROGRAM_NAMES = [
  // 4-Year Degree Programs
  "B.Sc. Sustainable Agriculture",
  "B.Sc. Environmental Science and Management",
  "Certificate in Agriculture", // Added as degree program
  "Certificate in Environmental Science", // Added as degree program
  // 2-Year Diploma Programs
  "Diploma in Organic Agriculture",
  // 1-Year Certificate Courses
  "Certificate in Sustainable Agriculture",
  "Certificate in Waste Management & Environmental Health",
  "Certificate in Bee Keeping",
  "Certificate in Agribusiness",
  "Certificate in Business Administration"
];

// Program categories and details
export const PROGRAM_CATEGORIES = {
  degree: {
    title: "Degree Programmes",
    programs: [
      "B.Sc. Sustainable Agriculture",
      "B.Sc. Environmental Science and Management",
      "Certificate in Agriculture", // This is a degree program (2-year)
      "Certificate in Environmental Science" // Added degree program (2-year)
    ]
  },
  diploma: {
    title: "2-Year Diploma Programme",
    programs: [
      "Diploma in Organic Agriculture" // Only diploma program
    ]
  },
  certificate: {
    title: "1-Year Certificate Courses",
    programs: [
      "Certificate in Sustainable Agriculture",
      "Certificate in Waste Management & Environmental Health",
      "Certificate in Bee Keeping",
      "Certificate in Agribusiness",
      "Certificate in Business Administration"
    ]
  }
};

/**
 * Get all program names from the database
 * This is used for the program selection dropdown in the registration form
 */
export async function getProgramNames(): Promise<string[]> {
  try {
    const programs = await getPrograms();
    if (programs.length === 0) {
      return COLLEGE_PROGRAM_NAMES;
    }
    return programs.map(program => program.name);
  } catch (error) {
    console.error('Error fetching program names:', error);
    // Return the static fallback if there's an error
    return COLLEGE_PROGRAM_NAMES;
  }
}

/**
 * Get program details by category
 * @returns Program categories with their respective programs
 */
export function getProgramsByCategory() {
  return PROGRAM_CATEGORIES;
}

/**
 * Get program duration based on program name
 * @param programName The name of the program
 * @returns Duration in years
 */
export function getProgramDuration(programName: string): number {
  if (programName.startsWith('B.Sc.')) {
    return 4;
  } else if (programName.startsWith('Diploma')) {
    return 2;
  } else if (programName === 'Certificate in Agriculture' || programName === 'Certificate in Environmental Science') {
    return 2; // These certificates are degree-level programs
  } else if (programName.startsWith('Certificate')) {
    return 1;
  }
  return 4; // Default to 4 years for unknown programs
}

/**
 * Get program type based on program name
 * @param programName The name of the program
 * @returns Program type
 */
export function getProgramType(programName: string): 'degree' | 'diploma' | 'certificate' {
  if (programName.startsWith('B.Sc.') || programName === 'Certificate in Agriculture' || programName === 'Certificate in Environmental Science') {
    return 'degree';
  } else if (programName.startsWith('Diploma')) {
    return 'diploma';
  } else {
    return 'certificate';
  }
}

/**
 * Check if a program allows top-up to degree programs
 * @param programName The name of the program
 * @returns Boolean indicating if top-up is allowed
 */
export function isTopUpEligible(programName: string): boolean {
  return programName.startsWith('Certificate') || programName.startsWith('Diploma');
}

/**
 * Get available top-up programs for a given certificate/diploma
 * @param currentProgram The current program name
 * @returns Array of available degree programs for top-up
 */
export function getTopUpPrograms(currentProgram: string): string[] {
  // Define mapping of certificate/diploma to degree programs
  const topUpMapping: Record<string, string[]> = {
    'Certificate in Sustainable Agriculture': ['B.Sc. Sustainable Agriculture', 'Certificate in Agriculture'],
    'Certificate in Business Administration': ['B.Sc. Sustainable Agriculture', 'B.Sc. Environmental Science and Management'],
    'Certificate in Agribusiness': ['B.Sc. Sustainable Agriculture'],
    'Diploma in Organic Agriculture': ['B.Sc. Sustainable Agriculture', 'Certificate in Agriculture'],
    // Add more mappings as needed
  };
  
  return topUpMapping[currentProgram] || PROGRAM_CATEGORIES.degree.programs;
}

/**
 * Initialize program selection in the registration form
 * This can be used to pre-populate the dropdown and cache the programs
 */
export async function initializeProgramSelection(): Promise<void> {
  try {
    const programs = await getProgramNames();
    
    // You could cache the result in localStorage for faster access
    if (typeof window !== 'undefined') {
      localStorage.setItem('programNames', JSON.stringify(programs));
    }
    
    console.log('Program names initialized:', programs);
  } catch (error) {
    console.error('Error initializing program selection:', error);
  }
}

// Fetch data from Firebase Firestore
async function fetchDataFromFirestore(collectionName: string, orderField: string = 'name'): Promise<Program[]> {
  try {
    const collectionRef = collection(db, collectionName);
    
    // Apply ordering
    const q = query(collectionRef, orderBy(orderField));
    
    // Get documents
    const snapshot = await getDocs(q);
    
    // Return the documents
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Program[];
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
}

// Update functions to use Firebase
export async function getPrograms(): Promise<Program[]> {
  return fetchDataFromFirestore('programs');
}

/**
 * Get programs by type
 * @param type Program type (degree, diploma, certificate)
 * @returns Programs of the specified type
 */
export function getProgramsByType(type: 'degree' | 'diploma' | 'certificate'): string[] {
  return PROGRAM_CATEGORIES[type]?.programs || [];
} 