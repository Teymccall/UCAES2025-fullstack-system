import { createUserWithEmailAndPassword, updateProfile, fetchSignInMethodsForEmail, signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, query, where, doc, updateDoc, addDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

/**
 * Generate email from student ID for Firebase Auth
 */
export const generateEmailFromStudentId = (studentId: string): string => {
  // Make sure studentId is always uppercase for consistency
  const standardizedId = studentId.toUpperCase();
  // Convert student ID to email format: AG/2021/001234 -> ag.2021.001234@student.ucaes.edu.gh
  const cleanId = standardizedId.replace(/[/\-\s]/g, ".").toLowerCase();
  return `${cleanId}@student.ucaes.edu.gh`;
};

/**
 * Generate initial password from date of birth
 */
export const generatePasswordFromDOB = (dateOfBirth: string): string => {
  // Convert date to password format: 2000-01-15 -> 20000115
  return dateOfBirth.replace(/[-/\s]/g, "");
};

/**
 * Create a Firebase Auth account for a student
 */
export const createStudentAccount = async (studentId: string, indexNumber: string, dateOfBirth: string, displayName: string) => {
  try {
    // Validate inputs
    if (!studentId || !indexNumber || !dateOfBirth) {
      console.error("Missing required parameters:", { studentId, indexNumber, dateOfBirth });
      return {
        success: false,
        error: "Missing required parameters for account creation"
      };
    }

    // Generate email and initial password
    const email = generateEmailFromStudentId(indexNumber);
    const password = generatePasswordFromDOB(dateOfBirth);

    console.log(`Creating account for student: ${indexNumber}, email: ${email}`);

    // Check if the account already exists
    try {
      // Check if this email is already in use
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods && methods.length > 0) {
        console.log(`Account already exists for email ${email}. Using existing account.`);
        
        // Try to sign in to get the user
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          // Update the student record with the existing auth UID
          await updateDoc(doc(db, "students", studentId), {
            authUid: user.uid,
            updatedAt: new Date().toISOString()
          });
          
          return {
            success: true,
            message: `Linked existing account for student ${indexNumber}`,
            uid: user.uid
          };
        } catch (signInError) {
          console.error("Could not sign in to existing account:", signInError);
          return {
            success: false,
            error: "Account exists but could not be linked. Password may have been changed."
          };
        }
      }
    } catch (error) {
      // Ignore errors from fetchSignInMethodsForEmail, proceed to create the account
      console.log("Error checking existing account, proceeding with creation:", error);
    }

    // Create the user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, {
      displayName: displayName
    });

    console.log(`Updated profile for user: ${user.uid} with display name: ${displayName}`);

    // Update student record with auth UID
    await updateDoc(doc(db, "students", studentId), {
      authUid: user.uid,
      updatedAt: new Date().toISOString()
    });

    console.log(`Updated student record ${studentId} with authUid: ${user.uid}`);

    return {
      success: true,
      message: `Created account for student ${indexNumber}`,
      uid: user.uid
    };
  } catch (error: any) {
    console.error("Error creating student account:", error);
    
    // Handle specific Firebase errors
    if (error.code === "auth/email-already-in-use") {
      return {
        success: false,
        error: "An account with this email already exists"
      };
    } else if (error.code === "auth/invalid-email") {
      return {
        success: false,
        error: "Invalid email format generated from student ID"
      };
    } else if (error.code === "auth/weak-password") {
      return {
        success: false,
        error: "Date of birth creates a weak password. Please set a stronger password manually."
      };
    }
    
    return {
      success: false,
      error: error.message || "Unknown error creating account"
    };
  }
};

/**
 * Create Firebase Auth accounts for all students who don't have accounts yet
 */
