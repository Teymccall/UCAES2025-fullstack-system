import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getApplicationDataByUserId, 
  updateApplicationStatus,
  type ApplicationData as FirebaseApplicationData,
  type PersonalInfo,
  type ContactInfo,
  type AcademicBackground,
  type ProgramSelection,
  type DocumentUploads
} from '../utils/firebaseApplicationService';
import { 
  saveDraftApplicationData, 
  getDraftApplicationData, 
  saveDraftStep 
} from '../utils/draftApplicationService';
import { submitApplication as submitApplicationToFirebase } from '../utils/submissionService';
import { paystackService } from '../utils/paystackService';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  region: string;
  passportPhoto?: { url: string; publicId: string };
}

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
}

interface AcademicBackground {
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

interface ProgramSelection {
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

interface DocumentUploads {
  photo?: File | { url: string; publicId: string };
  idDocument?: File | { url: string; publicId: string };
  certificate?: File | { url: string; publicId: string };
  transcript?: File | { url: string; publicId: string };
  additionalDocs?: File | { url: string; publicId: string };
}

interface MatureStudentInfo {
  // Age and eligibility
  age: number;
  dateOfBirth: string;
  eligibilityType: 'age' | 'work_experience' | 'professional_qualification' | 'life_experience';
  
  // Work Experience
  workExperience: Array<{
    employer: string;
    position: string;
    startDate: string;
    endDate: string;
    responsibilities: string;
    isCurrentJob: boolean;
  }>;
  totalWorkYears: number;
  
  // Professional Qualifications
  professionalQualifications: Array<{
    qualification: string;
    institution: string;
    yearObtained: string;
    relevantToProgram: boolean;
  }>;
  
  // Life Experience and Skills
  lifeExperience: string;
  relevantSkills: string[];
  volunteerWork: string;
  
  // Educational Background (if any)
  hasFormaleducation: boolean;
  lastEducationLevel: string;
  lastEducationYear: string;
  
  // Motivation and Goals
  motivationStatement: string;
  careerGoals: string;
  whyThisProgram: string;
  
  // Support and Accessibility
  needsSupport: boolean;
  supportType: string[];
  hasDisability: boolean;
  disabilityDetails: string;
  
  // Financial and Family Circumstances
  employmentStatus: 'employed' | 'unemployed' | 'self_employed' | 'retired';
  familyResponsibilities: boolean;
  familyDetails: string;
  studyTimeAvailable: string;
}

interface MatureStudentDocuments {
  // Identity and Personal Documents
  nationalId?: { url: string; publicId: string };
  passportPhoto?: { url: string; publicId: string };
  
  // Work Experience Documents
  employmentLetters?: Array<{ url: string; publicId: string; name: string }>;
  payslips?: Array<{ url: string; publicId: string; name: string }>;
  workCertificates?: Array<{ url: string; publicId: string; name: string }>;
  
  // Professional Qualifications
  professionalCertificates?: Array<{ url: string; publicId: string; name: string }>;
  trainingCertificates?: Array<{ url: string; publicId: string; name: string }>;
  
  // Educational Documents (if any)
  previousCertificates?: Array<{ url: string; publicId: string; name: string }>;
  transcripts?: Array<{ url: string; publicId: string; name: string }>;
  
  // Supporting Documents
  motivationLetter?: { url: string; publicId: string };
  references?: Array<{ url: string; publicId: string; name: string }>;
  portfolioWork?: Array<{ url: string; publicId: string; name: string }>;
  
