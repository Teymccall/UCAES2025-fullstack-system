import { getDb, FieldValue } from './firebase-admin';

// Interface for admission application data
export interface AdmissionApplication {
  id?: string;
  userId: string;
  applicationId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    region: string;
    passportPhoto?: { url: string; publicId: string };
  };
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    emergencyContact: string;
    emergencyPhone: string;
  };
  academicBackground: {
    schoolName: string;
    shsProgram?: string;
    waecIndexNumber?: string;
    qualificationType: string;
    yearCompleted: string;
    subjects: Array<{ subject: string; grade: string }>;
    certificates?: Array<{ name: string; url: string; publicId: string; uploadedAt: string }>;
  };
  programSelection: {
    programType?: string;
    program: string;
    level: string;
    studyLevel?: string;
    studyMode: string;
    firstChoice: string;
    secondChoice: string;
  };
  documents: {
    photo?: { url: string; publicId: string };
    idDocument?: { url: string; publicId: string };
    certificate?: { url: string; publicId: string };
    transcript?: { url: string; publicId: string };
  };
  paymentStatus: 'pending' | 'paid' | 'failed';
  applicationStatus: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

// Interface for student registration data
export interface StudentRegistrationData {
  // Personal Information
  surname: string;
  otherNames: string;
  gender: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  religion: string;
  maritalStatus: string;
  nationalId: string;
  ssnitNumber: string;
  physicalChallenge: string;
  studentIndexNumber: string;

  // Contact Details
  email: string;
  mobile: string;
  street: string;
  city: string;
  country: string;

  // Guardian Details
  guardianName: string;
  relationship: string;
  guardianContact: string;
  guardianEmail: string;
  guardianAddress: string;

  // Academic Information
  programme: string;
  yearOfEntry: string;
  entryQualification: string;
  entryLevel: string;
  hallOfResidence: string;
  scheduleType: string;
  currentLevel: string;
  entryAcademicYear: string;
  currentPeriod: string;

  // System fields
  registrationNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  registrationDate: any; // Firebase Timestamp
  profilePictureUrl?: string;
  profilePicturePublicId?: string;
}

/**
 * Generate sequential registration number using the same logic as new student information system
 */
async function generateRegistrationNumberForAdmission(): Promise<string> {
  try {
    console.log("🔢 Generating registration number for admitted student...");

    // Get academic year from centralized system (same logic as application ID generation)
    let academicYear = new Date().getFullYear().toString();
    
    try {
      // Try centralized system first
      const systemConfigRef = adminDb.collection('systemConfig').doc('academicPeriod');
      const systemConfigDoc = await systemConfigRef.get();
      
      if (systemConfigDoc.exists) {
        const systemData = systemConfigDoc.data();
        // Extract year from display name like "2025/2026" → "2025"
        const displayYear = systemData?.currentAcademicYear;
        if (displayYear) {
          const yearMatch = displayYear.match(/(\d{4})/);
          if (yearMatch) {
            academicYear = yearMatch[1];
            console.log(`✅ Using centralized academic year for registration: ${academicYear}`);
          }
        }
      } else {
        console.log("⚠️ Using current calendar year for registration number");
      }
    } catch (error) {
      console.error("❌ Error accessing centralized system, using calendar year:", error);
    }
    
    // Generate sequential number using same counter logic as new student information
    const yearKey = `UCAES${academicYear}`;
    const counterRef = adminDb.collection("registration-counters").doc(yearKey);
    
    try {
      // Try to get the existing counter
      const counterDoc = await counterRef.get();
      
      if (counterDoc.exists) {
        // Counter exists, increment it
        const currentCount = counterDoc.data()?.lastNumber || 0;
        const nextNumber = currentCount + 1;
        const paddedNumber = nextNumber.toString().padStart(4, "0");
        
        // Update the counter atomically
        await counterRef.update({
          lastNumber: nextNumber,
          lastUpdated: serverTimestamp()
        });
        
        const registrationNumber = `${yearKey}${paddedNumber}`;
        console.log("✅ Generated sequential registration number:", registrationNumber, `(incremented from ${currentCount})`);
        return registrationNumber;
        
      } else {
        // Counter doesn't exist, start from 1
        const firstNumber = 1;
        const paddedNumber = firstNumber.toString().padStart(4, "0");
        
        // Create the counter document
        await counterRef.set({
          lastNumber: firstNumber,
          year: parseInt(academicYear),
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
          description: "Registration number counter for UCAES student registrations"
        });
        
        const registrationNumber = `${yearKey}${paddedNumber}`;
        console.log("✅ Generated first registration number for year:", registrationNumber);
        return registrationNumber;
      }
      
    } catch (error) {
      console.error("❌ Error accessing registration counter:", error);
      
      // Fallback: use timestamp-based number
      const fallbackNumber = Math.floor(Date.now() % 10000)
        .toString()
        .padStart(4, "0");
      const registrationNumber = `${yearKey}${fallbackNumber}`;
      console.log("⚠️ Using fallback registration number:", registrationNumber);
      return registrationNumber;
    }
    
  } catch (error) {
    console.error("❌ Error in generateRegistrationNumberForAdmission:", error);
    
    // Ultimate fallback: random number
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const registrationNumber = `UCAES${year}${randomNum}`;
    console.log("🔄 Using random fallback registration number:", registrationNumber);
    return registrationNumber;
  }
}

