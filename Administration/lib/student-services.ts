import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, writeBatch, serverTimestamp, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "./firebase";
import type { Student, BulkUploadResult } from "./types";
import { setPersistence, browserLocalPersistence } from "firebase/auth";
import { createStudentAccount } from "./auth-utils";
import { syncStudentAcrossModules } from "./sync-service";

// Initialize authentication persistence to local for better offline support
try {
  setPersistence(auth, browserLocalPersistence);
} catch (error) {
  console.error("Error setting auth persistence:", error);
}

// Ensure authentication before performing Firestore operations
const ensureAuth = async () => {
  if (!auth.currentUser) {
    throw new Error("Authentication required to access data. Please login.");
  }
  return true;
};

/**
 * Get all students with optional filtering
 */
export const getAllStudents = async (filters?: {
  programme?: string;
  level?: string;
  status?: string;
}): Promise<Student[]> => {
  try {
    await ensureAuth();
    
    // Create an array to store all students
    let allStudents: Student[] = [];
    
    // Get students from the primary students collection
    try {
      console.log("Fetching students from 'students' collection...");
      const studentsQuery = collection(db, "students");
      const studentsSnapshot = await getDocs(studentsQuery);
      
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        source: "students"
      })) as Student[];
      
      console.log(`Found ${studentsData.length} students in 'students' collection`);
      console.log("Sample student data:", studentsData.length > 0 ? studentsData[0] : "No students found");
      allStudents = [...allStudents, ...studentsData];
    } catch (error) {
      console.error("Error fetching from 'students' collection:", error);
    }
    
    // Get students from the student-registrations collection
    try {
      console.log("Fetching students from 'student-registrations' collection...");
      const registrationsQuery = collection(db, "student-registrations");
      const registrationsSnapshot = await getDocs(registrationsQuery);
      
      // Map registration data to Student format
      const registrationData = registrationsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          indexNumber: data.studentIndexNumber || data.indexNumber || "",
          surname: data.surname || "",
          otherNames: data.otherNames || "",
          gender: data.gender || "",
          dateOfBirth: data.dateOfBirth || "",
          programme: data.programme || "",
          level: data.currentLevel || data.level || "",
          email: data.email || "",
          phone: data.mobile || data.mobileNumber || "",
          status: data.status || "Active",
          // For address, normalize the structure
          address: data.address || (data.street || data.city || data.country) 
            ? {
                street: data.street || "",
                city: data.city || "",
                country: data.country || ""
              }
            : "",
          // Create emergency contact if any of the fields exist
          emergencyContact: {
            name: data.emergencyContact?.name || data.guardianName || "",
            phone: data.emergencyContact?.phone || data.guardianContact || "",
            relationship: data.emergencyContact?.relationship || data.relationship || ""
          },
          // Additional fields from registration
          profilePictureUrl: data.profilePictureUrl || data.profileImage || null,
          religion: data.religion || "",
          maritalStatus: data.maritalStatus || "",
          nationalId: data.nationalId || data.idNumber || "",
          yearOfEntry: data.yearOfEntry || "",
          entryLevel: data.entryLevel || "",
          guardianName: data.guardianName || "",
          guardianContact: data.guardianContact || "",
          guardianEmail: data.guardianEmail || "",
          guardianAddress: data.guardianAddress || "",
          registrationDate: data.createdAt || data.registrationDate || "",
          lastUpdated: data.updatedAt || data.lastUpdated || "",
          source: "registrations"
        } as Student;
      });
      
      console.log(`Found ${registrationData.length} students in 'student-registrations' collection`);
      allStudents = [...allStudents, ...registrationData];
    } catch (error) {
      console.error("Error fetching from 'student-registrations' collection:", error);
    }
    
    // Get students from the admin-students collection
    try {
      console.log("Fetching students from 'admin-students' collection...");
      const adminQuery = collection(db, "admin-students");
      const adminSnapshot = await getDocs(adminQuery);
      
      // Map admin data to Student format
      const adminData = adminSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          indexNumber: data.indexNumber || "",
          surname: data.name ? data.name.split(',')[0]?.trim() : "",
          otherNames: data.name ? data.name.split(',')[1]?.trim() : "",
          gender: data.personalDetails?.gender || "",
          dateOfBirth: data.personalDetails?.dateOfBirth || "",
          programme: data.programme || "",
          level: data.level || data.academicDetails?.currentLevel || "",
          email: data.email || data.contactDetails?.email || "",
          phone: data.mobileNumber || data.contactDetails?.phone || "",
          status: data.status || "Active",
          // Normalize address from contactDetails
          address: data.contactDetails?.address 
            ? (typeof data.contactDetails.address === 'object'
                ? data.contactDetails.address
                : data.contactDetails.address)
            : "",
          // Normalize emergency contact
          emergencyContact: {
            name: data.guardianDetails?.name || "",
            phone: data.guardianDetails?.contact || "",
            relationship: data.guardianDetails?.relationship || ""
          },
          // Include all possible fields
          profilePictureUrl: data.profilePictureUrl || null,
          // Personal details
          religion: data.personalDetails?.religion || "",
          maritalStatus: data.personalDetails?.maritalStatus || "",
          nationalId: data.personalDetails?.nationalId || "",
          // Academic details
          yearOfEntry: data.academicDetails?.entryYear || "",
          entryLevel: data.academicDetails?.entryLevel || "",
          entryQualification: data.academicDetails?.entryQualification || "",
          // Guardian details (keep structure and also provide flattened access)
          guardianDetails: data.guardianDetails || null,
          guardianName: data.guardianDetails?.name || "",
          guardianContact: data.guardianDetails?.contact || "",
          guardianEmail: data.guardianDetails?.email || "",
          guardianAddress: data.guardianDetails?.address || "",
          // Include raw objects for completeness
          personalDetails: data.personalDetails || null,
          contactDetails: data.contactDetails || null,
          academicDetails: data.academicDetails || null,
          // Dates
          registrationDate: data.createdAt || "",
          lastUpdated: data.updatedAt || "",
          createdAt: data.createdAt || "",
          updatedAt: data.updatedAt || "",
          source: "admin"
        } as Student;
      });
      
      console.log(`Found ${adminData.length} students in 'admin-students' collection`);
      allStudents = [...allStudents, ...adminData];
    } catch (error) {
      console.error("Error fetching from 'admin-students' collection:", error);
    }
    
    // Remove duplicates by indexNumber
    const uniqueStudents: Student[] = [];
    const indexNumbers = new Set<string>();
    
    for (const student of allStudents) {
      if (student.indexNumber && !indexNumbers.has(student.indexNumber)) {
        indexNumbers.add(student.indexNumber);
        
        // Ensure all fields have proper values or defaults to prevent rendering errors
        const safeStudent: Student = {
          ...student,
          // Ensure all string fields have at least an empty string
          surname: student.surname || "",
          otherNames: student.otherNames || "",
          gender: student.gender || "",
          dateOfBirth: student.dateOfBirth || "",
          nationality: student.nationality || "",
          programme: student.programme || "",
          level: student.level || "",
          entryQualification: student.entryQualification || "",
          status: student.status || "Active",
          email: student.email || "",
          phone: student.phone || "",
          // Ensure address is either a string or a properly formed object
          address: student.address 
            ? (typeof student.address === 'object' 
                ? student.address 
                : student.address)
            : "",
          // Ensure emergencyContact is properly formed
          emergencyContact: {
            name: student.emergencyContact?.name || "",
            phone: student.emergencyContact?.phone || "",
            relationship: student.emergencyContact?.relationship || ""
          }
        };
        
        uniqueStudents.push(safeStudent);
      }
    }
    
    console.log(`Total unique students: ${uniqueStudents.length}`);
    
    // Apply client-side filtering if needed
    let filteredStudents = uniqueStudents;
    
    if (filters) {
      if (filters.programme) {
        filteredStudents = filteredStudents.filter(student => 
          student.programme === filters.programme
        );
      }
      
      if (filters.level) {
        filteredStudents = filteredStudents.filter(student => 
          student.level === filters.level
        );
      }
      
      if (filters.status) {
        filteredStudents = filteredStudents.filter(student => 
          student.status === filters.status
        );
      }
    }
    
    return filteredStudents;
  } catch (error) {
    console.error("Error getting students:", error);
    // Return empty array on error instead of throwing
    return [];
  }
};

