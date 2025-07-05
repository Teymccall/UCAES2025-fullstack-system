import { doc, updateDoc, getDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Student } from './types';

/**
 * Synchronize student information across all database collections
 * @param studentId The ID of the student in the primary students collection
 * @param data The updated student data
 */
export const syncStudentAcrossModules = async (studentId: string, data: Partial<Student>): Promise<{
  success: boolean;
  updatedCollections: string[];
  errors: string[];
}> => {
  try {
    const result = {
      success: true,
      updatedCollections: [] as string[],
      errors: [] as string[]
    };
    
    const batch = writeBatch(db);
    
    // 1. First, update the student in the primary students collection
    try {
      const studentRef = doc(db, "students", studentId);
      
      // Get the current data to merge with updates
      const currentData = (await getDoc(studentRef)).data() || {};
      
      // Prepare the update data
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      // Add to batch
      batch.update(studentRef, updateData);
      result.updatedCollections.push("students");
    } catch (error) {
      console.error("Error updating primary student record:", error);
      result.errors.push(`Error updating primary student record: ${(error as Error).message}`);
    }
    
    // 2. Update in student-registrations collection (if exists)
    try {
      // Find by index number
      const indexNumber = data.indexNumber || await getStudentIndexNumber(studentId);
      
      if (indexNumber) {
        const registrationsQuery = query(
          collection(db, "student-registrations"),
          where("indexNumber", "==", indexNumber)
        );
        
        const registrationsSnapshot = await getDocs(registrationsQuery);
        
        if (!registrationsSnapshot.empty) {
          const registrationDoc = registrationsSnapshot.docs[0];
          
          // Map the student data to registration schema
          const registrationUpdate = mapStudentToRegistration(data);
          
          batch.update(registrationDoc.ref, registrationUpdate);
          result.updatedCollections.push("student-registrations");
        }
      }
    } catch (error) {
      console.error("Error updating student registration:", error);
      result.errors.push(`Error updating student registration: ${(error as Error).message}`);
    }
    
    // 3. Update in admin-students collection (if exists)
    try {
      // Find by index number
      const indexNumber = data.indexNumber || await getStudentIndexNumber(studentId);
      
      if (indexNumber) {
        const adminQuery = query(
          collection(db, "admin-students"),
          where("indexNumber", "==", indexNumber)
        );
        
        const adminSnapshot = await getDocs(adminQuery);
        
        if (!adminSnapshot.empty) {
          const adminDoc = adminSnapshot.docs[0];
          
          // Map the student data to admin schema
          const adminUpdate = mapStudentToAdmin(data);
          
          batch.update(adminDoc.ref, adminUpdate);
          result.updatedCollections.push("admin-students");
        }
      }
    } catch (error) {
      console.error("Error updating admin student record:", error);
      result.errors.push(`Error updating admin student record: ${(error as Error).message}`);
    }
    
    // 4. Update in Academic Affairs module collection (if exists)
    try {
      // Find by index number
      const indexNumber = data.indexNumber || await getStudentIndexNumber(studentId);
      
      if (indexNumber) {
        const academicQuery = query(
          collection(db, "academic-students"),
          where("indexNumber", "==", indexNumber)
        );
        
        const academicSnapshot = await getDocs(academicQuery);
        
        if (!academicSnapshot.empty) {
          const academicDoc = academicSnapshot.docs[0];
          
          // Map the student data to academic affairs schema
          const academicUpdate = mapStudentToAcademic(data);
          
          batch.update(academicDoc.ref, academicUpdate);
          result.updatedCollections.push("academic-students");
        }
      }
    } catch (error) {
      console.error("Error updating academic student record:", error);
      result.errors.push(`Error updating academic student record: ${(error as Error).message}`);
    }
    
    // 5. Update in user profiles (for student portal) if exists
    try {
      // Find by email or index number
      const indexNumber = data.indexNumber || await getStudentIndexNumber(studentId);
      const email = data.email || 
        `${indexNumber?.toLowerCase().replace(/\//g, ".")}@student.ucaes.edu.gh` || 
        null;
      
      if (email) {
        const userQuery = query(
          collection(db, "user-profiles"),
          where("email", "==", email)
        );
        
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          
          // Map the student data to user profile schema
          const userUpdate = mapStudentToUserProfile(data);
          
          batch.update(userDoc.ref, userUpdate);
          result.updatedCollections.push("user-profiles");
        }
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      result.errors.push(`Error updating user profile: ${(error as Error).message}`);
    }
    
    // Commit all updates
    await batch.commit();
    
    // Set success based on whether we had any errors
    result.success = result.errors.length === 0;
    
    return result;
  } catch (error) {
    console.error("Error synchronizing student data:", error);
    return {
      success: false,
      updatedCollections: [],
      errors: [`Error synchronizing student data: ${(error as Error).message}`]
    };
  }
};

