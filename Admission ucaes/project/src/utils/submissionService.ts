import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from '../firebase';
import { DraftApplicationData, getDraftApplicationData, deleteDraftApplicationData } from './draftApplicationService';

/**
 * Application Submission Service
 * 
 * This service handles the final submission of applications.
 * Only submitted applications are visible to staff in the admission-applications collection.
 */

/**
 * Submit application (makes it visible to staff)
 * This creates the actual application record that staff can see and review
 */
export const submitApplication = async (userId: string): Promise<string> => {
  try {
    console.log('🚀 SUBMISSION: Starting application submission for user:', userId);
    
    // 1. Get the user's profile to get their applicationId
    const userProfileRef = doc(db, 'user-profiles', userId);
    const userProfileDoc = await getDoc(userProfileRef);
    
    if (!userProfileDoc.exists()) {
      throw new Error('User profile not found. Please contact support.');
    }
    
    const userProfile = userProfileDoc.data();
    const applicationId = userProfile.applicationId;
    
    if (!applicationId) {
      throw new Error('Application ID not found in user profile. Please contact support.');
    }
    
    // 2. Get all the draft application data
    const draftData = await getDraftApplicationData(userId);
    
    if (!draftData) {
      throw new Error('No application data found. Please fill out your application before submitting.');
    }
    
    // 2.5. Ensure draft data has the application ID
    if (!draftData.applicationId) {
      console.log('⚠️ SUBMISSION: Draft data missing applicationId, using profile applicationId');
      draftData.applicationId = applicationId;
    }
    
    // 3. Validate that required data is present
    if (!draftData.personalInfo || !draftData.contactInfo || !draftData.programSelection) {
      throw new Error('Please complete all required sections before submitting.');
    }
    
    if (draftData.paymentStatus !== 'paid') {
      throw new Error('Payment must be completed before submitting your application.');
    }
    
    // 4. Create the submission data (this will be visible to staff)
    const submissionData = {
      applicationId,
      userId,
      email: userProfile.email,
      name: userProfile.name,
      
      // Application data from draft (handle undefined values)
      personalInfo: draftData.personalInfo,
      contactInfo: draftData.contactInfo,
      academicBackground: draftData.academicBackground || {},
      programSelection: draftData.programSelection,
      documents: draftData.documents || {},
      isMatureStudent: draftData.isMatureStudent || false,
      paymentStatus: draftData.paymentStatus,
      paymentDetails: draftData.paymentDetails,
      
      // Submission metadata
      applicationStatus: 'submitted', // Start with submitted status
      registrationStatus: 'submitted', // For compatibility
      status: 'submitted', // For compatibility
      submittedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      currentStep: 7, // Application submitted
      
      // Additional metadata
      submissionSource: 'web_portal',
      submissionVersion: '1.0'
    };
    
    // 4.5. Add mature student fields only if they exist (to avoid undefined values)
    if (draftData.matureStudentInfo) {
      submissionData.matureStudentInfo = draftData.matureStudentInfo;
    }
    if (draftData.matureStudentDocuments) {
      submissionData.matureStudentDocuments = draftData.matureStudentDocuments;
    }
    
    // 5. Create the application record in the main collection (visible to staff)
    const applicationRef = await addDoc(collection(db, 'admission-applications'), submissionData);
    
    console.log('✅ SUBMISSION: Application record created with ID:', applicationRef.id);
    console.log('✅ SUBMISSION: Application is now visible to staff for review');
    
    // 6. Clean up the draft data (optional - we could keep it for backup)
    await deleteDraftApplicationData(userId);
    
    console.log('🎉 SUBMISSION: Application submitted successfully!');
    
    return applicationRef.id;
    
  } catch (error) {
    console.error('❌ SUBMISSION: Error submitting application:', error);
    throw error;
  }
};

/**
 * Check if user has already submitted an application
 */
export const hasSubmittedApplication = async (userId: string): Promise<boolean> => {
  try {
    // Check if there's already a submitted application for this user
    const userProfileRef = doc(db, 'user-profiles', userId);
    const userProfileDoc = await getDoc(userProfileRef);
    
    if (!userProfileDoc.exists()) {
      return false;
    }
    
    const applicationId = userProfileDoc.data().applicationId;
    
    // Check if application exists in the main collection
    // This is a simple check - in a real app you'd query by userId
    return false; // For now, allow resubmission - you can implement this check later
    
  } catch (error) {
    console.error('❌ SUBMISSION: Error checking submission status:', error);
    return false;
  }
};