/**
 * Get current academic year from centralized system
 */
async function getCurrentAcademicYear(): Promise<string> {
  try {
    // Try centralized system first
    const systemConfigRef = adminDb.collection('systemConfig').doc('academicPeriod');
    const systemConfigDoc = await systemConfigRef.get();
    
    if (systemConfigDoc.exists) {
      const systemData = systemConfigDoc.data();
      const academicYear = systemData?.currentAcademicYear;
      if (academicYear) {
        console.log(`✅ Using centralized academic year: ${academicYear}`);
        return academicYear;
      }
    }
    
    // Fallback to current calendar year format
    const currentYear = new Date().getFullYear();
    const fallbackYear = `${currentYear}/${currentYear + 1}`;
    console.log(`⚠️ Using fallback academic year: ${fallbackYear}`);
    return fallbackYear;
    
  } catch (error) {
    console.error("❌ Error getting current academic year:", error);
    const currentYear = new Date().getFullYear();
    const fallbackYear = `${currentYear}/${currentYear + 1}`;
    console.log(`🔄 Using emergency fallback academic year: ${fallbackYear}`);
    return fallbackYear;
  }
}

/**
 * Parse address string into street, city, country components
 */
function parseAddress(addressString: string): { street: string; city: string; country: string } {
  if (!addressString || addressString.trim() === '') {
    return {
      street: '',
      city: '',
      country: 'GHANA'
    };
  }

  // Simple address parsing - can be enhanced later
  const addressParts = addressString.split(',').map(part => part.trim());
  
  let street = '';
  let city = '';
  let country = 'GHANA'; // Default for UCAES

  if (addressParts.length >= 3) {
    street = addressParts[0];
    city = addressParts[1];
    country = addressParts[2].toUpperCase();
  } else if (addressParts.length === 2) {
    street = addressParts[0];
    city = addressParts[1];
  } else if (addressParts.length === 1) {
    street = addressParts[0];
    city = '';
  }

  return {
    street: street.toUpperCase(),
    city: city.toUpperCase(),
    country: country.toUpperCase()
  };
}

/**
 * Map admission application data to student registration format
 */