/**
 * Get a student by ID
 */
export const getStudentById = async (studentId: string): Promise<Student | null> => {
  try {
    await ensureAuth();
    
    const docRef = doc(db, "students", studentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Student;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting student:", error);
    return null;
  }
};

/**
 * Get a student by index number
 */
export const getStudentByIndexNumber = async (indexNumber: string): Promise<Student | null> => {
  try {
    await ensureAuth();
    
    const q = query(
      collection(db, "students"),
      where("indexNumber", "==", indexNumber)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0];
      return {
        id: docData.id,
        ...docData.data()
      } as Student;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting student by index number:", error);
    return null; // Return null instead of throwing to handle network errors gracefully
  }
};

/**
 * Add a new student
 */
export const addStudent = async (student: Omit<Student, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    await ensureAuth();
    
    // Ensure studentData has all required fields
    const studentData = {
      ...student,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Check if the index number is already in use
    const existingStudent = await getStudentByIndexNumber(student.indexNumber);
    if (existingStudent) {
      throw new Error(`Student with index number ${student.indexNumber} already exists`);
    }
    
    // Add the student to Firestore
    const docRef = await addDoc(collection(db, "students"), studentData);
    
    // Automatically create a portal account for the student
    try {
      if (student.indexNumber && student.dateOfBirth) {
        console.log(`Creating portal account for new student: ${student.indexNumber}`);
        const displayName = `${student.surname}, ${student.otherNames}`;
        
        // Create the student account asynchronously
        // We're not awaiting this to avoid blocking the UI, but we still handle any errors
        createStudentAccount(docRef.id, student.indexNumber, student.dateOfBirth, displayName)
          .then(result => {
            if (result.success) {
              console.log(`Successfully created portal account for: ${student.indexNumber}`);
            } else {
              console.error(`Failed to create portal account for: ${student.indexNumber}`, result.error);
            }
          })
          .catch(error => {
            console.error(`Error creating portal account for: ${student.indexNumber}`, error);
          });
      } else {
        console.log(`Cannot create portal account for student: ${student.indexNumber} - missing required fields`);
      }
    } catch (accountError) {
      // Log the error but don't block the student creation
      console.error("Error creating student portal account:", accountError);
    }
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding student:", error);
    throw error;
  }
};

/**
 * Update a student
 */
export const updateStudent = async (studentId: string, data: Partial<Student>): Promise<void> => {
  try {
    await ensureAuth();
    
    // First update the student in the primary collection
    const studentRef = doc(db, "students", studentId);
    
    // Add updated timestamp
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // Update in the primary collection
    await updateDoc(studentRef, updateData);
    
    // Now synchronize the changes across all modules
    console.log("Synchronizing student updates across all modules...");
    const syncResult = await syncStudentAcrossModules(studentId, data);
    
    console.log("Sync result:", syncResult);
    
    if (!syncResult.success) {
      console.warn("Some errors occurred during synchronization:", syncResult.errors);
    } else {
      console.log("Successfully updated student across collections:", syncResult.updatedCollections);
    }
  } catch (error) {
    console.error("Error updating student:", error);
    throw error;
  }
};

/**
 * Delete a student
 */
export const deleteStudent = async (studentId: string): Promise<void> => {
  try {
    await ensureAuth();
    
    await deleteDoc(doc(db, "students", studentId));
  } catch (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
};

/**
 * Parse CSV string to array of objects
 */
const parseCSV = (csvText: string): Record<string, string>[] => {
  // Split the CSV text into lines
  const lines = csvText.split('\n');
  
  // Extract header (first line)
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Parse the remaining lines
  const result: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    // Split the line by comma, handling quoted values
    const values: string[] = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue.trim());
    
    // Create an object from the values
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j] || '';
    }
    
    result.push(obj);
  }
  
  return result;
};