/**
 * Get a student's index number by ID
 */
const getStudentIndexNumber = async (studentId: string): Promise<string | null> => {
  try {
    const studentRef = doc(db, "students", studentId);
    const studentSnap = await getDoc(studentRef);
    
    if (studentSnap.exists()) {
      return studentSnap.data().indexNumber || null;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting student index number:", error);
    return null;
  }
};

/**
 * Map student data to registration schema
 */
const mapStudentToRegistration = (data: Partial<Student>): Record<string, any> => {
  const mapped: Record<string, any> = {
    updatedAt: new Date().toISOString()
  };
  
  // Basic fields
  if (data.indexNumber) mapped.indexNumber = data.indexNumber;
  if (data.studentIndexNumber) mapped.studentIndexNumber = data.studentIndexNumber || data.indexNumber;
  if (data.surname) mapped.surname = data.surname;
  if (data.otherNames) mapped.otherNames = data.otherNames;
  if (data.gender) mapped.gender = data.gender;
  if (data.dateOfBirth) mapped.dateOfBirth = data.dateOfBirth;
  if (data.programme) mapped.programme = data.programme;
  if (data.level) mapped.currentLevel = data.level;
  if (data.email) mapped.email = data.email;
  if (data.phone) mapped.mobile = data.phone;
  if (data.status) mapped.status = data.status;
  
  // Profile picture
  if (data.profilePictureUrl) mapped.profilePictureUrl = data.profilePictureUrl;
  
  // Address fields
  if (typeof data.address === 'object' && data.address) {
    if (data.address.street) mapped.street = data.address.street;
    if (data.address.city) mapped.city = data.address.city;
    if (data.address.country) mapped.country = data.address.country;
  } else if (typeof data.address === 'string' && data.address) {
    mapped.address = data.address;
  }
  
  // Emergency contact fields
  if (data.emergencyContact) {
    mapped.emergencyContact = {
      name: data.emergencyContact.name || '',
      phone: data.emergencyContact.phone || '',
      relationship: data.emergencyContact.relationship || ''
    };
    
    // Also map to guardian fields for backward compatibility
    if (data.emergencyContact.name) mapped.guardianName = data.emergencyContact.name;
    if (data.emergencyContact.phone) mapped.guardianContact = data.emergencyContact.phone;
    if (data.emergencyContact.relationship) mapped.relationship = data.emergencyContact.relationship;
  }
  
  // Additional fields
  if (data.religion) mapped.religion = data.religion;
  if (data.maritalStatus) mapped.maritalStatus = data.maritalStatus;
  if (data.nationalId) mapped.idNumber = data.nationalId;
  if (data.yearOfEntry) mapped.yearOfEntry = data.yearOfEntry;
  if (data.entryLevel) mapped.entryLevel = data.entryLevel;
  
  return mapped;
};

/**
 * Map student data to admin schema
 */
const mapStudentToAdmin = (data: Partial<Student>): Record<string, any> => {
  const mapped: Record<string, any> = {
    updatedAt: new Date().toISOString()
  };
  
  // Basic fields
  if (data.indexNumber) mapped.indexNumber = data.indexNumber;
  if (data.surname || data.otherNames) {
    mapped.name = `${data.surname || ''}${data.otherNames ? ', ' + data.otherNames : ''}`;
  }
  if (data.email) mapped.email = data.email;
  if (data.phone) mapped.mobileNumber = data.phone;
  if (data.programme) mapped.programme = data.programme;
  if (data.level) mapped.level = data.level;
  if (data.status) mapped.status = data.status;
  
  // Profile picture
  if (data.profilePictureUrl) mapped.profilePictureUrl = data.profilePictureUrl;
  
  // Personal details
  const personalDetails: Record<string, any> = {};
  let hasPersonalDetails = false;
  
  if (data.gender) { personalDetails.gender = data.gender; hasPersonalDetails = true; }
  if (data.dateOfBirth) { personalDetails.dateOfBirth = data.dateOfBirth; hasPersonalDetails = true; }
  if (data.religion) { personalDetails.religion = data.religion; hasPersonalDetails = true; }
  if (data.maritalStatus) { personalDetails.maritalStatus = data.maritalStatus; hasPersonalDetails = true; }
  if (data.nationalId) { personalDetails.nationalId = data.nationalId; hasPersonalDetails = true; }
  if (data.nationality) { personalDetails.nationality = data.nationality; hasPersonalDetails = true; }
  
  if (hasPersonalDetails) mapped.personalDetails = personalDetails;
  
  // Contact details
  const contactDetails: Record<string, any> = {};
  let hasContactDetails = false;
  
  if (data.email) { contactDetails.email = data.email; hasContactDetails = true; }
  if (data.phone) { contactDetails.phone = data.phone; hasContactDetails = true; }
  if (data.address) { 
    contactDetails.address = data.address;
    hasContactDetails = true;
  }
  
  if (hasContactDetails) mapped.contactDetails = contactDetails;
  
  // Academic details
  const academicDetails: Record<string, any> = {};
  let hasAcademicDetails = false;
  
  if (data.level) { academicDetails.currentLevel = data.level; hasAcademicDetails = true; }
  if (data.entryLevel) { academicDetails.entryLevel = data.entryLevel; hasAcademicDetails = true; }
  if (data.yearOfEntry) { academicDetails.entryYear = data.yearOfEntry; hasAcademicDetails = true; }
  if (data.entryQualification) { academicDetails.entryQualification = data.entryQualification; hasAcademicDetails = true; }
  
  if (hasAcademicDetails) mapped.academicDetails = academicDetails;
  
  // Guardian details
  const guardianDetails: Record<string, any> = {};
  let hasGuardianDetails = false;
  
  if (data.emergencyContact) {
    if (data.emergencyContact.name) { guardianDetails.name = data.emergencyContact.name; hasGuardianDetails = true; }
    if (data.emergencyContact.phone) { guardianDetails.contact = data.emergencyContact.phone; hasGuardianDetails = true; }
    if (data.emergencyContact.relationship) { guardianDetails.relationship = data.emergencyContact.relationship; hasGuardianDetails = true; }
  }
  
  if (data.guardianEmail) { guardianDetails.email = data.guardianEmail; hasGuardianDetails = true; }
  if (data.guardianAddress) { guardianDetails.address = data.guardianAddress; hasGuardianDetails = true; }
  
  if (hasGuardianDetails) mapped.guardianDetails = guardianDetails;
  
  return mapped;
};

/**
 * Map student data to academic affairs schema
 */
const mapStudentToAcademic = (data: Partial<Student>): Record<string, any> => {
  const mapped: Record<string, any> = {
    updatedAt: new Date().toISOString()
  };
  
  // Basic fields
  if (data.indexNumber) mapped.studentId = data.indexNumber;
  if (data.surname || data.otherNames) {
    mapped.name = `${data.surname || ''}${data.otherNames ? ' ' + data.otherNames : ''}`;
  }
  if (data.programme) mapped.program = data.programme;
  if (data.level) mapped.level = data.level;
  if (data.email) mapped.email = data.email;
  if (data.status) mapped.status = data.status === 'Active' ? 'active' : data.status.toLowerCase();
  
  return mapped;
};

/**
 * Map student data to user profile schema
 */
const mapStudentToUserProfile = (data: Partial<Student>): Record<string, any> => {
  const mapped: Record<string, any> = {
    updatedAt: new Date().toISOString()
  };
  
  // Basic fields
  if (data.indexNumber) mapped.studentId = data.indexNumber;
  if (data.surname || data.otherNames) {
    mapped.displayName = `${data.surname || ''}${data.otherNames ? ' ' + data.otherNames : ''}`;
  }
  if (data.profilePictureUrl) mapped.photoURL = data.profilePictureUrl;
  if (data.programme) mapped.program = data.programme;
  if (data.level) mapped.level = data.level;
  
  // Student info
  const studentInfo: Record<string, any> = {};
  let hasStudentInfo = false;
  
  if (data.gender) { studentInfo.gender = data.gender; hasStudentInfo = true; }
  if (data.dateOfBirth) { studentInfo.dateOfBirth = data.dateOfBirth; hasStudentInfo = true; }
  if (data.nationality) { studentInfo.nationality = data.nationality; hasStudentInfo = true; }
  if (data.programme) { studentInfo.programme = data.programme; hasStudentInfo = true; }
  if (data.level) { studentInfo.level = data.level; hasStudentInfo = true; }
  if (data.phone) { studentInfo.phone = data.phone; hasStudentInfo = true; }
  
  if (hasStudentInfo) mapped.studentInfo = studentInfo;
  
  return mapped;
}; 