export const createMissingStudentAccounts = async () => {
  try {
    console.log("Starting to create missing student accounts...");
    
    // Get all students where authUid is null or doesn't exist
    const studentsRef = collection(db, "students");
    
    // First try with where authUid == null
    let q = query(studentsRef, where("authUid", "==", null));
    let querySnapshot = await getDocs(q);
    
    console.log(`Found ${querySnapshot.size} students with authUid == null`);
    
    // If no results, try an alternative approach to find students without authUid field
    if (querySnapshot.size === 0) {
      // Get all students
      const allStudentsSnapshot = await getDocs(studentsRef);
      
      // Filter client-side for documents without authUid
      const studentsWithoutAuth = allStudentsSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.authUid === undefined || data.authUid === null;
      });
      
      console.log(`Found ${studentsWithoutAuth.length} students without authUid field using client-side filtering`);
      
      const results = {
        total: studentsWithoutAuth.length,
        created: 0,
        failed: 0,
        errors: [] as string[]
      };
      
      // Create accounts for each student
      for (const studentDoc of studentsWithoutAuth) {
        const student = studentDoc.data();
        
        // Skip if missing required fields
        if (!student.indexNumber || !student.dateOfBirth) {
          results.failed++;
          results.errors.push(`Student ${studentDoc.id} missing required fields (indexNumber or dateOfBirth)`);
          console.log(`Skipping student ${studentDoc.id}: missing required fields`);
          continue;
        }
        
        try {
          console.log(`Creating account for student: ${student.indexNumber}`);
          const displayName = `${student.surname || ""}, ${student.otherNames || ""}`.trim();
          const result = await createStudentAccount(
            studentDoc.id, 
            student.indexNumber, 
            student.dateOfBirth, 
            displayName
          );
          
          if (result.success) {
            results.created++;
            console.log(`Successfully created account for: ${student.indexNumber}`);
          } else {
            results.failed++;
            results.errors.push(`Failed to create account for ${student.indexNumber}: ${result.error}`);
            console.error(`Failed to create account for ${student.indexNumber}:`, result.error);
          }
        } catch (error: any) {
          results.failed++;
          results.errors.push(`Error processing ${student.indexNumber}: ${error.message}`);
          console.error(`Error processing ${student.indexNumber}:`, error);
        }
      }
      
      return results;
    }
    
    // If we have results from the original query, proceed as before
    const results = {
      total: querySnapshot.size,
      created: 0,
      failed: 0,
      errors: [] as string[]
    };
    
    // Create accounts for each student
    for (const studentDoc of querySnapshot.docs) {
      const student = studentDoc.data();
      
      // Skip if missing required fields
      if (!student.indexNumber || !student.dateOfBirth) {
        results.failed++;
        results.errors.push(`Student ${studentDoc.id} missing required fields (indexNumber or dateOfBirth)`);
        console.log(`Skipping student ${studentDoc.id}: missing required fields`);
        continue;
      }
      
      try {
        console.log(`Creating account for student: ${student.indexNumber}`);
        const displayName = `${student.surname || ""}, ${student.otherNames || ""}`.trim();
        const result = await createStudentAccount(
          studentDoc.id, 
          student.indexNumber, 
          student.dateOfBirth, 
          displayName
        );
        
        if (result.success) {
          results.created++;
          console.log(`Successfully created account for: ${student.indexNumber}`);
        } else {
          results.failed++;
          results.errors.push(`Failed to create account for ${student.indexNumber}: ${result.error}`);
          console.error(`Failed to create account for ${student.indexNumber}:`, result.error);
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Error processing ${student.indexNumber}: ${error.message}`);
        console.error(`Error processing ${student.indexNumber}:`, error);
      }
    }
    
    return results;
  } catch (error: any) {
    console.error("Error creating student accounts:", error);
    throw error;
  }
};

/**
 * Check if there are any students that can have accounts created,
 * and add a demo student if none are suitable
 */
export const ensureTestStudent = async () => {
  try {
    console.log("Checking if we have valid students for account creation...");
    // Get all students
    const studentsRef = collection(db, "students");
    const allStudents = await getDocs(studentsRef);
    
    console.log(`Found ${allStudents.size} total students`);
    
    // Check if we have any students without authUid
    let studentsWithoutAuth = allStudents.docs.filter(doc => {
      const data = doc.data();
      return (data.authUid === undefined || data.authUid === null) && 
             data.indexNumber && 
             data.dateOfBirth;
    });
    
    console.log(`Found ${studentsWithoutAuth.length} students without authUid that have required fields`);
    
    // If we don't have any suitable students, add a demo student
    if (studentsWithoutAuth.length === 0) {
      console.log("No suitable students found. Adding a demo student...");
      
      // Check if we have a student with index number 'DEMO/2023/001'
      const demoQuery = query(studentsRef, where("indexNumber", "==", "DEMO/2023/001"));
      const demoSnapshot = await getDocs(demoQuery);
      
      if (demoSnapshot.empty) {
        // Add a demo student
        const demoStudent = {
          indexNumber: "DEMO/2023/001",
          surname: "Demo",
          otherNames: "Student",
          gender: "Male",
          dateOfBirth: "2000-01-01", // January 1, 2000
          nationality: "Ghanaian",
          programme: "BSc Computer Science",
          level: "100",
          entryQualification: "WASSCE",
          status: "Active",
          email: "demo.student@example.com",
          phone: "0123456789",
          address: "123 University Way",
          emergencyContact: {
            name: "Emergency Contact",
            phone: "9876543210",
            relationship: "Parent"
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const docRef = await addDoc(collection(db, "students"), demoStudent);
        console.log(`Added demo student with ID: ${docRef.id}`);
        return true;
      } else {
        // If demo student exists but has authUid, remove it for testing
        const demoDoc = demoSnapshot.docs[0];
        const demoData = demoDoc.data();
        
        if (demoData.authUid) {
          await updateDoc(doc(db, "students", demoDoc.id), {
            authUid: null,
            updatedAt: new Date().toISOString()
          });
          console.log(`Reset authUid for demo student: ${demoDoc.id}`);
        } else {
          console.log(`Demo student exists without authUid: ${demoDoc.id}`);
        }
        return true;
      }
    }
    
    return studentsWithoutAuth.length > 0;
  } catch (error) {
    console.error("Error ensuring test student:", error);
    return false;
  }
}; 