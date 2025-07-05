'use client';

import { db, auth } from './firebase';
import { 
  collection, doc, getDoc, getDocs, query, where, orderBy, 
  addDoc, updateDoc, deleteDoc, serverTimestamp, setDoc,
  limit, startAfter, QueryConstraint
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, updateProfile, sendPasswordResetEmail 
} from 'firebase/auth';

// Basic types that replace MongoDB models
export interface Program {
  id?: string;
  name: string;
  code: string;
  faculty: string;
  department: string;
  type: 'degree' | 'diploma' | 'certificate' | 'master' | 'phd';
  description?: string;
  durationYears: number;
  credits: number;
  entryRequirements?: string;
  status: 'active' | 'inactive' | 'pending' | 'discontinued';
  createdAt?: any;
  updatedAt?: any;
}

export interface Course {
  id?: string;
  code: string;
  title: string;
  description?: string;
  credits: number;
  level: number;
  semester?: number;
  department: string;
  prerequisites?: string[];
  programId?: string;
  status: 'active' | 'inactive';
  createdAt?: any;
  updatedAt?: any;
}

export interface AcademicYear {
  id?: string;
  year: string;
  startDate: Date | string;
  endDate: Date | string;
  status: 'active' | 'completed' | 'upcoming';
  createdAt?: any;
}

export interface Semester {
  id?: string;
  academicYear: string;
  name: string;
  number: string;
  startDate: Date | string;
  endDate: Date | string;
  status: 'active' | 'pending' | 'completed';
  createdAt?: any;
}

export interface Staff {
  id?: string;
  staffId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  assignedCourses: string[];
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
  createdAt?: any;
  lastLogin?: any;
}

// Firebase collections
const COLLECTIONS = {
  PROGRAMS: 'academic-programs',
  COURSES: 'academic-courses',
  ACADEMIC_YEARS: 'academic-years',
  SEMESTERS: 'academic-semesters',
  STAFF: 'academic-staff',
};

// Helper to convert Firestore document to typed object
const convertDoc = <T>(doc: any): T => {
  return {
    id: doc.id,
    ...doc.data()
  } as T;
};

// Helper to prepare data for Firestore (removes id, adds timestamps)
const prepareForFirestore = (data: any): any => {
  const { id, ...rest } = data;
  return {
    ...rest,
    updatedAt: serverTimestamp()
  };
};

// Programs Service
export const ProgramsService = {
  async getAll(): Promise<Program[]> {
    try {
      const programsRef = collection(db, COLLECTIONS.PROGRAMS);
      const q = query(programsRef, orderBy('name'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => convertDoc<Program>(doc));
    } catch (error) {
      console.error('Error getting programs:', error);
      throw error;
    }
  },
  
  async getByDepartment(department: string): Promise<Program[]> {
    try {
      const programsRef = collection(db, COLLECTIONS.PROGRAMS);
      const q = query(
        programsRef, 
        where('department', '==', department),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => convertDoc<Program>(doc));
    } catch (error) {
      console.error('Error getting programs by department:', error);
      throw error;
    }
  },
  
  async getById(id: string): Promise<Program | null> {
    try {
      const docRef = doc(db, COLLECTIONS.PROGRAMS, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return convertDoc<Program>(docSnap);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting program by ID:', error);
      throw error;
    }
  },
  
  async create(programData: Program): Promise<string> {
    try {
      const data = {
        ...programData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.PROGRAMS), data);
      return docRef.id;
    } catch (error) {
      console.error('Error creating program:', error);
      throw error;
    }
  },
  
  async update(id: string, programData: Partial<Program>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.PROGRAMS, id);
      const data = prepareForFirestore(programData);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating program:', error);
      throw error;
    }
  },
  
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.PROGRAMS, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting program:', error);
      throw error;
    }
  }
};

// Courses Service
export const CoursesService = {
  async getAll(): Promise<Course[]> {
    try {
      const coursesRef = collection(db, COLLECTIONS.COURSES);
      const q = query(coursesRef, orderBy('code'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => convertDoc<Course>(doc));
    } catch (error) {
      console.error('Error getting courses:', error);
      throw error;
    }
  },
  
  async getByProgram(programId: string): Promise<Course[]> {
    try {
      const coursesRef = collection(db, COLLECTIONS.COURSES);
      const q = query(
        coursesRef, 
        where('programId', '==', programId),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => convertDoc<Course>(doc));
    } catch (error) {
      console.error('Error getting courses by program:', error);
      throw error;
    }
  },
  
  async getById(id: string): Promise<Course | null> {
    try {
      const docRef = doc(db, COLLECTIONS.COURSES, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return convertDoc<Course>(docSnap);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting course by ID:', error);
      throw error;
    }
  },
  
  async create(courseData: Course): Promise<string> {
    try {
      const data = {
        ...courseData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.COURSES), data);
      return docRef.id;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },
  
  async update(id: string, courseData: Partial<Course>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.COURSES, id);
      const data = prepareForFirestore(courseData);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },
  
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.COURSES, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }
};

