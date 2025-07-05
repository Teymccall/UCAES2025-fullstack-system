// Firebase configuration and functions
// This would typically connect to your Firebase project

import type { FeesData, PaymentRecord, FeeItem } from "./types"

// Mock fee items data
const mockFeeItems: FeeItem[] = [
  {
    id: "1",
    name: "AMNESTY STUDENT FEE - UNDERGRADUATE",
    type: "Service",
    bill: 2487.5,
    paid: 0,
    balance: 2487.5,
    paymentAmount: 0,
    status: "Not Paid",
  },
  {
    id: "2",
    name: "Verification of student's certificate (normal) - Express",
    type: "Service",
    bill: 40,
    paid: 0,
    balance: 40,
    paymentAmount: 0,
    status: "Not Paid",
  },
  {
    id: "3",
    name: "FACILITY SUBSIDY FEE UNDERGRADUATE REGULAR",
    type: "Mandatory",
    bill: 4396,
    paid: 4396,
    balance: 0,
    paymentAmount: 0,
    status: "Paid",
  },
]

// Mock data for demonstration
const mockFeesData: FeesData = {
  studentId: "AG/2021/001234",
  totalTuition: 5000,
  paidAmount: 4396,
  outstandingBalance: 2527.5,
  status: "partial",
  dueDate: "2025-06-01",
  categories: [
    {
      name: "Tuition",
      description: "Academic fees for courses",
      balance: 1500,
    },
    {
      name: "Hostel",
      description: "Accommodation fees",
      balance: 500,
    },
    {
      name: "Library",
      description: "Library fines and fees",
      balance: 0,
    },
    {
      name: "Other",
      description: "Miscellaneous fees",
      balance: 527.5,
    },
  ],
  feeItems: mockFeeItems,
}

const mockPaymentHistory: PaymentRecord[] = [
  {
    id: "1",
    studentId: "AG/2021/001234",
    studentName: "John Doe",
    date: "2025-01-15",
    category: "tuition",
    amount: 1500,
    method: "bank",
    status: "verified",
    reference: "TXN123456789",
    receiptUrl: "/receipts/receipt1.pdf",
    notes: "Semester 1 payment",
  },
  {
    id: "2",
    studentId: "AG/2021/001234",
    studentName: "John Doe",
    date: "2025-01-10",
    category: "hostel",
    amount: 800,
    method: "momo",
    status: "verified",
    reference: "MM987654321",
    receiptUrl: "/receipts/receipt2.pdf",
  },
  {
    id: "3",
    studentId: "AG/2021/001234",
    studentName: "John Doe",
    date: "2025-01-20",
    category: "tuition",
    amount: 700,
    method: "bank",
    status: "pending",
    reference: "TXN555666777",
    receiptUrl: "/receipts/receipt3.pdf",
    notes: "Partial payment for remaining balance",
  },
]

// Simulated Firebase functions
export async function getStudentFees(studentId: string): Promise<FeesData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return mockFeesData
}

export async function getPaymentHistory(studentId: string): Promise<PaymentRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return mockPaymentHistory
}

export async function submitPayment(paymentData: any): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  console.log("Payment submitted:", paymentData)
  // In real implementation, this would upload to Firebase Storage and create payment record
}

export async function saveDraftPayment(studentId: string, draftData: any): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1500))
  console.log(`Draft payment saved for student ${studentId}:`, draftData)
  // In real implementation, this would save the draft data to Firestore
}

export async function getDraftPayment(studentId: string): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log(`Fetching draft payment for student ${studentId}`)
  // In real implementation, this would retrieve the draft data from Firestore
  return {
    amount: 500,
    method: "momo",
    category: "tuition",
  } // Mock draft data
}

// Initialize Firebase (mock)
export const initializeFirebase = () => {
  console.log("Firebase initialized (mock)")
  // In real implementation:
  // import { initializeApp } from 'firebase/app'
  // import { getFirestore } from 'firebase/firestore'
  // import { getStorage } from 'firebase/storage'
  // import { getAuth } from 'firebase/auth'
}
