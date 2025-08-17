import { db } from '../firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { generateSequentialApplicationId } from './applicationUtils';

// Types for application data
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  region: string;
  passportPhoto?: { url: string; publicId: string };
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export interface AcademicBackground {
  schoolName: string;
  shsProgram: string;
  waecIndexNumber: string;
  qualificationType: string;
  yearCompleted: string;
  subjects: Array<{ subject: string; grade: string }>;
  coreSubjects?: Array<{ subject: string; grade: string }>;
  electiveSubjects?: Array<{ subject: string; grade: string }>;
  certificates?: Array<{ name: string; url: string; publicId: string; uploadedAt: string }>;
}

export interface ProgramSelection {
  programType: string;
  program: string;
  level: string;
  studyLevel: string; // New field for 100, 200, etc.
  studyMode: string;
  firstChoice: string;
  secondChoice: string;
  applicationType: 'fresh' | 'topup';
  previousQualification: string;
  hasTranscript: boolean;
}

export interface DocumentUploads {
  idDocument?: { url: string; publicId: string };
  certificate?: { url: string; publicId: string };
  transcript?: { url: string; publicId: string };
}

// Mature Student Interfaces
export interface MatureStudentInfo {
  age: number;
  dateOfBirth: string;
  eligibilityType: 'age' | 'work_experience' | 'professional_qualification' | 'life_experience';
  workExperience: Array<{
    employer: string;
    position: string;
    startDate: string;
    endDate: string;
    responsibilities: string;
    isCurrentJob: boolean;
  }>;
  totalWorkYears: number;
  professionalQualifications: Array<{
    qualification: string;
    institution: string;
    yearObtained: string;
    relevantToProgram: boolean;
  }>;
  lifeExperience: string;
  relevantSkills: string[];
  volunteerWork: string;
  hasFormaleducation: boolean;
  lastEducationLevel: string;
  lastEducationYear: string;
  motivationStatement: string;
  careerGoals: string;
  whyThisProgram: string;
  needsSupport: boolean;
  supportType: string[];
  hasDisability: boolean;
  disabilityDetails: string;
  employmentStatus: 'employed' | 'unemployed' | 'self_employed' | 'retired';
  familyResponsibilities: boolean;
  familyDetails: string;
  studyTimeAvailable: string;
}

export interface MatureStudentDocuments {
  nationalId?: { url: string; publicId: string };
  passportPhoto?: { url: string; publicId: string };
  employmentLetters?: Array<{ url: string; publicId: string; name: string }>;
  payslips?: Array<{ url: string; publicId: string; name: string }>;
  workCertificates?: Array<{ url: string; publicId: string; name: string }>;
  professionalCertificates?: Array<{ url: string; publicId: string; name: string }>;
  trainingCertificates?: Array<{ url: string; publicId: string; name: string }>;
  previousCertificates?: Array<{ url: string; publicId: string; name: string }>;
  transcripts?: Array<{ url: string; publicId: string; name: string }>;
  motivationLetter?: { url: string; publicId: string };
  references?: Array<{ url: string; publicId: string; name: string }>;
  portfolioWork?: Array<{ url: string; publicId: string; name: string }>;
  medicalCertificate?: { url: string; publicId: string };
  disabilityDocuments?: Array<{ url: string; publicId: string; name: string }>;
  financialDocuments?: Array<{ url: string; publicId: string; name: string }>;
}

export interface ApplicationData {
  id?: string;
  userId: string;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  academicBackground: AcademicBackground;
  programSelection: ProgramSelection;
  documents: DocumentUploads;
  matureStudentInfo?: MatureStudentInfo;
  matureStudentDocuments?: MatureStudentDocuments;
  isMatureStudent?: boolean;
  paymentStatus: 'pending' | 'paid' | 'failed';
  applicationStatus: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  applicationId?: string;
}

/**
 * Save application data to Firebase
 */
