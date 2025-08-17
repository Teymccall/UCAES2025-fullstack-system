import { collection, doc, getDocs, getDoc, addDoc, updateDoc, query, where, orderBy, deleteDoc, setDoc, writeBatch } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "./firebase"
import type { Payment, FeeAccount, BulkUploadResult, Student } from "./types"

// Fees Management Services

/**
 * Get all payments with optional filtering
 */
export const getAllPayments = async (filters?: {
  status?: "pending" | "verified" | "rejected"
  category?: string
  studentId?: string
}): Promise<Payment[]> => {
  try {
    let q = collection(db, "fees")
    
    if (filters) {
      if (filters.status) {
        q = query(q, where("status", "==", filters.status))
      }
      if (filters.category) {
        q = query(q, where("category", "==", filters.category))
      }
      if (filters.studentId) {
        q = query(q, where("studentId", "==", filters.studentId))
      }
    }
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[]
  } catch (error) {
    console.error("Error getting payments:", error)
    throw error
  }
}

/**
 * Get payments for a specific student
 */
export const getStudentPayments = async (studentId: string): Promise<Payment[]> => {
  try {
    const q = query(
      collection(db, "fees"),
      where("studentId", "==", studentId),
      orderBy("date", "desc")
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[]
  } catch (error) {
    console.error("Error getting student payments:", error)
    throw error
  }
}

/**
 * Get a student's fee account
 */
export const getStudentFeeAccount = async (studentId: string, academicYear: string): Promise<FeeAccount | null> => {
  try {
    const q = query(
      collection(db, "feeAccounts"),
      where("studentId", "==", studentId),
      where("academicYear", "==", academicYear)
    )
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) return null
    
    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    } as FeeAccount
  } catch (error) {
    console.error("Error getting student fee account:", error)
    throw error
  }
}

/**
 * Add a new payment
 */
export const addPayment = async (payment: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    const paymentData = {
      ...payment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const docRef = await addDoc(collection(db, "fees"), paymentData)
    return docRef.id
  } catch (error) {
    console.error("Error adding payment:", error)
    throw error
  }
}

/**
 * Update payment status
 */
export const updatePaymentStatus = async (
  paymentId: string, 
  status: "pending" | "verified" | "rejected",
  verifiedBy?: string,
  rejectionReason?: string
): Promise<void> => {
  try {
    const paymentRef = doc(db, "fees", paymentId)
    
    const updateData: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString()
    }
    
    if (status === "verified" && verifiedBy) {
      updateData.verifiedBy = verifiedBy
      updateData.verifiedAt = new Date().toISOString()
    }
    
    if (status === "rejected" && rejectionReason) {
      updateData.rejectionReason = rejectionReason
    }
    
    await updateDoc(paymentRef, updateData)
    
    // If payment is verified, update the student's fee account
    if (status === "verified") {
      const payment = await getDoc(paymentRef)
      if (payment.exists()) {
        const paymentData = payment.data() as Payment
        await updateStudentFeeAccount(paymentData.studentId, paymentData)
      }
    }
  } catch (error) {
    console.error("Error updating payment status:", error)
    throw error
  }
}

/**
 * Update a student's fee account after a verified payment
 */
const updateStudentFeeAccount = async (studentId: string, payment: Payment): Promise<void> => {
  try {
    // Get the current academic year
    const academicYear = "2024/2025" // This should come from settings
    
    // Find the student's fee account
    const q = query(
      collection(db, "feeAccounts"),
      where("studentId", "==", studentId),
      where("academicYear", "==", academicYear)
    )
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      // Create a new fee account if none exists
      const newAccount: Omit<FeeAccount, "id"> = {
        studentId,
        academicYear,
        totalTuition: payment.category === "Tuition" ? payment.amount : 0,
        totalHostel: payment.category === "Hostel" ? payment.amount : 0,
        totalLibrary: payment.category === "Library" ? payment.amount : 0,
        totalOther: payment.category === "Other" ? payment.amount : 0,
        totalPaid: payment.amount,
        balance: 0, // This should be calculated based on total fees required
        lastPaymentDate: payment.date,
        status: "partial", // Assuming it's partial until confirmed fully paid
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await addDoc(collection(db, "feeAccounts"), newAccount)
    } else {
      // Update existing fee account
      const accountDoc = querySnapshot.docs[0]
      const account = accountDoc.data() as FeeAccount
      
      // Update the appropriate category total
      const updateData: Record<string, any> = {
        totalPaid: account.totalPaid + payment.amount,
        lastPaymentDate: payment.date,
        updatedAt: new Date().toISOString()
      }
      
      if (payment.category === "Tuition") {
        updateData.totalTuition = account.totalTuition + payment.amount
      } else if (payment.category === "Hostel") {
        updateData.totalHostel = account.totalHostel + payment.amount
      } else if (payment.category === "Library") {
        updateData.totalLibrary = account.totalLibrary + payment.amount
      } else if (payment.category === "Other") {
        updateData.totalOther = account.totalOther + payment.amount
      }
      
      // Recalculate status based on balance
      // This is a simplified example - actual logic would depend on total fees required
      if (updateData.totalPaid >= account.balance) {
        updateData.status = "paid"
      } else {
        updateData.status = "partial"
      }
      
      await updateDoc(doc(db, "feeAccounts", accountDoc.id), updateData)
    }
  } catch (error) {
    console.error("Error updating student fee account:", error)
    throw error
  }
}

