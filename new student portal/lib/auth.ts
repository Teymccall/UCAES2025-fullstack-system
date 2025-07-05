"use client"

import { useState, useEffect } from 'react'
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail,
  updateProfile,
  signInAnonymously
} from "firebase/auth"
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore"
import { auth, db } from "./firebase"

// Define the student type
export interface Student {
  id: string
  registrationNumber?: string
  studentIndexNumber?: string
  surname: string
  otherNames: string
  email: string
  dateOfBirth: string
  programme?: string
  currentLevel?: string
  status?: string
  profilePictureUrl?: string
  lastLogin?: Date
  // Added fields for full personal info
  gender?: string
  placeOfBirth?: string
  nationality?: string
  religion?: string
  maritalStatus?: string
  passportNumber?: string
  nationalId?: string
  ssnitNumber?: string
  numberOfChildren?: string | number
  physicalChallenge?: string
  guardianName?: string
  relationship?: string
  guardianContact?: string
  guardianEmail?: string
  guardianAddress?: string
  mobile?: string
  street?: string
  city?: string
  country?: string
  yearOfEntry?: string
  entryQualification?: string
  entryLevel?: string
  hallOfResidence?: string
  scheduleType?: string
  entryAcademicYear?: string
  currentPeriod?: string
}

// Define the login credentials type
export interface LoginCredentials {
  studentId: string;
  dateOfBirth: string;
}

// Function to set a cookie
const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === 'undefined') return;
  
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

// Function to delete a cookie
const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