export const saveApplicationData = async (
  userId: string, 
  data: Partial<ApplicationData>
): Promise<string> => {
  try {
    console.log('🔥 FIREBASE: Saving application data for user:', userId);
    
    // Check if application already exists for this user
    const existingQuery = query(
      collection(db, "admission-applications"),
      where("userId", "==", userId)
    );
    const existingDocs = await getDocs(existingQuery);
    
    let docId: string;
    const timestamp = new Date().toISOString();
    
    if (!existingDocs.empty) {
      // Update existing application
      const existingDoc = existingDocs.docs[0];
      docId = existingDoc.id;
      
      await updateDoc(doc(db, "admission-applications", docId), {
        ...data,
        updatedAt: timestamp
      });
      
      console.log('✅ FIREBASE: Updated existing application:', docId);
    } else {
      // Create new application
      // First, get the user's profile to get their existing applicationId
      const userProfileRef = doc(db, 'user-profiles', userId);
      const userProfileDoc = await getDoc(userProfileRef);
      
      let applicationId: string;
      if (userProfileDoc.exists() && userProfileDoc.data().applicationId) {
        // Use the existing applicationId from user profile
        applicationId = userProfileDoc.data().applicationId;
        console.log('✅ FIREBASE: Using existing applicationId from user profile:', applicationId);
      } else {
        // Fallback: generate a new applicationId if none exists
        applicationId = await generateSequentialApplicationId();
        console.log('⚠️ FIREBASE: No existing applicationId found, generated new one:', applicationId);
      }
      
      const newApplication = {
        userId,
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
        applicationId: applicationId
      };
      
      const docRef = await addDoc(collection(db, "admission-applications"), newApplication);
      docId = docRef.id;
      
      console.log('✅ FIREBASE: Created new application:', docId);
    }
    
    return docId;
  } catch (error) {
    console.error('❌ FIREBASE: Error saving application data:', error);
    throw error;
  }
};

/**
 * Get application data by user ID
 */
export const getApplicationDataByUserId = async (userId: string): Promise<ApplicationData | null> => {
  try {
    console.log('🔍 FIREBASE: Fetching application data for user:', userId);
    
    const querySnapshot = query(
      collection(db, "admission-applications"),
      where("userId", "==", userId)
    );
    const docs = await getDocs(querySnapshot);
    
    if (docs.empty) {
      console.log('📭 FIREBASE: No application found for user');
      return null;
    }
    
    const doc = docs.docs[0];
    const data = doc.data() as ApplicationData;
    data.id = doc.id;
    
    // Ensure applicationId is preserved from Firebase
    if (!data.applicationId && data.id) {
      console.log('⚠️ FIREBASE: Application missing applicationId, using document ID as fallback');
    }
    
    console.log('✅ FIREBASE: Found application data. ID:', data.id, 'ApplicationId:', data.applicationId);
    return data;
  } catch (error) {
    console.error('❌ FIREBASE: Error fetching application data:', error);
    throw error;
  }
};

/**
 * Get application data by application ID
 */
