import { doc, setDoc, getDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from '../firebase';

/**
 * Draft Application Service
 * 
 * This service handles saving application data as drafts that are NOT visible to staff.
 * Only when the user submits their application will it be created in the main
 * admission-applications collection that staff can see.
 */

export interface DraftApplicationData {
  userId: string;
  applicationId: string;
  personalInfo?: any;
  contactInfo?: any;
  academicBackground?: any;
  programSelection?: any;
  documents?: any;
  matureStudentInfo?: any;
  matureStudentDocuments?: any;
  isMatureStudent?: boolean;
  paymentStatus?: string;
  paymentDetails?: any;
  currentStep?: number;
  lastSaved?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Save draft application data (NOT visible to staff)
 * This saves application progress without creating a record in admission-applications
 */
export const saveDraftApplicationData = async (
  userId: string, 
  data: Partial<DraftApplicationData>
): Promise<void> => {
  try {
    console.log('💾 DRAFT: Saving draft application data for user:', userId);
    
    // Save to a separate draft collection that staff can't see
    const draftRef = doc(db, 'application-drafts', userId);
    const timestamp = new Date().toISOString();
    
    // Get existing draft data if any
    const existingDraft = await getDoc(draftRef);
    const existingData = existingDraft.exists() ? existingDraft.data() : {};
    
    // Merge with existing data
    const updatedData = {
      ...existingData,
      ...data,
      userId,
      lastSaved: timestamp,
      updatedAt: timestamp,
      ...(existingData.createdAt ? {} : { createdAt: timestamp })
    };
    
    await setDoc(draftRef, updatedData, { merge: true });
    
    console.log('✅ DRAFT: Draft application data saved successfully');
  } catch (error) {
    console.error('❌ DRAFT: Error saving draft application data:', error);
    throw error;
  }
};

/**
 * Get draft application data by user ID
 */
export const getDraftApplicationData = async (userId: string): Promise<DraftApplicationData | null> => {
  try {
    const draftRef = doc(db, 'application-drafts', userId);
    const draftDoc = await getDoc(draftRef);
    
    if (draftDoc.exists()) {
      console.log('✅ DRAFT: Retrieved draft application data for user:', userId);
      return draftDoc.data() as DraftApplicationData;
    } else {
      console.log('ℹ️ DRAFT: No draft application found for user:', userId);
      return null;
    }
  } catch (error) {
    console.error('❌ DRAFT: Error getting draft application data:', error);
    throw error;
  }
};

/**
 * Save current step progress (for navigation)
 */
export const saveDraftStep = async (userId: string, step: number): Promise<void> => {
  try {
    await saveDraftApplicationData(userId, { currentStep: step });
    console.log('📍 DRAFT: Saved current step:', step);
  } catch (error) {
    console.error('❌ DRAFT: Error saving current step:', error);
    throw error;
  }
};

/**
 * Delete draft data (called after successful submission)
 */
export const deleteDraftApplicationData = async (userId: string): Promise<void> => {
  try {
    const draftRef = doc(db, 'application-drafts', userId);
    await setDoc(draftRef, { deleted: true, deletedAt: serverTimestamp() });
    console.log('🗑️ DRAFT: Draft application data marked as deleted for user:', userId);
  } catch (error) {
    console.error('❌ DRAFT: Error deleting draft application data:', error);
    // Don't throw error here as submission was successful
  }
};