async function mapAdmissionToStudentRegistration(admission: AdmissionApplication): Promise<StudentRegistrationData> {
  console.log("🔄 Mapping admission application to student registration...");
  
  // Use the existing Application ID as Registration Number (Index Number)
  // This ensures consistency: students use the same ID for login that they got during admission
  const registrationNumber = admission.applicationId;
  console.log(`✅ Using Application ID as Registration Number: ${registrationNumber}`);
  
  // Get current academic year
  const entryAcademicYear = await getCurrentAcademicYear();
  
  // Parse address
  const addressInfo = parseAddress(admission.contactInfo.address);
  
  // Get profile picture info (priority: passport photo, then documents photo)
  const profilePictureUrl = admission.personalInfo.passportPhoto?.url || admission.documents.photo?.url || '';
  const profilePicturePublicId = admission.personalInfo.passportPhoto?.publicId || admission.documents.photo?.publicId || '';
  
  console.log('📸 Photo mapping debug:');
  console.log('   - Passport photo URL:', admission.personalInfo.passportPhoto?.url || 'None');
  console.log('   - Documents photo URL:', admission.documents.photo?.url || 'None');
  console.log('   - Final profilePictureUrl:', profilePictureUrl || 'None');
  
  // Validate profile picture URL if present
  if (profilePictureUrl) {
    const isValidUrl = profilePictureUrl.startsWith('http') && profilePictureUrl.includes('cloudinary.com');
    console.log('   - Profile picture URL validation:', isValidUrl ? '✅ Valid' : '❌ Invalid');
    
    if (!isValidUrl) {
      console.warn('⚠️  Profile picture URL appears invalid:', profilePictureUrl);
    }
  } else {
    console.log('⚠️  No profile picture found - student will have default avatar');
  }

  const studentData: StudentRegistrationData = {
    // Personal Information (direct mappings)
    surname: admission.personalInfo.lastName.toUpperCase(),
    otherNames: admission.personalInfo.firstName.toUpperCase(),
    gender: admission.personalInfo.gender.toLowerCase(),
    dateOfBirth: admission.personalInfo.dateOfBirth, // Already in DD-MM-YYYY format
    nationality: admission.personalInfo.nationality.toUpperCase(),
    
    // Contact Details (direct mappings)
    email: admission.contactInfo.email.toLowerCase(),
    mobile: admission.contactInfo.phone,
    
    // Parsed address
    street: addressInfo.street,
    city: addressInfo.city,
    country: addressInfo.country,
    
    // Guardian Details (mapped from emergency contact)
    guardianName: admission.contactInfo.emergencyContact.toUpperCase(),
    guardianContact: admission.contactInfo.emergencyPhone,
    relationship: 'emergency_contact', // Default assumption
    
    // Academic Information (direct mappings)
    programme: admission.programSelection?.firstChoice || admission.programSelection?.program || admission.academicInfo?.intendedCourse || '',
    entryLevel: admission.programSelection?.level || "undergraduate",
    currentLevel: admission.programSelection?.studyLevel || admission.programSelection?.level || "100",
    scheduleType: admission.programSelection?.studyMode || "Regular",
    entryQualification: admission.academicBackground.qualificationType.toUpperCase(),
    yearOfEntry: admission.academicBackground.yearCompleted,
    
    // System generated fields
    registrationNumber: registrationNumber,
    entryAcademicYear: entryAcademicYear,
    status: 'approved', // Always approved for accepted students
    registrationDate: FieldValue.serverTimestamp(),
    currentPeriod: 'First Semester', // Default for new students
    
    // Profile picture
    profilePictureUrl: profilePictureUrl,
    profilePicturePublicId: profilePicturePublicId,
    
    // Default/computed fields
    placeOfBirth: admission.personalInfo.region?.toUpperCase() || 'GHANA',
    religion: 'NOT_SPECIFIED', // Not collected in admission
    maritalStatus: 'single', // Default for students
    nationalId: '', // Not collected in admission
    ssnitNumber: '', // Not collected in admission
    physicalChallenge: 'none', // Default assumption
    studentIndexNumber: '', // Initially empty, will use registration number
    guardianEmail: '', // Not collected in admission
    guardianAddress: '', // Not collected in admission
    hallOfResidence: 'NOT_ASSIGNED', // To be assigned later
  };

  console.log("✅ Admission application mapped to student registration");
  return studentData;
}

/**
 * Transfer approved admission application to student portal
 * This is the main function that will be called when a student is accepted
 */