export const getApplicationDataById = async (applicationId: string): Promise<ApplicationData | null> => {
  try {
    console.log('🔍 FIREBASE: Fetching application data by ID:', applicationId);
    
    const docRef = doc(db, "admission-applications", applicationId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log('📭 FIREBASE: Application not found');
      return null;
    }
    
    const data = docSnap.data() as ApplicationData;
    data.id = docSnap.id;
    
    console.log('✅ FIREBASE: Found application data');
    return data;
  } catch (error) {
    console.error('❌ FIREBASE: Error fetching application data:', error);
    throw error;
  }
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (
  applicationId: string, 
  status: ApplicationData['applicationStatus']
): Promise<void> => {
  try {
    console.log('🔄 FIREBASE: Updating application status:', applicationId, 'to', status);
    
    await updateDoc(doc(db, "admission-applications", applicationId), {
      applicationStatus: status,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ FIREBASE: Application status updated');
  } catch (error) {
    console.error('❌ FIREBASE: Error updating application status:', error);
    throw error;
  }
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (
  applicationId: string, 
  status: ApplicationData['paymentStatus']
): Promise<void> => {
  try {
    console.log('🔄 FIREBASE: Updating payment status:', applicationId, 'to', status);
    
    await updateDoc(doc(db, "admission-applications", applicationId), {
      paymentStatus: status,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ FIREBASE: Payment status updated');
  } catch (error) {
    console.error('❌ FIREBASE: Error updating payment status:', error);
    throw error;
  }
};

/**
 * Get all applications (for admin/staff view)
 */
export const getAllApplications = async (): Promise<ApplicationData[]> => {
  try {
    console.log('🔍 FIREBASE: Fetching all applications');
    
    const querySnapshot = query(
      collection(db, "admission-applications"),
      orderBy("createdAt", "desc")
    );
    const docs = await getDocs(querySnapshot);
    
    const applications = docs.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as ApplicationData[];
    
    console.log('✅ FIREBASE: Found', applications.length, 'applications');
    return applications;
  } catch (error) {
    console.error('❌ FIREBASE: Error fetching all applications:', error);
    throw error;
  }
};

/**
 * Delete application data
 */
export const deleteApplicationData = async (applicationId: string): Promise<void> => {
  try {
    console.log('🗑️ FIREBASE: Deleting application:', applicationId);
    
    await deleteDoc(doc(db, "admission-applications", applicationId));
    
    console.log('✅ FIREBASE: Application deleted');
  } catch (error) {
    console.error('❌ FIREBASE: Error deleting application:', error);
    throw error;
  }
};

/**
 * Search applications by criteria
 */
export const searchApplications = async (
  criteria: {
    status?: ApplicationData['applicationStatus'];
    paymentStatus?: ApplicationData['paymentStatus'];
    program?: string;
    searchTerm?: string;
    isMatureStudent?: boolean;
  }
): Promise<ApplicationData[]> => {
  try {
    console.log('🔍 FIREBASE: Searching applications with criteria:', criteria);
    
    let q = query(collection(db, "admission-applications"));
    
    // Add filters based on criteria
    if (criteria.status) {
      q = query(q, where("applicationStatus", "==", criteria.status));
    }
    
    if (criteria.paymentStatus) {
      q = query(q, where("paymentStatus", "==", criteria.paymentStatus));
    }
    
    if (criteria.program) {
      q = query(q, where("programSelection.program", "==", criteria.program));
    }
    
    if (criteria.isMatureStudent !== undefined) {
      q = query(q, where("isMatureStudent", "==", criteria.isMatureStudent));
    }
    
    const querySnapshot = await getDocs(q);
    let applications = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as ApplicationData[];
    
    // Filter by search term if provided
    if (criteria.searchTerm) {
      const searchTerm = criteria.searchTerm.toLowerCase();
      applications = applications.filter(app => 
        app.personalInfo.firstName.toLowerCase().includes(searchTerm) ||
        app.personalInfo.lastName.toLowerCase().includes(searchTerm) ||
        app.contactInfo.email.toLowerCase().includes(searchTerm) ||
        app.applicationId?.toLowerCase().includes(searchTerm)
      );
    }
    
    console.log('✅ FIREBASE: Found', applications.length, 'applications matching criteria');
    return applications;
  } catch (error) {
    console.error('❌ FIREBASE: Error searching applications:', error);
    throw error;
  }
};

/**
 * Get all mature student applications
 */
export const getMatureStudentApplications = async (): Promise<ApplicationData[]> => {
  try {
    console.log('🔍 FIREBASE: Fetching mature student applications');
    
    const q = query(
      collection(db, "admission-applications"),
      where("isMatureStudent", "==", true),
      orderBy("createdAt", "desc")
    );
    const docs = await getDocs(q);
    
    const applications = docs.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as ApplicationData[];
    
    console.log('✅ FIREBASE: Found', applications.length, 'mature student applications');
    return applications;
  } catch (error) {
    console.error('❌ FIREBASE: Error fetching mature student applications:', error);
    throw error;
  }
};

/**
 * Get applications by eligibility type (for mature students)
 */
export const getApplicationsByEligibilityType = async (
  eligibilityType: MatureStudentInfo['eligibilityType']
): Promise<ApplicationData[]> => {
  try {
    console.log('🔍 FIREBASE: Fetching applications by eligibility type:', eligibilityType);
    
    const q = query(
      collection(db, "admission-applications"),
      where("isMatureStudent", "==", true),
      where("matureStudentInfo.eligibilityType", "==", eligibilityType),
      orderBy("createdAt", "desc")
    );
    const docs = await getDocs(q);
    
    const applications = docs.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as ApplicationData[];
    
    console.log('✅ FIREBASE: Found', applications.length, 'applications with eligibility type:', eligibilityType);
    return applications;
  } catch (error) {
    console.error('❌ FIREBASE: Error fetching applications by eligibility type:', error);
    throw error;
  }
};

/**
 * Get applications requiring support services
 */
export const getApplicationsRequiringSupport = async (): Promise<ApplicationData[]> => {
  try {
    console.log('🔍 FIREBASE: Fetching applications requiring support services');
    
    const q = query(
      collection(db, "admission-applications"),
      where("isMatureStudent", "==", true),
      where("matureStudentInfo.needsSupport", "==", true),
      orderBy("createdAt", "desc")
    );
    const docs = await getDocs(q);
    
    const applications = docs.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as ApplicationData[];
    
    console.log('✅ FIREBASE: Found', applications.length, 'applications requiring support');
    return applications;
  } catch (error) {
    console.error('❌ FIREBASE: Error fetching applications requiring support:', error);
    throw error;
  }
};

/**
 * Generate application statistics
 */
export const getApplicationStatistics = async (): Promise<{
  total: number;
  traditional: number;
  mature: number;
  byStatus: Record<string, number>;
  byEligibilityType: Record<string, number>;
  needingSupport: number;
}> => {
  try {
    console.log('📊 FIREBASE: Generating application statistics');
    
    const allApps = await getAllApplications();
    
    const stats = {
      total: allApps.length,
      traditional: allApps.filter(app => !app.isMatureStudent).length,
      mature: allApps.filter(app => app.isMatureStudent).length,
      byStatus: {} as Record<string, number>,
      byEligibilityType: {} as Record<string, number>,
      needingSupport: allApps.filter(app => app.matureStudentInfo?.needsSupport).length
    };
    
    // Count by status
    allApps.forEach(app => {
      stats.byStatus[app.applicationStatus] = (stats.byStatus[app.applicationStatus] || 0) + 1;
    });
    
    // Count by eligibility type (mature students only)
    allApps.filter(app => app.isMatureStudent && app.matureStudentInfo).forEach(app => {
      const eligibilityType = app.matureStudentInfo!.eligibilityType;
      stats.byEligibilityType[eligibilityType] = (stats.byEligibilityType[eligibilityType] || 0) + 1;
    });
    
    console.log('�� FIREBASE: Generated statistics:', stats);
    return stats;
  } catch (error) {
    console.error('❌ FIREBASE: Error generating statistics:', error);
    throw error;
  }
}; 

/**
 * Fix existing applications that don't have an applicationId
 */
export const fixMissingApplicationIds = async (): Promise<void> => {
  try {
    console.log('🔧 FIREBASE: Starting to fix missing application IDs...');
    
    const applicationsRef = collection(db, "admission-applications");
    const querySnapshot = await getDocs(applicationsRef);
    
    let fixedCount = 0;
    
    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      
      if (!data.applicationId || !data.applicationId.startsWith('UCAES')) {
        console.log(`🔧 FIREBASE: Fixing application ${docSnapshot.id} - missing proper applicationId`);
        
        try {
          const newApplicationId = await generateSequentialApplicationId();
          await updateDoc(doc(db, "admission-applications", docSnapshot.id), {
            applicationId: newApplicationId,
            updatedAt: new Date().toISOString()
          });
          
          console.log(`✅ FIREBASE: Fixed application ${docSnapshot.id} with new ID: ${newApplicationId}`);
          fixedCount++;
        } catch (error) {
          console.error(`❌ FIREBASE: Failed to fix application ${docSnapshot.id}:`, error);
        }
      }
    }
    
    console.log(`✅ FIREBASE: Fixed ${fixedCount} applications with missing application IDs`);
  } catch (error) {
    console.error('❌ FIREBASE: Error fixing missing application IDs:', error);
    throw error;
  }
}; 

/**
 * Get applications that are missing proper application IDs
 */
export const getApplicationsWithMissingIds = async (): Promise<ApplicationData[]> => {
  try {
    console.log('🔍 FIREBASE: Finding applications with missing application IDs...');
    
    const applicationsRef = collection(db, "admission-applications");
    const querySnapshot = await getDocs(applicationsRef);
    
    const missingIds: ApplicationData[] = [];
    
    querySnapshot.docs.forEach(docSnapshot => {
      const data = docSnapshot.data();
      
      if (!data.applicationId || !data.applicationId.startsWith('UCAES')) {
        missingIds.push({
          ...data,
          id: docSnapshot.id
        } as ApplicationData);
      }
    });
    
    console.log(`🔍 FIREBASE: Found ${missingIds.length} applications with missing IDs`);
    return missingIds;
  } catch (error) {
    console.error('❌ FIREBASE: Error finding applications with missing IDs:', error);
    throw error;
  }
}; 