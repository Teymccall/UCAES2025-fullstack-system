'use client';

import { db } from './firebase';
import { collection, doc, setDoc, getDocs, query, where, orderBy, getDoc } from 'firebase/firestore';

// Define the Program type
export interface Program {
  id: string;
  name: string;
  code: string;
  department: string;
  coordinator: string;
  entryRequirements: string;
  duration: string;
  description: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
  coursesPerLevel?: {
    [level: string]: {
      [semester: string]: string[];
    };
  };
}

// Programs offered by the college
export const COLLEGE_PROGRAMS: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: "B.Sc. Sustainable Agriculture",
    code: "BSA",
    department: "Agriculture",
    coordinator: "Dr. Kwame Boateng",
    entryRequirements: "WASSCE with credits in English, Mathematics, and Science subjects",
    duration: "4 years",
    description: "Comprehensive program covering sustainable agricultural practices, crop production, soil management, and ecological farming systems.",
    status: "Active",
    coursesPerLevel: {
      "100": {
        "1": [],
        "2": []
      },
      "200": {
        "1": [],
        "2": []
      },
      "300": {
        "1": [],
        "2": []
      },
      "400": {
        "1": [],
        "2": []
      }
    }
  },
  {
    name: "B.Sc. Sustainable Forestry",
    code: "BSF",
    department: "Forestry",
    coordinator: "Prof. Ama Serwaa",
    entryRequirements: "WASSCE with credits in English, Mathematics, and Science subjects",
    duration: "4 years",
    description: "Study of forest ecosystems, conservation, sustainable timber harvesting, and forest resource management.",
    status: "Active",
    coursesPerLevel: {
      "100": {
        "1": [],
        "2": []
      },
      "200": {
        "1": [],
        "2": []
      },
      "300": {
        "1": [],
        "2": []
      },
      "400": {
        "1": [],
        "2": []
      }
    }
  },
  {
    name: "B.Sc. Environmental Science and Management",
    code: "BESM",
    department: "Environmental Science",
    coordinator: "Dr. Samuel Adjei",
    entryRequirements: "WASSCE with credits in English, Mathematics, and Science subjects",
    duration: "4 years",
    description: "Study of environmental systems, climate change, pollution control, and sustainable natural resource management.",
    status: "Active",
    coursesPerLevel: {
      "100": {
        "1": [],
        "2": []
      },
      "200": {
        "1": [],
        "2": []
      },
      "300": {
        "1": [],
        "2": []
      },
      "400": {
        "1": [],
        "2": []
      }
    }
  }
];

/**
 * Initialize the programs in the database if they don't exist
 * This ensures that all college programs are available in the database
 */
export async function initializePrograms(): Promise<void> {
  try {
    const programsCollection = collection(db, 'programs');
    
    // Check if we already have programs
    const snapshot = await getDocs(programsCollection);
    const existingProgramCodes = snapshot.docs.map(doc => doc.data().code);
    
    // For each of our predefined programs
    for (const program of COLLEGE_PROGRAMS) {
      // If this program code doesn't exist yet, add it
      if (!existingProgramCodes.includes(program.code)) {
        const newProgramRef = doc(programsCollection);
        const timestamp = new Date().toISOString();
        
        await setDoc(newProgramRef, {
          ...program,
          id: newProgramRef.id,
          createdAt: timestamp,
          updatedAt: timestamp
        });
        
        console.log(`Program added to database: ${program.name} (${program.code})`);
      } else {
        console.log(`Program already exists: ${program.code}`);
      }
    }
    
    console.log('Program initialization complete.');
  } catch (error) {
    console.error('Error initializing programs:', error);
    throw error;
  }
}

/**
 * Get all programs from the database
 */
export async function getAllPrograms(): Promise<Program[]> {
  try {
    const programsCollection = collection(db, 'programs');
    const q = query(programsCollection, orderBy('name'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Program);
  } catch (error) {
    console.error('Error getting programs:', error);
    throw error;
  }
}

/**
 * Get a program by its code
 */
export async function getProgramByCode(code: string): Promise<Program | null> {
  try {
    const programsCollection = collection(db, 'programs');
    const q = query(programsCollection, where('code', '==', code));
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    
    return snapshot.docs[0].data() as Program;
  } catch (error) {
    console.error('Error getting program by code:', error);
    throw error;
  }
}

/**
 * Get a program by its ID
 */
export async function getProgramById(id: string): Promise<Program | null> {
  try {
    const programRef = doc(db, 'programs', id);
    const snapshot = await getDoc(programRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return snapshot.data() as Program;
  } catch (error) {
    console.error('Error getting program by ID:', error);
    throw error;
  }
}

/**
 * Get the names of all active programs
 * This is useful for dropdowns and selects
 */
export async function getProgramNames(): Promise<{id: string, name: string, code: string}[]> {
  try {
    const programsCollection = collection(db, 'programs');
    const q = query(programsCollection, where('status', '==', 'Active'), orderBy('name'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        code: data.code
      };
    });
  } catch (error) {
    console.error('Error getting program names:', error);
    throw error;
  }
} 