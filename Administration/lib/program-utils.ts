'use client';

import { db } from './firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

// Program types
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
}

/**
 * Get all programs from the database
 */
export async function getAllPrograms(): Promise<Program[]> {
  try {
    const programsCollection = collection(db, 'programs');
    const q = query(programsCollection, orderBy('name'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as Program));
  } catch (error) {
    console.error('Error getting programs:', error);
    return [];
  }
}

/**
 * Get all active programs
 */
export async function getActivePrograms(): Promise<Program[]> {
  try {
    const programsCollection = collection(db, 'programs');
    const q = query(
      programsCollection, 
      where('status', '==', 'Active'),
      orderBy('name')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as Program));
  } catch (error) {
    console.error('Error getting active programs:', error);
    return [];
  }
}

/**
 * Get program names and codes for select dropdowns
 */
export async function getProgramOptions(): Promise<{value: string, label: string}[]> {
  try {
    const programs = await getActivePrograms();
    return programs.map(program => ({
      value: program.id,
      label: `${program.name} (${program.code})`
    }));
  } catch (error) {
    console.error('Error getting program options:', error);
    return [];
  }
}

/**
 * Get program by code
 */
export async function getProgramByCode(code: string): Promise<Program | null> {
  try {
    const programsCollection = collection(db, 'programs');
    const q = query(programsCollection, where('code', '==', code));
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      ...doc.data(),
      id: doc.id
    } as Program;
  } catch (error) {
    console.error('Error getting program by code:', error);
    return null;
  }
}

/**
 * List of program names for the college
 * This is a fallback in case the database query fails
 */
export const COLLEGE_PROGRAM_NAMES = [
  "B.Sc. Sustainable Agriculture",
  "B.Sc. Sustainable Forestry",
  "B.Sc. Environmental Science and Management"
]; 