export async function transferApprovedAdmissionToStudentPortal(applicationId: string): Promise<{
  success: boolean;
  registrationNumber?: string;
  error?: string;
}> {
  try {
    console.log(`🚀 Starting transfer process for application: ${applicationId}`);
    
    // Initialize Firebase Admin when function is called
    const adminDb = getDb();
    console.log("✅ Firebase Admin database initialized");
    
    // 1. Fetch the admission application from Firebase
    console.log("📋 Fetching admission application...");
    const applicationsRef = adminDb.collection('admission-applications');
    
    // First, try to find by applicationId field
    let querySnapshot = await applicationsRef
      .where('applicationId', '==', applicationId)
      .get();
    
    let applicationDoc;
    
    if (querySnapshot.empty) {
      console.log("⚠️ Application not found by applicationId field, trying document ID...");
      // Fallback: try to find by document ID
      try {
        applicationDoc = await applicationsRef.doc(applicationId).get();
        if (!applicationDoc.exists) {
          console.error("❌ Admission application not found:", applicationId);
          return {
            success: false,
            error: 'Admission application not found'
          };
        }
      } catch (docError) {
        console.error("❌ Error accessing document by ID:", docError);
        return {
          success: false,
          error: 'Admission application not found'
        };
      }
    } else {
      applicationDoc = querySnapshot.docs[0];
    }
    
    const admissionData = applicationDoc.data() as AdmissionApplication;
    
    console.log("✅ Admission application found:", admissionData.personalInfo.firstName, admissionData.personalInfo.lastName);
    
    // 2. Check if application is accepted
    if (admissionData.applicationStatus !== 'accepted') {
      console.error("❌ Application is not accepted:", admissionData.applicationStatus);
      return {
        success: false,
        error: 'Application must be accepted before transfer'
      };
    }
    
    // 3. Check if student is already transferred (avoid duplicates)
    console.log("🔍 Checking for existing student registration...");
    const studentsRef = adminDb.collection('student-registrations');
    const existingQuery = await studentsRef
      .where('email', '==', admissionData.contactInfo.email.toLowerCase())
      .get();
    
    if (!existingQuery.empty) {
      console.log("⚠️ Student already exists in student portal");
      const existingStudent = existingQuery.docs[0].data();
      return {
        success: true,
        registrationNumber: existingStudent.registrationNumber,
        error: 'Student already transferred to portal'
      };
    }
    
    // 4. Validate admission data completeness
    console.log("🔍 Validating admission data completeness...");
    const requiredFields = ['personalInfo', 'contactInfo', 'programSelection', 'academicBackground'];
    const missingFields = requiredFields.filter(field => !admissionData[field]);
    
    if (missingFields.length > 0) {
      console.error("❌ Incomplete admission data. Missing fields:", missingFields);
      return {
        success: false,
        error: `Incomplete admission data. Missing: ${missingFields.join(', ')}`
      };
    }
    
    // Validate critical sub-fields
    if (!admissionData.personalInfo.firstName || !admissionData.personalInfo.lastName) {
      console.error("❌ Missing student name in admission data");
      return {
        success: false,
        error: 'Student name is required for transfer'
      };
    }
    
    if (!admissionData.programSelection.firstChoice && !admissionData.programSelection.program) {
      console.error("❌ Missing program selection in admission data");
      return {
        success: false,
        error: 'Program selection is required for transfer'
      };
    }
    
    console.log("✅ Admission data validation passed");
    
    // 5. Map admission data to student registration format
    console.log("🔄 Converting admission data to student registration format...");
    const studentData = await mapAdmissionToStudentRegistration(admissionData);
    
    // 5. Create Firebase Authentication account for student
    console.log("🔐 Creating Firebase Authentication account for student...");
    try {
      const { getAuth } = await import("firebase-admin/auth");
      const adminAuth = getAuth(adminDb.app);
      
      // Create Firebase Auth user with registration number as email prefix
      const studentEmail = admissionData.contactInfo.email.toLowerCase();
      const temporaryPassword = admissionData.personalInfo.dateOfBirth.replace(/[^0-9]/g, ''); // Use date of birth as password
      
      console.log(`📧 Creating auth account for: ${studentEmail}`);
      
      const userRecord = await adminAuth.createUser({
        email: studentEmail,
        password: temporaryPassword,
        displayName: `${admissionData.personalInfo.firstName} ${admissionData.personalInfo.lastName}`,
        emailVerified: true // Mark as verified since it's from admission
      });
      
      console.log("✅ Firebase Auth account created with UID:", userRecord.uid);
      
      // Add the Firebase UID to student data
      studentData.firebaseUid = userRecord.uid;
      studentData.authEmail = studentEmail;
      studentData.loginInstructions = {
        email: studentEmail,
        password: "Your date of birth (DDMMYYYY format)",
        registrationNumber: studentData.registrationNumber
      };
      
    } catch (authError) {
      console.error("⚠️ Failed to create Firebase Auth account:", authError);
      // Don't fail the transfer if auth creation fails - student can be created manually
      studentData.authCreationError = authError.message;
    }
    
    // 6. Save to student-registrations collection
    console.log("💾 Saving student to student-registrations collection...");
    const studentDocRef = await studentsRef.add(studentData);
    
    console.log("✅ Student successfully added to student portal with ID:", studentDocRef.id);
    
    // 6. Also add to students collection for course registration search
    console.log("📚 Adding student to students collection for course registration...");
    try {
      const studentsCollectionRef = adminDb.collection('students');
      
      // Map data for students collection format
      const studentsData = {
        registrationNumber: studentData.registrationNumber,
        name: `${studentData.surname} ${studentData.otherNames}`,
        surname: studentData.surname,
        otherNames: studentData.otherNames,
        gender: studentData.gender,
        dateOfBirth: studentData.dateOfBirth,
        nationality: studentData.nationality,
        program: studentData.programme,
        programme: studentData.programme,
        level: studentData.currentLevel,
        currentLevel: studentData.currentLevel,
        status: 'active',
        studyMode: studentData.scheduleType,
        scheduleType: studentData.scheduleType,
        email: studentData.email,
        phone: studentData.mobile,
        mobile: studentData.mobile,
        street: studentData.street,
        city: studentData.city,
        country: studentData.country,
        guardianName: studentData.guardianName,
        guardianContact: studentData.guardianContact,
        profilePictureUrl: studentData.profilePictureUrl,
        registrationDate: studentData.registrationDate,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        sourceCollection: 'admission-transfer',
        studentRegistrationId: studentDocRef.id,
        yearOfEntry: studentData.yearOfEntry,
        entryLevel: studentData.entryLevel,
        entryQualification: studentData.entryQualification
      };
      
      await studentsCollectionRef.add(studentsData);
      console.log("✅ Student also added to students collection for course registration");
    } catch (studentsError) {
      console.error("⚠️ Failed to add to students collection:", studentsError.message);
      // Don't fail the transfer if this fails - it can be done manually
    }
    
    // 7. Update the admission application with transfer info
    console.log("📝 Updating admission application with transfer information...");
    await applicationDoc.ref.update({
      transferredToPortal: true,
      transferredAt: FieldValue.serverTimestamp(),
      registrationNumber: studentData.registrationNumber,
      studentPortalId: studentDocRef.id,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`🎉 TRANSFER COMPLETE! Student can now login with:`);
    console.log(`   Email: ${studentData.authEmail || studentData.email}`);
    console.log(`   Password: ${studentData.personalInfo?.dateOfBirth || admissionData.personalInfo.dateOfBirth} (Date of Birth)`);
    console.log(`   Registration Number: ${studentData.registrationNumber}`);
    
    return {
      success: true,
      registrationNumber: studentData.registrationNumber
    };
    
  } catch (error) {
    console.error("❌ Error during admission transfer:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get transfer status for an application
 */
export async function getTransferStatus(applicationId: string): Promise<{
  isTransferred: boolean;
  registrationNumber?: string;
  transferredAt?: string;
}> {
  try {
    // Initialize Firebase Admin when function is called
    const adminDb = getDb();
    
    const applicationsRef = adminDb.collection('admission-applications');
    
    // First, try to find by applicationId field
    let querySnapshot = await applicationsRef
      .where('applicationId', '==', applicationId)
      .get();
    
    let applicationDoc;
    
    if (querySnapshot.empty) {
      console.log("⚠️ Application not found by applicationId field in getTransferStatus, trying document ID...");
      // Fallback: try to find by document ID
      try {
        applicationDoc = await applicationsRef.doc(applicationId).get();
        if (!applicationDoc.exists) {
          return { isTransferred: false };
        }
      } catch (docError) {
        console.error("❌ Error accessing document by ID in getTransferStatus:", docError);
        return { isTransferred: false };
      }
    } else {
      applicationDoc = querySnapshot.docs[0];
    }
    
    const applicationData = applicationDoc.data();
    
    return {
      isTransferred: !!applicationData.transferredToPortal,
      registrationNumber: applicationData.registrationNumber,
      transferredAt: applicationData.transferredAt
    };
    
  } catch (error) {
    console.error("Error checking transfer status:", error);
    return { isTransferred: false };
  }
}

/**
 * Utility function to validate student data before transfer
 */
function validateStudentData(studentData: StudentRegistrationData): string[] {
  const errors: string[] = [];
  
  // Required fields validation
  if (!studentData.surname) errors.push('Surname is required');
  if (!studentData.otherNames) errors.push('Other names are required');
  if (!studentData.email) errors.push('Email is required');
  if (!studentData.dateOfBirth) errors.push('Date of birth is required');
  if (!studentData.programme) errors.push('Programme is required');
  if (!studentData.registrationNumber) errors.push('Registration number is required');
  
  // Format validation
  const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
  if (studentData.dateOfBirth && !dateRegex.test(studentData.dateOfBirth)) {
    errors.push('Date of birth must be in DD-MM-YYYY format');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (studentData.email && !emailRegex.test(studentData.email)) {
    errors.push('Invalid email format');
  }
  
  return errors;
}

export default {
  transferApprovedAdmissionToStudentPortal,
  getTransferStatus,
  validateStudentData
};

