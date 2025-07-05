import { collection, doc, getDocs, getDoc, addDoc, updateDoc, query, where, orderBy, deleteDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "./firebase"
import type { Payment, FeeAccount, BulkUploadResult } from "./types"

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
 * Clear all Firebase collections (database reset)
 * This will delete all data from specified collections
 */
export const clearAllData = async (): Promise<{ success: boolean, message: string, deletedCount: Record<string, number> }> => {
  try {
    // Add more collections to ensure all data is cleared
    const collections = [
      "students", 
      "courses", 
      "programs", 
      "users", 
      "fees", 
      "feeAccounts",
      "registrations", 
      "grades",
      "academic-years",
      "semesters",
      "attendance",
      "course-assignments",
      "program-courses",
      "student-programs",
      "staff",
      "course-registrations",
      "announcements",
      "departments",
      "faculties",
      "results",
      "notifications",
      "payments",
      "payment-history",
      "academic-records"
    ];
    
    const deletedCount: Record<string, number> = {};
    let totalDeleted = 0;
    
    // Delete documents from each collection
    for (const collectionName of collections) {
      try {
        console.log(`Attempting to clear collection: ${collectionName}`);
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        if (!snapshot.empty) {
          deletedCount[collectionName] = snapshot.size;
          totalDeleted += snapshot.size;
          
          // Delete each document
          for (const document of snapshot.docs) {
            try {
              await deleteDoc(doc(db, collectionName, document.id));
            } catch (docError) {
              console.error(`Error deleting document ${document.id} in ${collectionName}:`, docError);
            }
          }
          
          console.log(`Deleted ${snapshot.size} documents from ${collectionName}`);
        } else {
          deletedCount[collectionName] = 0;
          console.log(`Collection ${collectionName} is empty or does not exist`);
        }
      } catch (collectionError) {
        console.error(`Error processing collection ${collectionName}:`, collectionError);
        deletedCount[collectionName] = 0;
      }
    }
    
    return {
      success: true,
      message: `Successfully cleared all data. Deleted ${totalDeleted} documents across ${collections.length} collections.`,
      deletedCount
    };
  } catch (error) {
    console.error("Error clearing database:", error);
    return {
      success: false,
      message: `Error clearing database: ${error instanceof Error ? error.message : "Unknown error"}`,
      deletedCount: {}
    };
  }
}

/**
 * Sync data between modules after reset
 */
export const syncModuleData = async (): Promise<{ success: boolean, message: string }> => {
  try {
    // 1. Get initial data
    const initialData = {
      programs: [
        { code: "BESM", name: "B.Sc. Environmental Science and Management", faculty: "Environmental Studies" },
        { code: "BSA", name: "B.Sc. Sustainable Agriculture", faculty: "Agricultural Sciences" },
        { code: "BLE", name: "B.Sc. Land Economy", faculty: "Environmental Studies" }
      ],
      academicYears: [
        { id: "2024-2025", name: "2024/2025", current: true },
        { id: "2023-2024", name: "2023/2024", current: false }
      ],
      semesters: [
        { id: "first", name: "First Semester", current: true },
        { id: "second", name: "Second Semester", current: false }
      ],
      // Add default courses for each program
      courses: [
        // Environmental Science courses
        { 
          code: "BESM101", 
          title: "Introduction to Environmental Science", 
          creditHours: 3,
          semester: "First",
          level: "100",
          department: "Environmental Science",
          program: "BESM",
          description: "An introduction to the fundamentals of environmental science and sustainability.",
          lecturer: "Dr. Francis Nyame",
          status: "Active",
          prerequisites: []
        },
        { 
          code: "BESM102", 
          title: "Environmental Chemistry", 
          creditHours: 3,
          semester: "First",
          level: "100",
          department: "Environmental Science",
          program: "BESM",
          description: "Study of chemical processes in the environment and their impact on ecosystems.",
          lecturer: "Dr. Rebecca Ansah",
          status: "Active",
          prerequisites: []
        },
        { 
          code: "BESM201", 
          title: "Ecology and Biodiversity", 
          creditHours: 3,
          semester: "First",
          level: "200",
          department: "Environmental Science",
          program: "BESM",
          description: "Study of ecosystems, biodiversity and conservation practices.",
          lecturer: "Dr. Samuel Owusu",
          status: "Active",
          prerequisites: ["BESM101"]
        },
        // Agriculture courses
        { 
          code: "BSA101", 
          title: "Introduction to Sustainable Agriculture", 
          creditHours: 3,
          semester: "First",
          level: "100",
          department: "Agriculture",
          program: "BSA",
          description: "Overview of sustainable agricultural principles and practices.",
          lecturer: "Prof. Joseph Mensah",
          status: "Active",
          prerequisites: []
        },
        { 
          code: "BSA102", 
          title: "Soil Science", 
          creditHours: 3,
          semester: "First",
          level: "100",
          department: "Agriculture",
          program: "BSA",
          description: "Study of soil properties, classification, and management for sustainable agriculture.",
          lecturer: "Dr. Emmanuel Boadu",
          status: "Active",
          prerequisites: []
        },
        // Land Economy courses
        { 
          code: "BLE101", 
          title: "Principles of Land Economy", 
          creditHours: 3,
          semester: "First",
          level: "100",
          department: "Land Economy",
          program: "BLE",
          description: "Introduction to land management, valuation, and economics.",
          lecturer: "Dr. Victoria Addo",
          status: "Active",
          prerequisites: []
        }
      ]
    };

    // 2. Create programs collection
    for (const program of initialData.programs) {
      await addDoc(collection(db, "programs"), {
        ...program,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // 3. Create academic years
    for (const year of initialData.academicYears) {
      await addDoc(collection(db, "academic-years"), {
        ...year,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // 4. Create semesters
    for (const semester of initialData.semesters) {
      await addDoc(collection(db, "semesters"), {
        ...semester,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // 5. Create default courses
    for (const course of initialData.courses) {
      await addDoc(collection(db, "courses"), {
        ...course,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // 6. Create program-course mappings
    for (const course of initialData.courses) {
      await addDoc(collection(db, "program-courses"), {
        programCode: course.program,
        courseCode: course.code,
        level: course.level,
        semester: course.semester,
        required: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return {
      success: true,
      message: "Successfully synchronized data between modules with initial values."
    };
  } catch (error) {
    console.error("Error syncing module data:", error);
    return {
      success: false,
      message: `Error syncing module data: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
} 