  // Special Circumstances
  medicalCertificate?: { url: string; publicId: string };
  disabilityDocuments?: Array<{ url: string; publicId: string; name: string }>;
  financialDocuments?: Array<{ url: string; publicId: string; name: string }>;
}

interface PaymentDetails {
  transactionId: string;
  reference: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paidAt: string;
  status: string;
  customerEmail: string;
  customerName: string;
}

interface ApplicationData {
  id?: string;
  applicationId?: string;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  academicBackground: AcademicBackground;
  programSelection: ProgramSelection;
  documents: DocumentUploads;
  matureStudentInfo?: MatureStudentInfo;
  matureStudentDocuments?: MatureStudentDocuments;
  isMatureStudent?: boolean;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentDetails?: PaymentDetails;
  applicationStatus: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  submittedAt?: string;
  updatedAt?: string;
  createdAt?: string;
}

interface ApplicationContextType {
  applicationData: ApplicationData;
  updatePersonalInfo: (data: PersonalInfo) => void;
  updateContactInfo: (data: ContactInfo) => void;
  updateAcademicBackground: (data: AcademicBackground) => void;
  updateProgramSelection: (data: ProgramSelection) => void;
  updateDocuments: (data: DocumentUploads) => void;
  updateMatureStudentInfo: (data: MatureStudentInfo) => void;
  updateMatureStudentDocuments: (data: MatureStudentDocuments) => void;
  setMatureStudent: (isMature: boolean) => void;
  updatePaymentStatus: (status: 'pending' | 'paid' | 'failed') => void;
  savePaymentDetails: (paymentDetails: PaymentDetails) => Promise<void>;
  submitApplication: () => void;
  clearApplicationData: () => void;
  refreshApplicationData: () => Promise<void>;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isLoading: boolean;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
};

const initialApplicationData: ApplicationData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    region: ''
  },
  contactInfo: {
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: ''
  },
  academicBackground: {
    schoolName: '',
    shsProgram: '',
    waecIndexNumber: '',
    qualificationType: '',
    yearCompleted: '',
    subjects: [],
    certificates: []
  },
  programSelection: {
    programType: '',
    program: '',
    level: '',
    studyLevel: '',
    studyMode: '',
    firstChoice: '',
    secondChoice: ''
  },
  documents: {},
  paymentStatus: 'pending',
  applicationStatus: 'draft'
};

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [applicationData, setApplicationData] = useState<ApplicationData>(initialApplicationData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load user-specific data when user changes
  useEffect(() => {
    const loadApplicationData = async () => {
      if (user?.id) {
        console.log('ApplicationContext: Loading data for user:', user.id);
        setIsLoading(true);
        
        try {
          // ✅ FIXED: Load draft application data (not visible to staff)
          const draftData = await getDraftApplicationData(user.id);
          
          // Also check for submitted application data
          const firebaseData = await getApplicationDataByUserId(user.id);
          
          // 🔄 FIX: Prioritize submitted application data for status display
          // If application is submitted, use submitted data to show latest status (accepted/rejected)
          // Only use draft data if no submitted application exists
          const dataToUse = firebaseData || draftData;
          
          if (dataToUse) {
            // Convert data to local format with safe defaults
            const localData: ApplicationData = {
              id: dataToUse.id || '',
              applicationId: dataToUse.applicationId || user.applicationId,
              personalInfo: {
                firstName: dataToUse.personalInfo?.firstName || '',
                lastName: dataToUse.personalInfo?.lastName || '',
                dateOfBirth: dataToUse.personalInfo?.dateOfBirth || '',
                gender: dataToUse.personalInfo?.gender || '',
                nationality: dataToUse.personalInfo?.nationality || '',
                region: dataToUse.personalInfo?.region || '',
                passportPhoto: dataToUse.personalInfo?.passportPhoto
              },
              contactInfo: {
                phone: dataToUse.contactInfo?.phone || '',
                email: dataToUse.contactInfo?.email || '',
                address: dataToUse.contactInfo?.address || '',
                emergencyContact: dataToUse.contactInfo?.emergencyContact || '',
                emergencyPhone: dataToUse.contactInfo?.emergencyPhone || ''
              },
              academicBackground: {
                schoolName: dataToUse.academicBackground?.schoolName || '',
                shsProgram: dataToUse.academicBackground?.shsProgram || '',
                waecIndexNumber: dataToUse.academicBackground?.waecIndexNumber || '',
                qualificationType: dataToUse.academicBackground?.qualificationType || '',
                yearCompleted: dataToUse.academicBackground?.yearCompleted || '',
                subjects: dataToUse.academicBackground?.subjects || [],
                certificates: dataToUse.academicBackground?.certificates || []
              },
              programSelection: {
                programType: dataToUse.programSelection?.programType || '',
                program: dataToUse.programSelection?.program || '',
                level: dataToUse.programSelection?.level || '',
                studyLevel: dataToUse.programSelection?.studyLevel || '',
                studyMode: dataToUse.programSelection?.studyMode || '',
                firstChoice: dataToUse.programSelection?.firstChoice || '',
                secondChoice: dataToUse.programSelection?.secondChoice || ''
              },
              documents: dataToUse.documents || {},
              paymentStatus: dataToUse.paymentStatus || 'pending',
              paymentDetails: dataToUse.paymentDetails,
              applicationStatus: dataToUse.applicationStatus || 'draft',
              submittedAt: dataToUse.submittedAt,
              updatedAt: dataToUse.updatedAt,
              createdAt: dataToUse.createdAt
            };
            
            setApplicationData(localData);
            setCurrentStep(dataToUse.currentStep || 1);
            console.log('ApplicationContext: Loaded application data from Firebase');
          } else {
            // No existing data, initialize with user info
            console.log('ApplicationContext: No existing data found, initializing with user info');            
            // Initialize with user email if available
            const newData = {
              ...initialApplicationData,
              applicationId: user.applicationId, // Use applicationId from user object
              contactInfo: {
                ...initialApplicationData.contactInfo,
                email: user.email || ''
              }
            };
            
            setApplicationData(newData);
            setCurrentStep(1);
            console.log('ApplicationContext: Initialized with new data:', newData);
          }
        } catch (error) {
          console.error('Error loading application data from Firebase:', error);
          setApplicationData(initialApplicationData);
          setCurrentStep(1);
        } finally {
          setIsLoading(false);
        }
      } else {
        // No user logged in, use guest data or clear
        setApplicationData(initialApplicationData);
        setCurrentStep(1);
      }
    };
    
    loadApplicationData();
  }, [user?.id]);

  // Check payment status on mount if user is authenticated
  useEffect(() => {
    if (user?.id) {
      checkPaymentStatus();
    }
  }, [user?.id]);

  const updatePersonalInfo = async (data: PersonalInfo) => {
    console.log('🔄 ApplicationContext: updatePersonalInfo called');
    console.log('📋 Data to save:', data);
    console.log('👤 User ID:', user?.id);
    
    if (!user?.id) {
      console.log('❌ No user ID, cannot save');
      return;
    }
    
    console.log('✅ User authenticated, updating local state...');
    setApplicationData(prev => ({ ...prev, personalInfo: data }));
    
    try {
      console.log('💾 Saving personal info as draft...');
      await saveDraftApplicationData(user.id, { personalInfo: data, currentStep });
      console.log('✅ Personal info saved as draft successfully');
    } catch (error) {
      console.error('❌ Error saving personal info as draft:', error);
    }
  };

  const updateContactInfo = async (data: ContactInfo) => {
    if (!user?.id) return;
    
    setApplicationData(prev => ({ ...prev, contactInfo: data }));
    
    try {
      await saveDraftApplicationData(user.id, { contactInfo: data, currentStep });
    } catch (error) {
      console.error('Error saving contact info to Firebase:', error);
    }
  };

  const updateAcademicBackground = async (data: AcademicBackground) => {
    if (!user?.id) return;
    
    setApplicationData(prev => ({ ...prev, academicBackground: data }));
    
    try {
      await saveDraftApplicationData(user.id, { academicBackground: data, currentStep });
    } catch (error) {
      console.error('Error saving academic background to Firebase:', error);
    }
  };

  const updateProgramSelection = async (data: ProgramSelection) => {
    if (!user?.id) return;
    
    setApplicationData(prev => ({ ...prev, programSelection: data }));
    
    try {
      await saveDraftApplicationData(user.id, { programSelection: data, currentStep });
    } catch (error) {
      console.error('Error saving program selection to Firebase:', error);
    }
  };

  const updateDocuments = async (data: DocumentUploads) => {
    if (!user?.id) return;
    
    setApplicationData(prev => ({ ...prev, documents: data }));
    
    try {
      await saveDraftApplicationData(user.id, { documents: data, currentStep });
    } catch (error) {
      console.error('Error saving documents to Firebase:', error);
    }
  };

  const updateMatureStudentInfo = async (data: MatureStudentInfo) => {
    if (!user?.id) return;
    
    setApplicationData(prev => ({ ...prev, matureStudentInfo: data }));
    
    try {
      await saveDraftApplicationData(user.id, { matureStudentInfo: data, currentStep });
    } catch (error) {
      console.error('Error saving mature student info to Firebase:', error);
    }
  };

  const updateMatureStudentDocuments = async (data: MatureStudentDocuments) => {
    if (!user?.id) return;
    
    setApplicationData(prev => ({ ...prev, matureStudentDocuments: data }));
    
    try {
      await saveDraftApplicationData(user.id, { matureStudentDocuments: data, currentStep });
    } catch (error) {
      console.error('Error saving mature student documents to Firebase:', error);
    }
  };

  const setMatureStudent = async (isMature: boolean) => {
    if (!user?.id) return;
    
    setApplicationData(prev => ({ ...prev, isMatureStudent: isMature }));
    
    try {
      await saveDraftApplicationData(user.id, { isMatureStudent: isMature, currentStep });
    } catch (error) {
      console.error('Error saving mature student status to Firebase:', error);
    }
  };

  const updatePaymentStatus = async (status: 'pending' | 'paid' | 'failed') => {
    if (!user?.id) return;
    
    setApplicationData(prev => ({ ...prev, paymentStatus: status }));
    
    try {
      await saveDraftApplicationData(user.id, { paymentStatus: status, currentStep });
    } catch (error) {
      console.error('Error saving payment status to Firebase:', error);
    }
  };

  const initializePaystackPayment = async () => {
    console.log('🚀 Starting payment initialization...');
    console.log('👤 User:', user);
    console.log('📋 Application data:', applicationData);
    
    if (!user?.id) {
      console.error('❌ No user ID found');
      throw new Error('User not authenticated');
    }

    // Validate required fields
    const missingFields = [];
    if (!applicationData.personalInfo.firstName) missingFields.push('first name');
    if (!applicationData.personalInfo.lastName) missingFields.push('last name');
    if (!applicationData.contactInfo.email) missingFields.push('email');
    if (!applicationData.contactInfo.phone) missingFields.push('phone');
    if (!applicationData.programSelection.firstChoice) missingFields.push('program selection');
    if (!applicationData.programSelection.studyLevel) missingFields.push('study level');

    console.log('🔍 Validation check - Missing fields:', missingFields);

    if (missingFields.length > 0) {
      console.error('❌ Validation failed - Missing fields:', missingFields);
      throw new Error(`Please complete the following required fields: ${missingFields.join(', ')}`);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicationData.contactInfo.email)) {
      console.error('❌ Invalid email format:', applicationData.contactInfo.email);
      throw new Error('Please provide a valid email address');
    }

    console.log('✅ All validations passed');

    try {
      const paymentData = {
        email: applicationData.contactInfo.email,
        amount: paystackService.convertToPesewas(200), // GHS 200
        applicantName: `${applicationData.personalInfo.firstName} ${applicationData.personalInfo.lastName}`,
        program: applicationData.programSelection.firstChoice
      };
      
      console.log('📤 Initializing Paystack payment for:', paymentData);

      // Initialize payment using the Paystack service
      const paymentResult = await paystackService.initializePayment(
        applicationData.contactInfo.email.trim(),
        paystackService.convertToPesewas(200), // GHS 200 in pesewas
        {
          applicationType: applicationData.programSelection.programType || 'Undergraduate',
          applicantName: `${applicationData.personalInfo.firstName} ${applicationData.personalInfo.lastName}`,
          applicationId: user.applicationId || user.id
        }
      );

      console.log('✅ Payment initialized successfully:', paymentResult);

      // Store reference for later verification
      localStorage.setItem('admissionPaymentRef', paymentResult.reference);
      console.log('💾 Payment reference stored in localStorage:', paymentResult.reference);
      
      // Redirect to Paystack checkout
      console.log('🔄 Redirecting to Paystack checkout:', paymentResult.authorizationUrl);
      window.location.href = paymentResult.authorizationUrl;
      
      return paymentResult;
    } catch (error) {
      console.error('❌ Error initializing Paystack payment:', error);
      throw error;
    }
  };

  const verifyPaystackPayment = async (reference: string) => {
    console.log('🔍 ApplicationContext: Starting payment verification...');
    console.log('🔑 Reference to verify:', reference);
    
    try {
      console.log('🔍 Calling paystackService.verifyPayment...');
      
      // Use the existing Paystack service to verify payment
      const verificationResult = await paystackService.verifyPayment(reference);
      console.log('📥 Paystack verification result:', verificationResult);
      
      if (paystackService.isPaymentSuccessful(verificationResult)) {
        console.log('✅ Payment verified successfully:', verificationResult);
        
        // Create payment details from verification result
        const paymentDetails = {
          transactionId: verificationResult.data?.id?.toString() || reference,
          reference: verificationResult.data?.reference || reference,
          amount: verificationResult.data?.amount || 20000, // Default to GHS 200
          currency: verificationResult.data?.currency || 'GHS',
          paymentMethod: paystackService.getPaymentMethod(verificationResult),
          paidAt: paystackService.getPaymentDate(verificationResult),
          status: 'success',
          customerEmail: applicationData.contactInfo.email,
          customerName: `${applicationData.personalInfo.firstName} ${applicationData.personalInfo.lastName}`
        };
        
        console.log('💾 Payment details created:', paymentDetails);

        // Update local state
        console.log('🔄 Updating local application state...');
        setApplicationData(prev => ({ 
          ...prev, 
          paymentStatus: 'paid',
          paymentDetails
        }));

        // Save to Firebase
        if (user?.id) {
          console.log('🔥 Saving payment details to Firebase...');
          await saveDraftApplicationData(user.id, { 
            paymentStatus: 'paid',
            paymentDetails,
            currentStep: 6
          });
          console.log('✅ Payment details saved to Firebase');
        }

        return verificationResult.data;
      } else {
        console.log('❌ Payment verification failed - payment not successful:', verificationResult);
        setApplicationData(prev => ({ ...prev, paymentStatus: 'failed' }));
        
        if (user?.id) {
          console.log('🔥 Updating Firebase with failed status...');
          await saveDraftApplicationData(user.id, { paymentStatus: 'failed', currentStep });
        }
        
        throw new Error('Payment verification failed - payment was not successful');
      }
    } catch (error) {
      console.error('❌ Error verifying Paystack payment:', error);
      setApplicationData(prev => ({ ...prev, paymentStatus: 'failed' }));
      
      if (user?.id) {
        console.log('🔥 Updating Firebase with failed status...');
        await saveDraftApplicationData(user.id, { paymentStatus: 'failed', currentStep });
      }
      
      throw error;
    }
  };

  const checkPaymentStatus = async () => {
    if (!user?.id) return null;

    try {
      const reference = localStorage.getItem('admissionPaymentRef');
      if (!reference) {
        console.log('🔍 No payment reference found in localStorage');
        return null;
      }

      console.log('🔍 Checking payment status for reference:', reference);
      
      // Use the existing Paystack service to check payment status
      const paymentData = await paystackService.getPaymentDetails(reference);
      
      if (paystackService.isPaymentSuccessful(paymentData)) {
        console.log('✅ Payment verified as successful with Paystack');
        
        // Update local state based on actual payment status
        setApplicationData(prev => ({ 
          ...prev, 
          paymentStatus: 'paid',
          paymentDetails: {
            transactionId: paymentData.data?.id?.toString() || paymentData.data?.reference || reference,
            reference: paymentData.data?.reference || reference,
            amount: paymentData.data?.amount || 20000,
            currency: paymentData.data?.currency || 'GHS',
            paymentMethod: paystackService.getPaymentMethod(paymentData),
            paidAt: paystackService.getPaymentDate(paymentData),
            status: 'success',
            customerEmail: applicationData.contactInfo.email,
            customerName: `${applicationData.personalInfo.firstName} ${applicationData.personalInfo.lastName}`
          }
        }));

        return {
          status: 'success',
          reference: paymentData.data?.reference || reference,
          amount: paymentData.data?.amount || 20000,
          paidAt: paystackService.getPaymentDate(paymentData)
        };
      } else {
        console.log('❌ Payment not successful with Paystack, clearing localStorage reference');
        
        // Clear the invalid reference from localStorage
        localStorage.removeItem('admissionPaymentRef');
        
        // Payment not successful
        setApplicationData(prev => ({ 
          ...prev, 
          paymentStatus: 'pending'
        }));
        
        return {
          status: 'pending',
          reference: paymentData.data?.reference || reference
        };
      }
    } catch (error) {
      console.error('❌ Error checking payment status:', error);
      
      // Clear the invalid reference from localStorage on error
      localStorage.removeItem('admissionPaymentRef');
      
      return null;
    }
  };

  const savePaymentDetails = async (paymentDetails: PaymentDetails) => {
    if (!user?.id) return;
    
    try {
      await saveDraftApplicationData(user.id, { 
        paymentDetails,
        paymentStatus: 'paid',
        currentStep 
      });
      console.log('Payment details saved to Firebase');
    } catch (error) {
      console.error('Error saving payment details to Firebase:', error);
    }
  };

  const submitApplication = async () => {
    if (!user?.id) return;
    
    const currentTime = new Date().toISOString();
    
    setApplicationData(prev => ({ 
      ...prev, 
      applicationStatus: 'submitted',
      submittedAt: currentTime
    }));
    
    try {
      // ✅ FIXED: Use proper submission service that creates visible application record
      await submitApplicationToFirebase(user.id);
      console.log('✅ Application submitted successfully and is now visible to staff');
    } catch (error) {
      console.error('Error submitting application to Firebase:', error);
      throw error; // Re-throw to handle in UI
    }
  };

  const handleSetCurrentStep = async (step: number) => {
    setCurrentStep(step);
    
    if (user?.id) {
      try {
        await saveDraftStep(user.id, step);
      } catch (error) {
        console.error('Error saving current step to Firebase:', error);
      }
    }
  };

  const clearApplicationData = async () => {
    setApplicationData(initialApplicationData);
    setCurrentStep(1);
    
    // Note: We don't delete from Firebase immediately to preserve data
    // In a real app, you might want to add a "deleted" flag instead
    console.log('Application data cleared locally');
  };

  const refreshApplicationData = async () => {
    if (user?.id) {
      setIsLoading(true);
      try {
        console.log('🔄 Refreshing application data for user:', user.id);
        const draftData = await getDraftApplicationData(user.id);
        const firebaseData = await getApplicationDataByUserId(user.id);
        
        // 🔄 FIX: Prioritize submitted application data for status display
        const dataToUse = firebaseData || draftData;
        
        if (dataToUse) {
          const localData: ApplicationData = {
            id: dataToUse.id,
            applicationId: dataToUse.applicationId,
            personalInfo: {
              firstName: dataToUse.personalInfo?.firstName || '',
              lastName: dataToUse.personalInfo?.lastName || '',
              dateOfBirth: dataToUse.personalInfo?.dateOfBirth || '',
              gender: dataToUse.personalInfo?.gender || '',
              nationality: dataToUse.personalInfo?.nationality || '',
              region: dataToUse.personalInfo?.region || '',
              passportPhoto: dataToUse.personalInfo?.passportPhoto
            },
            contactInfo: {
              phone: dataToUse.contactInfo?.phone || '',
              email: dataToUse.contactInfo?.email || '',
              address: dataToUse.contactInfo?.address || '',
              emergencyContact: dataToUse.contactInfo?.emergencyContact || '',
              emergencyPhone: dataToUse.contactInfo?.emergencyPhone || ''
            },
            academicBackground: {
              schoolName: dataToUse.academicBackground?.schoolName || '',
              shsProgram: dataToUse.academicBackground?.shsProgram || '',
              waecIndexNumber: dataToUse.academicBackground?.waecIndexNumber || '',
              qualificationType: dataToUse.academicBackground?.qualificationType || '',
              yearCompleted: dataToUse.academicBackground?.yearCompleted || '',
              subjects: dataToUse.academicBackground?.subjects || [],
              certificates: dataToUse.academicBackground?.certificates || []
            },
            programSelection: {
              programType: dataToUse.programSelection?.programType || '',
              program: dataToUse.programSelection?.program || '',
              level: dataToUse.programSelection?.level || '',
              studyLevel: dataToUse.programSelection?.studyLevel || '',
              studyMode: dataToUse.programSelection?.studyMode || '',
              firstChoice: dataToUse.programSelection?.firstChoice || '',
              secondChoice: dataToUse.programSelection?.secondChoice || ''
            },
            documents: dataToUse.documents || {},
            paymentStatus: dataToUse.paymentStatus || 'pending',
            applicationStatus: dataToUse.applicationStatus || 'draft',
            submittedAt: dataToUse.submittedAt,
            updatedAt: dataToUse.updatedAt,
            createdAt: dataToUse.createdAt
          };
          
          setApplicationData(localData);
          setCurrentStep(dataToUse.currentStep || 1);
          console.log('✅ Application data refreshed successfully');
        }
      } catch (error) {
        console.error('❌ Error refreshing application data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <ApplicationContext.Provider value={{
      applicationData,
      updatePersonalInfo,
      updateContactInfo,
      updateAcademicBackground,
      updateProgramSelection,
      updateDocuments,
      updateMatureStudentInfo,
      updateMatureStudentDocuments,
      setMatureStudent,
      updatePaymentStatus,
      savePaymentDetails,
      submitApplication,
      clearApplicationData,
      refreshApplicationData,
      initializePaystackPayment,
      verifyPaystackPayment,
      checkPaymentStatus,
      currentStep,
      setCurrentStep: handleSetCurrentStep,
      isLoading
    }}>
      {children}
    </ApplicationContext.Provider>
  );
};