// Academic Years Service
export const AcademicYearsService = {
  async getAll(): Promise<AcademicYear[]> {
    try {
      const yearsRef = collection(db, COLLECTIONS.ACADEMIC_YEARS);
      const q = query(yearsRef, orderBy('year', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => convertDoc<AcademicYear>(doc));
    } catch (error) {
      console.error('Error getting academic years:', error);
      throw error;
    }
  },
  
  async getCurrent(): Promise<AcademicYear | null> {
    try {
      const yearsRef = collection(db, COLLECTIONS.ACADEMIC_YEARS);
      const q = query(
        yearsRef,
        where('status', '==', 'active'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      return convertDoc<AcademicYear>(snapshot.docs[0]);
    } catch (error) {
      console.error('Error getting current academic year:', error);
      throw error;
    }
  },
  
  async create(yearData: AcademicYear): Promise<string> {
    try {
      const data = {
        ...yearData,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.ACADEMIC_YEARS), data);
      return docRef.id;
    } catch (error) {
      console.error('Error creating academic year:', error);
      throw error;
    }
  },
  
  async update(id: string, yearData: Partial<AcademicYear>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ACADEMIC_YEARS, id);
      await updateDoc(docRef, yearData);
    } catch (error) {
      console.error('Error updating academic year:', error);
      throw error;
    }
  }
};

// Semesters Service
export const SemestersService = {
  async getByYear(yearId: string): Promise<Semester[]> {
    try {
      const semestersRef = collection(db, COLLECTIONS.SEMESTERS);
      const q = query(
        semestersRef,
        where('academicYear', '==', yearId),
        orderBy('number')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => convertDoc<Semester>(doc));
    } catch (error) {
      console.error('Error getting semesters by year:', error);
      throw error;
    }
  },
  
  async getCurrent(): Promise<Semester | null> {
    try {
      const semestersRef = collection(db, COLLECTIONS.SEMESTERS);
      const q = query(
        semestersRef,
        where('status', '==', 'active'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      return convertDoc<Semester>(snapshot.docs[0]);
    } catch (error) {
      console.error('Error getting current semester:', error);
      throw error;
    }
  },
  
  async create(semesterData: Semester): Promise<string> {
    try {
      const data = {
        ...semesterData,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.SEMESTERS), data);
      return docRef.id;
    } catch (error) {
      console.error('Error creating semester:', error);
      throw error;
    }
  },
  
  async update(id: string, semesterData: Partial<Semester>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.SEMESTERS, id);
      await updateDoc(docRef, semesterData);
    } catch (error) {
      console.error('Error updating semester:', error);
      throw error;
    }
  }
};

// Staff Service
export const StaffService = {
  async getAll(): Promise<Staff[]> {
    try {
      const staffRef = collection(db, COLLECTIONS.STAFF);
      const q = query(staffRef, orderBy('name'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => convertDoc<Staff>(doc));
    } catch (error) {
      console.error('Error getting staff members:', error);
      throw error;
    }
  },
  
  async getById(id: string): Promise<Staff | null> {
    try {
      const docRef = doc(db, COLLECTIONS.STAFF, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return convertDoc<Staff>(docSnap);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting staff by ID:', error);
      throw error;
    }
  },
  
  async getByEmail(email: string): Promise<Staff | null> {
    try {
      const staffRef = collection(db, COLLECTIONS.STAFF);
      const q = query(staffRef, where('email', '==', email.toLowerCase()), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      return convertDoc<Staff>(snapshot.docs[0]);
    } catch (error) {
      console.error('Error getting staff by email:', error);
      throw error;
    }
  },
  
  async create(staffData: Staff): Promise<string> {
    try {
      const data = {
        ...staffData,
        email: staffData.email.toLowerCase(),
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.STAFF), data);
      return docRef.id;
    } catch (error) {
      console.error('Error creating staff:', error);
      throw error;
    }
  },
  
  async update(id: string, staffData: Partial<Staff>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.STAFF, id);
      const data = prepareForFirestore(staffData);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating staff:', error);
      throw error;
    }
  },
  
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.STAFF, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting staff:', error);
      throw error;
    }
  }
};

// Auth Service - Staff Authentication
export const StaffAuthService = {
  async register(email: string, password: string, name: string): Promise<string> {
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with name
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      return userCredential.user.uid;
    } catch (error) {
      console.error('Error registering staff:', error);
      throw error;
    }
  },
  
  async login(email: string, password: string): Promise<string> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login time in staff record
      const staffRef = collection(db, COLLECTIONS.STAFF);
      const q = query(staffRef, where('email', '==', email.toLowerCase()), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const staffDoc = snapshot.docs[0];
        await updateDoc(doc(db, COLLECTIONS.STAFF, staffDoc.id), {
          lastLogin: serverTimestamp()
        });
      }
      
      return userCredential.user.uid;
    } catch (error) {
      console.error('Error logging in staff:', error);
      throw error;
    }
  },
  
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out staff:', error);
      throw error;
    }
  },
  
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },
  
  getCurrentUser() {
    return auth.currentUser;
  }
};

// Export all services
export default {
  ProgramsService,
  CoursesService,
  AcademicYearsService,
  SemestersService,
  StaffService,
  StaffAuthService
}; 