/**
 * Upload a payment receipt
 */
export const uploadReceipt = async (studentId: string, paymentId: string, file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, `receipts/${studentId}/${paymentId}`)
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    
    // Update the payment with the receipt URL
    await updateDoc(doc(db, "fees", paymentId), {
      receiptUrl: downloadURL,
      updatedAt: new Date().toISOString()
    })
    
    return downloadURL
  } catch (error) {
    console.error("Error uploading receipt:", error)
    throw error
  }
}

/**
 * Process bulk payment uploads
 */
export const processBulkPayments = async (
  payments: Array<{
    studentId: string
    category: string
    amount: number
    method: string
    date: string
  }>,
  defaultStatus: "pending" | "verified" = "verified"
): Promise<BulkUploadResult> => {
  const result: BulkUploadResult = {
    totalProcessed: payments.length,
    successful: 0,
    failed: 0,
    errors: []
  }
  
  try {
    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i]
      try {
        // Get student name from students collection
        const studentQuery = query(
          collection(db, "students"),
          where("indexNumber", "==", payment.studentId)
        )
        const studentSnapshot = await getDocs(studentQuery)
        
        if (studentSnapshot.empty) {
          result.failed++
          result.errors.push({
            row: i + 1,
            error: `Student with ID ${payment.studentId} not found`
          })
          continue
        }
        
        const student = studentSnapshot.docs[0].data()
        const studentName = `${student.surname} ${student.otherNames}`
        
        // Add the payment
        const paymentData: Omit<Payment, "id" | "createdAt" | "updatedAt"> = {
          studentId: payment.studentId,
          studentName,
          category: payment.category as any,
          amount: payment.amount,
          method: payment.method as any,
          date: payment.date,
          status: defaultStatus
        }
        
        if (defaultStatus === "verified") {
          paymentData.verifiedBy = "System (Bulk Upload)"
          paymentData.verifiedAt = new Date().toISOString()
        }
        
        const paymentId = await addPayment(paymentData)
        
        // If verified, update the student's fee account
        if (defaultStatus === "verified") {
          await updateStudentFeeAccount(payment.studentId, {
            id: paymentId,
            ...paymentData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as Payment)
        }
        
        result.successful++
      } catch (error) {
        console.error(`Error processing payment at row ${i + 1}:`, error)
        result.failed++
        result.errors.push({
          row: i + 1,
          error: `Failed to process: ${(error as Error).message}`
        })
      }
    }
    
    return result
  } catch (error) {
    console.error("Error in bulk processing:", error)
    throw error
  }
}

/**
 * Get fee statistics
 */
