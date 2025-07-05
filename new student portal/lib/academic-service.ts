import { db } from './firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { Student } from './auth';

export interface AcademicLevel {
  level: string;
  levelNumber: number; // 100, 200, etc.
  creditsRequired: number;
  creditsEarned: number;
  gpa: number;
  status: 'completed' | 'in-progress' | 'upcoming';
  academicYear: string;
}

export interface AcademicRecord {
  studentId: string;
  registrationNumber: string;
  indexNumber: string;
  programme: string;
  programmeDuration: number; // In years
  currentLevel: string;
  currentLevelNumber: number;
  yearOfAdmission: string;
  expectedCompletionYear: string;
  entryQualification: string;
  entryLevel: string;
  currentCGPA: number;
  totalCreditsEarned: number;
  totalCreditsRequired: number;
  creditsRemaining: number;
  academicStanding: string;
  projectedClassification: string;
  probationStatus: string;
  graduationEligibility: string;
  levels: AcademicLevel[];
}

export async function getAcademicRecord(student: Student): Promise<AcademicRecord> {
  try {
    // Check if we have an academic record document for this student
    const academicRecordsRef = collection(db, 'academic-records');
    const q = query(academicRecordsRef, where('studentId', '==', student.id));
    const querySnapshot = await getDocs(q);
    
    // If we have an academic record document, use that data
    if (!querySnapshot.empty) {
      const academicDoc = querySnapshot.docs[0];
      const academicData = academicDoc.data();
      
      return {
        studentId: student.id,
        registrationNumber: student.registrationNumber || '',
        indexNumber: student.studentIndexNumber || '',
        programme: academicData.programme || student.programme || '',
        programmeDuration: academicData.programmeDuration || 4,
        currentLevel: academicData.currentLevel || student.currentLevel || '',
        currentLevelNumber: academicData.currentLevelNumber || 
          parseInt(student.currentLevel?.replace(/\D/g, '') || '0') || 100,
        yearOfAdmission: academicData.yearOfAdmission || student.yearOfEntry || '',
        expectedCompletionYear: academicData.expectedCompletionYear || 
          calculateExpectedCompletionYear(student.yearOfEntry, academicData.programmeDuration || 4),
        entryQualification: academicData.entryQualification || student.entryQualification || '',
        entryLevel: academicData.entryLevel || student.entryLevel || '',
        currentCGPA: academicData.currentCGPA || 0,
        totalCreditsEarned: academicData.totalCreditsEarned || 0,
        totalCreditsRequired: academicData.totalCreditsRequired || 144,
        creditsRemaining: academicData.creditsRemaining || 
          (academicData.totalCreditsRequired || 144) - (academicData.totalCreditsEarned || 0),
        academicStanding: academicData.academicStanding || 'Good Standing',
        projectedClassification: academicData.projectedClassification || 
          getProjectedClassification(academicData.currentCGPA || 0),
        probationStatus: academicData.probationStatus || 'None',
        graduationEligibility: academicData.graduationEligibility || 'On Track',
        levels: academicData.levels || generateDefaultLevels(
          parseInt(student.currentLevel?.replace(/\D/g, '') || '0') || 100,
          student.yearOfEntry || '',
          academicData.programmeDuration || 4
        )
      };
    } 
    // Otherwise, generate a record based on student information
    else {
      // Get the current level number (100, 200, etc)
      const currentLevelNumber = parseInt(student.currentLevel?.replace(/\D/g, '') || '0') || 100;
      const entryYear = student.yearOfEntry || '';
      const programmeDuration = 4; // Default to 4 years
      
      // Generate academic record based on student information
      return {
        studentId: student.id,
        registrationNumber: student.registrationNumber || '',
        indexNumber: student.studentIndexNumber || '',
        programme: student.programme || '',
        programmeDuration,
        currentLevel: student.currentLevel || `Level ${currentLevelNumber}`,
        currentLevelNumber,
        yearOfAdmission: entryYear,
        expectedCompletionYear: calculateExpectedCompletionYear(entryYear, programmeDuration),
        entryQualification: student.entryQualification || '',
        entryLevel: student.entryLevel || 'Level 100',
        currentCGPA: 0,
        totalCreditsEarned: 0,
        totalCreditsRequired: 144,
        creditsRemaining: 144,
        academicStanding: 'Good Standing',
        projectedClassification: 'Not Available',
        probationStatus: 'None',
        graduationEligibility: 'On Track',
        levels: generateDefaultLevels(currentLevelNumber, entryYear, programmeDuration)
      };
    }
  } catch (error) {
    console.error('Error fetching academic record:', error);
    throw new Error('Failed to fetch academic record');
  }
}

// Helper function to calculate expected completion year
function calculateExpectedCompletionYear(startYear: string | undefined, duration: number): string {
  if (!startYear) return '';
  
  const year = parseInt(startYear);
  if (isNaN(year)) return '';
  
  return (year + duration).toString();
}

// Helper function to get projected classification based on CGPA
function getProjectedClassification(cgpa: number): string {
  if (cgpa >= 3.6) return 'First Class';
  if (cgpa >= 3.0) return 'Second Class Upper';
  if (cgpa >= 2.5) return 'Second Class Lower';
  if (cgpa >= 2.0) return 'Third Class';
  if (cgpa >= 1.0) return 'Pass';
  return 'Not Available';
}

// Helper function to generate default level data
function generateDefaultLevels(currentLevel: number, startYear: string, duration: number): AcademicLevel[] {
  const levels: AcademicLevel[] = [];
  const creditsPerLevel = 36;
  
  // Parse start year, defaulting to current year - duration if invalid
  let year = parseInt(startYear);
  if (isNaN(year)) {
    year = new Date().getFullYear() - (currentLevel / 100);
  }
  
  for (let level = 100; level <= duration * 100; level += 100) {
    const levelYear = year + ((level / 100) - 1);
    const nextYear = levelYear + 1;
    const academicYear = `${levelYear}/${nextYear}`;
    
    let status: 'completed' | 'in-progress' | 'upcoming' = 'upcoming';
    let creditsEarned = 0;
    let gpa = 0;
    
    if (level < currentLevel) {
      status = 'completed';
      creditsEarned = creditsPerLevel;
      gpa = 3.0 + Math.random() * 1.0; // Random GPA between 3.0-4.0 for demo
    } else if (level === currentLevel) {
      status = 'in-progress';
      creditsEarned = creditsPerLevel;
    }
    
    levels.push({
      level: `Level ${level}`,
      levelNumber: level,
      creditsRequired: creditsPerLevel,
      creditsEarned,
      gpa: parseFloat(gpa.toFixed(2)),
      status,
      academicYear
    });
  }
  
  return levels;
} 