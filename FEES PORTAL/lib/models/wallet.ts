// Student Wallet System Models
export interface StudentWallet {
  id: string
  studentId: string
  balance: number // Current wallet balance in pesewas
  currency: string // GHS, NGN, etc.
  status: 'active' | 'suspended' | 'closed'
  createdAt: string
  updatedAt: string
  lastTransactionDate?: string
}

export interface WalletTransaction {
  id: string
  walletId: string
  studentId: string
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'fee_deduction'
  amount: number // Amount in pesewas
  currency: string
  description: string
  reference: string // Paystack reference or internal reference
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  paymentMethod?: 'paystack' | 'wallet' | 'manual' | 'refund'
  paystackData?: {
    reference: string
    transactionId: string
    channel: string
    gateway_response: string
    paid_at: string
  }
  metadata?: {
    feeType?: string
    academicYear?: string
    semester?: string
    services?: string[]
    [key: string]: any
  }
  createdAt: string
  updatedAt: string
}

export interface WalletPaymentRequest {
  id: string
  studentId: string
  amount: number
  currency: string
  description: string
  paystackReference?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  completedAt?: string
}

// Wallet balance summary for quick access
export interface WalletSummary {
  studentId: string
  currentBalance: number
  totalDeposits: number
  totalWithdrawals: number
  totalPayments: number
  lastTransactionDate?: string
  currency: string
}