export const getFeeStatistics = async (academicYear: string = "2024/2025"): Promise<{
  totalCollected: number
  pendingVerification: number
  overdueAccounts: number
  categoryBreakdown: {
    tuition: number
    hostel: number
    library: number
    other: number
  }
}> => {
  try {
    // Get all verified payments
    const verifiedPaymentsQuery = query(
      collection(db, "fees"),
      where("status", "==", "verified")
    )
    const verifiedPaymentsSnapshot = await getDocs(verifiedPaymentsQuery)
    const verifiedPayments = verifiedPaymentsSnapshot.docs.map(doc => doc.data() as Payment)
    
    // Get all pending payments
    const pendingPaymentsQuery = query(
      collection(db, "fees"),
      where("status", "==", "pending")
    )
    const pendingPaymentsSnapshot = await getDocs(pendingPaymentsQuery)
    const pendingPayments = pendingPaymentsSnapshot.docs.map(doc => doc.data() as Payment)
    
    // Get overdue accounts
    const overdueAccountsQuery = query(
      collection(db, "feeAccounts"),
      where("status", "==", "overdue")
    )
    const overdueAccountsSnapshot = await getDocs(overdueAccountsQuery)
    
    // Calculate totals
    const totalCollected = verifiedPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const pendingVerification = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0)
    
    // Calculate category breakdown
    const categoryBreakdown = {
      tuition: verifiedPayments
        .filter(payment => payment.category === "Tuition")
        .reduce((sum, payment) => sum + payment.amount, 0),
      hostel: verifiedPayments
        .filter(payment => payment.category === "Hostel")
        .reduce((sum, payment) => sum + payment.amount, 0),
      library: verifiedPayments
        .filter(payment => payment.category === "Library")
        .reduce((sum, payment) => sum + payment.amount, 0),
      other: verifiedPayments
        .filter(payment => payment.category === "Other")
        .reduce((sum, payment) => sum + payment.amount, 0)
    }
    
    return {
      totalCollected,
      pendingVerification,
      overdueAccounts: overdueAccountsSnapshot.size,
      categoryBreakdown
    }
  } catch (error) {
    console.error("Error getting fee statistics:", error)
    throw error
  }
}

/**
 * Sync student data from student-registrations collection to admin-students collection
 * This function is more comprehensive and handles different data formats
 */
export const syncModuleData = async (): Promise<{ 
  success: boolean; 
  message: string;
  registrationsProcessed: number;
  studentsCreated: number;
  errors: string[] 
}> => {
  try {
    console.log("Starting module data sync...");
    
    const result = {
      success: false,
      message: "",
      registrationsProcessed: 0,
      studentsCreated: 0,
      errors: [] as string[]
    };

    // 1. First sync student registrations to students collection
    const registrationResult = await syncRegistrations();
    result.registrationsProcessed = registrationResult.processed;
    result.studentsCreated = registrationResult.created;
    result.errors = [...result.errors, ...registrationResult.errors];
    
    // Update status based on registration sync results
    result.success = registrationResult.success;
    result.message = `Synced ${result.studentsCreated} student records from ${result.registrationsProcessed} registrations.`;
    
    return result;
  } catch (error) {
    console.error("Error in syncModuleData:", error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      registrationsProcessed: 0,
      studentsCreated: 0,
      errors: [(error instanceof Error) ? error.message : String(error)]
    };
  }
};

/**
 * Synchronize student registrations from student-registrations collection to students collection
 * for better access in the administration module
 */