/**
 * Convert array of objects to CSV string
 */
const objectsToCSV = (data: Record<string, any>[]): string => {
  if (data.length === 0) return '';
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create the header row
  let csv = headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(obj => {
    const row = headers.map(header => {
      const value = obj[header];
      
      // Handle values that contain commas, newlines, or quotes
      if (value === null || value === undefined) {
        return '';
      } else if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      } else {
        return String(value);
      }
    });
    
    csv += row.join(',') + '\n';
  });
  
  return csv;
};

/**
 * Upload student credentials via CSV
 */
export const uploadStudentCredentials = async (file: File): Promise<BulkUploadResult> => {
  return new Promise((resolve, reject) => {
    const result: BulkUploadResult = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };

    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const csvText = event.target?.result as string;
        const rows = parseCSV(csvText);
        result.totalProcessed = rows.length;
        
        const batch = writeBatch(db);

        for (let i = 0; i < rows.length; i++) {
          try {
            const row = rows[i];
            
            // Validate required fields
            if (!row.indexNumber || !row.surname || !row.otherNames || !row.gender || !row.programme) {
              throw new Error("Missing required fields");
            }
            
            // Check if student already exists
            const existingStudent = await getStudentByIndexNumber(row.indexNumber);
            
            // Format student data
            const studentData = {
              indexNumber: row.indexNumber,
              surname: row.surname,
              otherNames: row.otherNames,
              gender: row.gender as "Male" | "Female",
              dateOfBirth: row.dateOfBirth || "",
              nationality: row.nationality || "Ghanaian",
              programme: row.programme,
              level: row.level || "100",
              entryQualification: row.entryQualification || "WASSCE",
              status: row.status || "Active",
              email: row.email || `${row.indexNumber.toLowerCase().replace(/\//g, ".")}@student.ucaes.edu.gh`,
              phone: row.phone || "",
              address: row.address || "",
              emergencyContact: {
                name: row.emergencyContactName || "",
                phone: row.emergencyContactPhone || "",
                relationship: row.emergencyContactRelationship || ""
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            // Add or update student in batch
            if (existingStudent) {
              const studentRef = doc(db, "students", existingStudent.id);
              batch.update(studentRef, {
                ...studentData,
                updatedAt: new Date().toISOString()
              });
            } else {
              const newStudentRef = doc(collection(db, "students"));
              batch.set(newStudentRef, studentData);
            }
            
            result.successful++;
          } catch (error) {
            result.failed++;
            result.errors.push({
              row: i + 2, // +2 because we have headers (row 1) and 0-indexing
              error: (error as Error).message
            });
          }
        }
        
        // Commit the batch
        await batch.commit();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading the CSV file"));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Generate a CSV template for student uploads
 */
export const generateStudentCSVTemplate = (): string => {
  const headers = [
    "indexNumber",
    "surname",
    "otherNames",
    "gender",
    "dateOfBirth",
    "nationality",
    "programme",
    "level",
    "entryQualification",
    "status",
    "email",
    "phone",
    "address",
    "emergencyContactName",
    "emergencyContactPhone",
    "emergencyContactRelationship"
  ];
  
  const sampleRow = [
    "AG/2024/001234",
    "Doe",
    "John Michael",
    "Male",
    "2000-05-15",
    "Ghanaian",
    "BSc Agriculture",
    "100",
    "WASSCE",
    "Active",
    "john.doe@student.ucaes.edu.gh",
    "+233241234567",
    "P.O. Box 123, Accra",
    "Jane Doe",
    "+233241234568",
    "Mother"
  ];
  
  return headers.join(',') + '\n' + sampleRow.join(',');
};

/**
 * Download student data as CSV
 */
export const exportStudentsToCSV = async (students: Student[]): Promise<string> => {
  // Transform student data to flatten the structure
  const flattenedData = students.map(student => ({
    indexNumber: student.indexNumber,
    surname: student.surname,
    otherNames: student.otherNames,
    gender: student.gender,
    dateOfBirth: student.dateOfBirth,
    nationality: student.nationality,
    programme: student.programme,
    level: student.level,
    entryQualification: student.entryQualification,
    status: student.status,
    email: student.email,
    phone: student.phone,
    address: student.address,
    emergencyContactName: student.emergencyContact.name,
    emergencyContactPhone: student.emergencyContact.phone,
    emergencyContactRelationship: student.emergencyContact.relationship
  }));
  
  return objectsToCSV(flattenedData);
};

/**
 * Upload students from CSV and create portal accounts
 */
export const uploadStudentsFromCSV = async (file: File): Promise<BulkUploadResult> => {
  return new Promise((resolve, reject) => {
    const result: BulkUploadResult = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };
    
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const contents = e.target?.result as string;
        const students = parseCSV(contents);
        
        result.totalProcessed = students.length;
        
        // Process each student
        for (const studentData of students) {
          try {
            // Validate required fields
            if (!studentData.indexNumber || !studentData.surname || !studentData.otherNames) {
              throw new Error(`Missing required fields for student: ${studentData.indexNumber || 'unknown'}`);
            }
            
            // Check if student already exists
            const existing = await getStudentByIndexNumber(studentData.indexNumber);
            if (existing) {
              throw new Error(`Student with index number ${studentData.indexNumber} already exists`);
            }
            
            // Format student data with defaults
            const student = {
              indexNumber: studentData.indexNumber,
              surname: studentData.surname,
              otherNames: studentData.otherNames,
              gender: studentData.gender || 'Male',
              dateOfBirth: studentData.dateOfBirth || '',
              programme: studentData.programme || 'BSc Agriculture',
              level: studentData.level || '100',
              nationality: studentData.nationality || 'Ghanaian',
              email: studentData.email || '',
              phone: studentData.phone || '',
              status: 'Active',
              address: studentData.address || '',
              emergencyContact: {
                name: studentData.emergencyContactName || '',
                phone: studentData.emergencyContactPhone || '',
                relationship: studentData.emergencyContactRelationship || ''
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            // Add student to database
            const docRef = await addDoc(collection(db, "students"), student);
            result.successful++;
            
            // Automatically create portal account if date of birth is provided
            if (student.dateOfBirth) {
              try {
                const displayName = `${student.surname}, ${student.otherNames}`;
                
                // Create account asynchronously
                createStudentAccount(docRef.id, student.indexNumber, student.dateOfBirth, displayName)
                  .then(accountResult => {
                    if (accountResult.success) {
                      console.log(`Created portal account for imported student: ${student.indexNumber}`);
                    } else {
                      console.error(`Failed to create portal account for: ${student.indexNumber}`, accountResult.error);
                    }
                  })
                  .catch(error => {
                    console.error(`Error creating portal account for: ${student.indexNumber}`, error);
                  });
              } catch (accountError) {
                console.error(`Error creating portal account for ${student.indexNumber}:`, accountError);
              }
            } else {
              console.log(`Cannot create portal account for ${student.indexNumber}: missing date of birth`);
            }
          } catch (error) {
            result.failed++;
            result.errors.push(`Row ${result.totalProcessed}: ${(error as Error).message}`);
          }
        }
        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Synchronize registration data with admin system
 * This function will find all student registrations and create/update corresponding records in the admin-students collection
 */
export const syncRegistrationsWithAdmin = async (): Promise<{
  success: boolean;
  total: number;
  created: number;
  updated: number;
  errors: string[];
}> => {
  try {
    await ensureAuth();
    
    const result = {
      success: true,
      total: 0,
      created: 0,
      updated: 0,
      errors: [] as string[]
    };
    
    // Get all registrations
    const registrationsQuery = collection(db, "student-registrations");
    const registrationsSnapshot = await getDocs(registrationsQuery);
    
    result.total = registrationsSnapshot.size;
    console.log(`Found ${result.total} student registrations to process`);
    
    // Process each registration
    const batch = writeBatch(db);
    let batchCount = 0;
    const MAX_BATCH_SIZE = 500; // Firestore batch size limit
    
    for (const regDoc of registrationsSnapshot.docs) {
      try {
        const registration = regDoc.data();
        
        // Skip if missing key data
        if (!registration.studentIndexNumber && !registration.indexNumber) {
          result.errors.push(`Registration ${regDoc.id} missing index number`);
          continue;
        }
        
        const indexNumber = registration.studentIndexNumber || registration.indexNumber;
        
        // Check if this student already exists in admin collection
        const adminQuery = query(
          collection(db, "admin-students"),
          where("indexNumber", "==", indexNumber)
        );
        const existingAdminDocs = await getDocs(adminQuery);
        
        // Prepare admin student data from registration
        const adminStudentData = {
          indexNumber: indexNumber,
          name: `${registration.surname}, ${registration.otherNames}`,
          programme: registration.programme || "",
          level: registration.currentLevel || registration.level || "",
          status: "Active",
          email: registration.email || "",
          mobileNumber: registration.mobile || "",
          registrationId: regDoc.id,
          updatedAt: new Date().toISOString(),
          personalDetails: {
            gender: registration.gender || "",
            dateOfBirth: registration.dateOfBirth || "",
            nationality: registration.nationality || "",
            religion: registration.religion || "",
            maritalStatus: registration.maritalStatus || "",
            nationalId: registration.nationalId || "",
          },
          contactDetails: {
            email: registration.email || "",
            phone: registration.mobile || "",
            address: registration.street 
              ? {
                  street: registration.street || "",
                  city: registration.city || "",
                  country: registration.country || ""
                }
              : `${registration.street || ""}, ${registration.city || ""}, ${registration.country || ""}`,
          },
          guardianDetails: {
            name: registration.guardianName || "",
            relationship: registration.relationship || "",
            contact: registration.guardianContact || "",
            email: registration.guardianEmail || "",
            address: registration.guardianAddress || "",
          },
          academicDetails: {
            entryYear: registration.yearOfEntry || "",
            entryLevel: registration.entryLevel || "",
            currentLevel: registration.currentLevel || "",
            entryQualification: registration.entryQualification || "",
          },
          profilePictureUrl: registration.profilePictureUrl || null,
        };
        
        if (!existingAdminDocs.empty) {
          // Update existing record
          const adminDoc = existingAdminDocs.docs[0];
          batch.update(doc(db, "admin-students", adminDoc.id), adminStudentData);
          result.updated++;
        } else {
          // Create new record
          batch.set(doc(db, "admin-students", indexNumber), {
            ...adminStudentData,
            createdAt: new Date().toISOString(),
          });
          result.created++;
        }
        
        // Update registration record to mark it as synced
        batch.update(doc(db, "student-registrations", regDoc.id), {
          syncedToAdmin: true,
          syncedAt: new Date().toISOString(),
        });
        
        batchCount++;
        
        // Commit batch if we reach the limit
        if (batchCount >= MAX_BATCH_SIZE) {
          await batch.commit();
          console.log(`Committed batch of ${batchCount} operations`);
          batchCount = 0;
        }
      } catch (error) {
        console.error(`Error processing registration ${regDoc.id}:`, error);
        result.errors.push(`Error processing registration ${regDoc.id}: ${(error as Error).message}`);
      }
    }
    
    // Commit any remaining operations
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} operations`);
    }
    
    console.log(`Sync complete. Created: ${result.created}, Updated: ${result.updated}, Errors: ${result.errors.length}`);
    
    return result;
  } catch (error) {
    console.error("Error syncing registrations with admin:", error);
    return {
      success: false,
      total: 0,
      created: 0,
      updated: 0,
      errors: [(error as Error).message]
    };
  }
}; 