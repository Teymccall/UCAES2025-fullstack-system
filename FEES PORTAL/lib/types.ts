export interface FeesData {
  studentId: string
  totalTuition: number
  paidAmount: number
  outstandingBalance: number
  status: "paid" | "partial" | "overdue"
  dueDate: string
  categories: PaymentCategory[]
  feeItems: FeeItem[]
}

export interface PaymentCategory {
  name: string
  description: string
  balance: number
}

export interface FeeItem {
  id: string
  name: string
  type: "Mandatory" | "Service"
  bill: number
  paid: number
  balance: number
  paymentAmount?: number
  status: "Paid" | "Not Paid"
}

export interface PaymentRecord {
  id: string
  studentId: string
  studentName: string
  date: string
  category: string
  amount: number
  method: "bank" | "momo" | "card" | "cash"
  status: "draft" | "submitted" | "under_review" | "verified" | "rejected" | "refunded"
  reference: string
  receiptUrl?: string
  notes?: string
  submittedAt?: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
  paymentConfirmation?: string
  processingFee?: number
  verificationSteps?: PaymentVerificationStep[]
  // Additional fields for Firebase compatibility
  description?: string
  paymentMethod?: string
  paymentPeriod?: string
  paymentFor?: string[]
  manualEntry?: boolean
  // Fields from manual payment verification
  bankName?: string
  bankReceiptNumber?: string
  tellerName?: string
  branch?: string
  ghanaCardNumber?: string
  paymentTime?: string
  academicYear?: string
  semester?: string
  verifiedBy?: string
}

export interface PaymentVerificationStep {
  id: string
  step: "document_check" | "amount_verification" | "reference_validation" | "final_approval"
  status: "pending" | "completed" | "failed"
  completedAt?: string
  completedBy?: string
  notes?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: "student" | "admin"
  studentId?: string
  passportPhotoUrl?: string
  profilePictureUrl?: string
  programme?: string
  currentLevel?: string
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  timestamp: string
  details: string
}

export interface PaymentDraft {
  studentId: string
  category: string
  amount: number
  method: "bank" | "momo" | "card" | "cash"
  reference: string
  notes?: string
  createdAt: string
  lastModified: string
  expiresAt: string
}

export interface PaymentPlan {
  id: string
  studentId: string
  totalAmount: number
  installments: PaymentInstallment[]
  status: "active" | "completed" | "cancelled" | "overdue"
  createdAt: string
  approvedBy?: string
}

export interface PaymentInstallment {
  id: string
  planId: string
  amount: number
  dueDate: string
  status: "pending" | "paid" | "overdue" | "waived"
  paidAt?: string
  paidAmount?: number
  paymentReference?: string
}

export interface PaymentAnalytics {
  totalPaid: number
  totalOutstanding: number
  paymentsThisMonth: number
  averagePaymentTime: number
  paymentMethods: { method: string; count: number; total: number }[]
  monthlyTrends: { month: string; amount: number }[]
}