export const syncRegistrations = async (): Promise<{ 
  success: boolean; 
  processed: number;
  created: number;
  updated: number;
  errors: string[] 
}> => {
  try {
    console.log("Starting student registrations sync...");
    
    const result = {
      success: false,
      processed: 0,
      created: 0,
      updated: 0,
      errors: [] as string[]
    };
    
    // Get student registrations
    const registrationsRef = collection(db, "student-registrations");
    const registrationsSnapshot = await getDocs(registrationsRef);
    result.processed = registrationsSnapshot.size;
    
    if (registrationsSnapshot.empty) {
      console.log("No student registrations found");
      result.success = true;
      return result;
    }
    
    console.log(`Found ${registrationsSnapshot.size} student registrations to process`);
    
    // Use batches for efficient Firestore operations
    let batch = writeBatch(db);
    let operationCount = 0;
    const batchLimit = 500; // Firestore batch limit is 500
    
    for (const docSnapshot of registrationsSnapshot.docs) {
      try {
        const registrationData = docSnapshot.data();
        const registrationId = docSnapshot.id;
        
        // Extract the student ID or index number
        const studentId = registrationData.studentId || registrationData.id || registrationId;
        const indexNumber = registrationData.studentIndexNumber || 
                           registrationData.indexNumber || 
                           registrationData.regNumber ||
                           registrationData.registrationId;
        
        if (!indexNumber) {
          result.errors.push(`Registration ${registrationId}: Missing index number`);
          continue;
        }
        
        // Map the registration data to a standard student object
        const studentData: Partial<Student> = {
          indexNumber: indexNumber,
          surname: registrationData.surname || "",
          otherNames: registrationData.otherNames || registrationData.firstName || registrationData.givenNames || "",
          gender: registrationData.gender || "",
          dateOfBirth: registrationData.dateOfBirth || "",
          nationality: registrationData.nationality || "Ghanaian",
          programme: registrationData.programme || registrationData.program || "",
          level: registrationData.level || registrationData.currentLevel || "100",
          entryQualification: registrationData.entryQualification || "WASSCE",
          status: registrationData.status || "Active",
          scheduleType: registrationData.scheduleType || "Regular",
          email: registrationData.email || "",
          phone: registrationData.phone || registrationData.mobileNumber || registrationData.mobile || "",
          address: typeof registrationData.address === "object" ? registrationData.address : {
            street: registrationData.street || "",
            city: registrationData.city || registrationData.town || "",
            country: registrationData.country || "Ghana"
          },
          emergencyContact: {
            name: registrationData.emergencyContactName || "",
            phone: registrationData.emergencyContactPhone || "",
            relationship: registrationData.emergencyContactRelationship || ""
          },
          profilePictureUrl: registrationData.profilePictureUrl || registrationData.profileImage || null,
          religion: registrationData.religion || "",
          maritalStatus: registrationData.maritalStatus || "",
          nationalId: registrationData.nationalId || registrationData.nationalIdNumber || "",
          registrationDate: registrationData.registrationDate || registrationData.createdAt || new Date().toISOString(),
          yearOfEntry: registrationData.yearOfEntry || "",
          entryLevel: registrationData.entryLevel || "100",
          // Handle different guardian data formats
          ...(registrationData.guardian ? { guardian: registrationData.guardian } : {}),
          ...(registrationData.guardianDetails ? { guardianDetails: registrationData.guardianDetails } : {}),
          ...(registrationData.guardianName ? { 
            guardianName: registrationData.guardianName,
            guardianContact: registrationData.guardianContact || "",
            guardianEmail: registrationData.guardianEmail || "",
            guardianAddress: registrationData.guardianAddress || ""
          } : {}),
          createdAt: registrationData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Set the document in the students collection
        // Using indexNumber as the document ID for easy reference
        const studentDocRef = doc(db, "students", indexNumber);
        batch.set(studentDocRef, studentData, { merge: true });
        result.created++;
        
        // Commit batch if we've reached the limit
        operationCount++;
        if (operationCount >= batchLimit) {
          await batch.commit();
          batch = writeBatch(db);
          operationCount = 0;
          console.log(`Committed batch of ${batchLimit} operations`);
        }
      } catch (error) {
        const errorMessage = `Error processing registration ${docSnapshot.id}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMessage);
        result.errors.push(errorMessage);
      }
    }
    
    // Commit any remaining operations
    if (operationCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${operationCount} operations`);
    }
    
    console.log(`Sync complete: Processed ${result.processed}, Created/Updated ${result.created}, Errors: ${result.errors.length}`);
    result.success = true;
    return result;
  } catch (error) {
    console.error("Error syncing student registrations:", error);
    return {
      success: false,
      processed: 0,
      created: 0,
      updated: 0,
      errors: [(error instanceof Error) ? error.message : String(error)]
    };
  }
};

/**
 * Clear all data from specified collections for testing/reset purposes
 */
export const clearAllData = async (): Promise<{
  success: boolean;
  message: string;
  deletedCount: Record<string, number>;
}> => {
  try {
    const collections = ['admin-students', 'students'];
    const deletedCount: Record<string, number> = {};
    
    for (const collectionName of collections) {
      try {
        console.log(`Clearing collection: ${collectionName}`);
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        if (snapshot.empty) {
          deletedCount[collectionName] = 0;
          continue;
        }
        
        let count = 0;
        const batch = writeBatch(db);
        
        snapshot.forEach(doc => {
          batch.delete(doc.ref);
          count++;
        });
        
        await batch.commit();
        deletedCount[collectionName] = count;
        console.log(`Deleted ${count} documents from ${collectionName}`);
      } catch (error) {
        console.error(`Error clearing collection ${collectionName}:`, error);
      }
    }
    
    return {
      success: true,
      message: "Database cleared successfully",
      deletedCount
    };
  } catch (error) {
    console.error("Error clearing database:", error);
    return {
      success: false,
      message: `Error clearing database: ${error instanceof Error ? error.message : String(error)}`,
      deletedCount: {}
    };
  }
}; 