// Function to normalize a date string to a standard format (DD-MM-YYYY)
const normalizeDateString = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Trim any whitespace and remove any non-essential characters
  const cleaned = dateStr.trim().replace(/\s+/g, '');
  
  // Common date formats: DD-MM-YYYY, MM-DD-YYYY, YYYY-MM-DD, DD/MM/YYYY, etc.
  
  // First check if it's already in DD-MM-YYYY format
  const ddmmyyyyRegex = /^(\d{2})[-./](\d{2})[-./](\d{4})$/;
  const ddmmyyyyMatch = cleaned.match(ddmmyyyyRegex);
  
  if (ddmmyyyyMatch) {
    // Already in DD-MM-YYYY format, just standardize separators
    return `${ddmmyyyyMatch[1]}-${ddmmyyyyMatch[2]}-${ddmmyyyyMatch[3]}`;
  }
  
  // Try to parse as a date if it's a different format
  try {
    // For other formats, try a more flexible approach
    if (cleaned.length === 8 && /^\d{8}$/.test(cleaned)) {
      // Handle format DDMMYYYY without separators
      return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 4)}-${cleaned.substring(4, 8)}`;
    }
    
    // Default fallback - just return the cleaned string
    return cleaned;
  } catch (e) {
    console.error('Error normalizing date:', e);
    // If all else fails, return the original cleaned string
    return cleaned;
  }
};

// Login function using Firebase Authentication
export const loginStudent = async (credentials: LoginCredentials): Promise<Student> => {
  const { studentId, dateOfBirth } = credentials;
  
  try {
    console.log('Starting login process with ID:', studentId);
    
    // First, find the student by ID in student-registrations collection
    const studentsRef = collection(db, 'student-registrations');
    const studentIdUpper = studentId.toUpperCase();
    
    let studentDoc = null;
    let studentData = null;
    
    // Try multiple approaches to find the student
    console.log('Trying to find student with ID:', studentIdUpper);
    
    // First check: Is this a registration number that starts with UCAES?
    if (studentIdUpper.startsWith('UCAES')) {
      console.log('Searching by registration number:', studentIdUpper);
      const regQuery = query(studentsRef, where('registrationNumber', '==', studentIdUpper), limit(1));
      const querySnapshot = await getDocs(regQuery);
      
      if (!querySnapshot.empty) {
        studentDoc = querySnapshot.docs[0];
        studentData = studentDoc.data();
        console.log('Found by registration number');
      }
    }
    
    // Second check: If not found, try as index number
    if (!studentDoc) {
      console.log('Searching by index number:', studentIdUpper);
      const indexQuery = query(studentsRef, where('studentIndexNumber', '==', studentIdUpper), limit(1));
      const querySnapshot = await getDocs(indexQuery);
      
      if (!querySnapshot.empty) {
        studentDoc = querySnapshot.docs[0];
        studentData = studentDoc.data();
        console.log('Found by index number');
      }
    }
    
    // If still not found, try other variations
    if (!studentDoc) {
      console.log('Trying case insensitive searches...');
      const indexQuery = query(studentsRef, where('studentIndexNumber', '==', studentId), limit(1));
      const querySnapshot = await getDocs(indexQuery);
      
      if (!querySnapshot.empty) {
        studentDoc = querySnapshot.docs[0];
        studentData = studentDoc.data();
        console.log('Found by case-sensitive index number');
      }
    }
    
    // Check if we found a student
    if (!studentDoc || !studentData) {
      console.log('Student not found with ID:', studentId);
      throw new Error(`Student not found with ID: ${studentId}. Please check your Student ID / Index Number and try again.`);
    }
    
    // Verify date of birth matches
    console.log('Verifying date of birth...');
    const normalizedInputDOB = normalizeDateString(dateOfBirth);
    const normalizedStoredDOB = normalizeDateString(studentData.dateOfBirth || '');
    
    console.log('Normalized input DOB:', normalizedInputDOB);
    console.log('Normalized stored DOB:', normalizedStoredDOB);
    
    if (normalizedInputDOB !== normalizedStoredDOB) {
      throw new Error('Date of birth does not match our records. Please ensure the format is DD-MM-YYYY.');
    }
    
    // If we get here, authentication is successful
    console.log('Authentication successful, creating session...');
    
    // Create session without using anonymous auth (this was causing the error)
    try {
      // Instead of anonymous auth, we'll just use localStorage for session management
      console.log('Using localStorage for session management');
    } catch (authError) {
      console.error('Error creating session:', authError);
      // Continue anyway - we can still create a session with local storage
    }
    
    // Create the student object to return
    const student: Student = {
      id: studentDoc.id,
      surname: studentData.surname,
      otherNames: studentData.otherNames,
      email: studentData.email,
      dateOfBirth: studentData.dateOfBirth,
      registrationNumber: studentData.registrationNumber,
      studentIndexNumber: studentData.studentIndexNumber,
      programme: studentData.programme,
      currentLevel: studentData.currentLevel,
      status: studentData.status,
      profilePictureUrl: studentData.profilePictureUrl,
      gender: studentData.gender,
      placeOfBirth: studentData.placeOfBirth,
      nationality: studentData.nationality,
      religion: studentData.religion,
      maritalStatus: studentData.maritalStatus,
      passportNumber: studentData.passportNumber,
      nationalId: studentData.nationalId,
      ssnitNumber: studentData.ssnitNumber,
      numberOfChildren: studentData.numberOfChildren,
      physicalChallenge: studentData.physicalChallenge,
      guardianName: studentData.guardianName,
      relationship: studentData.relationship,
      guardianContact: studentData.guardianContact,
      guardianEmail: studentData.guardianEmail,
      guardianAddress: studentData.guardianAddress,
      mobile: studentData.mobile,
      street: studentData.street,
      city: studentData.city,
      country: studentData.country,
      yearOfEntry: studentData.yearOfEntry,
      entryQualification: studentData.entryQualification,
      entryLevel: studentData.entryLevel,
      hallOfResidence: studentData.hallOfResidence,
      scheduleType: studentData.scheduleType,
      entryAcademicYear: studentData.entryAcademicYear,
      currentPeriod: studentData.currentPeriod
    };
    
    // Store session data in localStorage
    const sessionData = {
      isLoggedIn: true,
      studentId: studentDoc.id,
      sessionExpires: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
      studentData: student
    };
    
    localStorage.setItem('studentSession', JSON.stringify(sessionData));
    console.log('Session created and stored');
    
    return student;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Generate a temporary password from student's details
function generateTemporaryPassword(studentData: any): string {
  // Use first 4 letters of surname + YYYY of birth + last 4 of phone
  const surname = studentData.surname.slice(0, 4).toLowerCase()
  const birthYear = studentData.dateOfBirth.split('-')[2] || '2000'
  const phoneLast4 = (studentData.mobile || '0000').slice(-4)
  return `${surname}${birthYear}${phoneLast4}!`
}

// Get the current student from session storage
export const getCurrentStudent = (): Student | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const sessionData = localStorage.getItem('studentSession');
    if (!sessionData) return null;
    
    const parsedData = JSON.parse(sessionData);
    
    // Check if session is expired
    if (parsedData.sessionExpires < Date.now()) {
      // Session expired, clear it
      localStorage.removeItem('studentSession');
      return null;
    }
    
    return parsedData.studentData;
  } catch (error) {
    console.error('Error retrieving session:', error);
    return null;
  }
};

// Request password reset
export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error;
  }
};

// Logout student
export const logoutStudent = async (): Promise<void> => {
  try {
    // Sign out from Firebase Auth
    await signOut(auth);
    
    // Clear local session data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('studentSession');
    }
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};
