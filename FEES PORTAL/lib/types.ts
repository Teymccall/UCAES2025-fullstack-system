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
  method: "bank" | "momo"
  status: "pending" | "verified" | "rejected"
  reference: string
  receiptUrl?: string
  notes?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: "student" | "admin"
  studentId?: string
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
  method: "bank" | "momo"
  reference: string
  notes?: string
}
