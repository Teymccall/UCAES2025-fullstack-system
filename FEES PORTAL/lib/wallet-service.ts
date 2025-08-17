import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  writeBatch, 
  deleteDoc,
  runTransaction,
  addDoc
} from 'firebase/firestore'
import { db } from './firebase'
import type { StudentWallet, WalletTransaction, WalletPaymentRequest, WalletSummary } from './models/wallet'

export class WalletService {
  private static instance: WalletService

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService()
    }
    return WalletService.instance
  }

  /**
   * Get or create student wallet
   */
  async getStudentWallet(studentId: string): Promise<StudentWallet> {
    try {
      console.log(`Getting wallet for student: ${studentId}`);
      
      // Check if wallet exists
      const walletQuery = query(
        collection(db, 'student-wallets'),
        where('studentId', '==', studentId),
        limit(1)
      )
      
      const walletSnapshot = await getDocs(walletQuery)
      
      if (!walletSnapshot.empty) {
        const walletDoc = walletSnapshot.docs[0]
        const wallet = {
          id: walletDoc.id,
          ...walletDoc.data()
        } as StudentWallet
        console.log(`Found existing wallet: ${wallet.id} with balance ¢${wallet.balance / 100}`);
        return wallet
      }

      // Create new wallet if it doesn't exist
      console.log(`Creating new wallet for student: ${studentId}`);
      const newWallet: Omit<StudentWallet, 'id'> = {
        studentId,
        balance: 0,
        currency: 'GHS',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const walletRef = await addDoc(collection(db, 'student-wallets'), newWallet)
      console.log(`Created new wallet: ${walletRef.id}`);
      
      return {
        id: walletRef.id,
        ...newWallet
      }
    } catch (error) {
      console.error('Error getting student wallet:', error)
      throw new Error('Failed to get student wallet')
    }
  }

  /**
   * Get wallet summary with transaction totals
   */
  async getWalletSummary(studentId: string): Promise<WalletSummary> {
    try {
      const wallet = await this.getStudentWallet(studentId)
      
      // Get transaction totals
      const transactionsQuery = query(
        collection(db, 'wallet-transactions'),
        where('studentId', '==', studentId),
        where('status', '==', 'completed')
      )
      
      const transactionsSnapshot = await getDocs(transactionsQuery)
      const transactions = transactionsSnapshot.docs.map(doc => doc.data() as WalletTransaction)

      let totalDeposits = 0
      let totalWithdrawals = 0
      let totalPayments = 0
      let lastTransactionDate: string | undefined

      transactions.forEach(transaction => {
        if (transaction.type === 'deposit') {
          totalDeposits += transaction.amount
        } else if (transaction.type === 'withdrawal') {
          totalWithdrawals += transaction.amount
        } else if (transaction.type === 'payment' || transaction.type === 'fee_deduction') {
          totalPayments += transaction.amount
        }

        if (!lastTransactionDate || transaction.createdAt > lastTransactionDate) {
          lastTransactionDate = transaction.createdAt
        }
      })

      return {
        studentId,
        currentBalance: wallet.balance,
        totalDeposits,
        totalWithdrawals,
        totalPayments,
        lastTransactionDate,
        currency: wallet.currency
      }
    } catch (error) {
      console.error('Error getting wallet summary:', error)
      throw new Error('Failed to get wallet summary')
    }
  }

  /**
   * Get wallet transaction history
   */
  async getWalletTransactions(studentId: string, limitCount: number = 50): Promise<WalletTransaction[]> {
    try {
      const transactionsQuery = query(
        collection(db, 'wallet-transactions'),
        where('studentId', '==', studentId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      
      const transactionsSnapshot = await getDocs(transactionsQuery)
      
      return transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WalletTransaction[]
    } catch (error) {
      console.error('Error getting wallet transactions:', error)
      throw new Error('Failed to get wallet transactions')
    }
  }

  /**
   * Create wallet deposit transaction
   */
  async createDepositTransaction(
    studentId: string,
    amount: number,
    paystackReference: string,
    paystackData: any
  ): Promise<WalletTransaction> {
    try {
      console.log(`Creating deposit transaction for student: ${studentId}, amount: ¢${amount / 100}`);
      
      const wallet = await this.getStudentWallet(studentId)
      console.log(`Current wallet balance: ¢${wallet.balance / 100}`);
      
      // Create transaction record
      const transaction: Omit<WalletTransaction, 'id'> = {
        walletId: wallet.id,
        studentId,
        type: 'deposit',
        amount,
        currency: wallet.currency,
        description: `Wallet deposit via Paystack`,
        reference: paystackReference,
        status: 'completed',
        paymentMethod: 'paystack',
        paystackData: {
          reference: paystackReference,
          transactionId: paystackData.id || paystackReference,
          channel: paystackData.channel || 'card',
          gateway_response: paystackData.gateway_response || 'Successful',
          paid_at: paystackData.paid_at || new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      console.log(`Adding transaction to database...`);
      const transactionRef = await addDoc(collection(db, 'wallet-transactions'), transaction)
      console.log(`Transaction added with ID: ${transactionRef.id}`);

      // Update wallet balance
      const newBalance = wallet.balance + amount
      console.log(`Updating wallet balance from ¢${wallet.balance / 100} to ¢${newBalance / 100}`);
      
      await updateDoc(doc(db, 'student-wallets', wallet.id), {
        balance: newBalance,
        updatedAt: new Date().toISOString(),
        lastTransactionDate: new Date().toISOString()
      })
      console.log(`Wallet balance updated successfully`);

      return {
        id: transactionRef.id,
        ...transaction
      }
    } catch (error) {
      console.error('Error creating deposit transaction:', error)
      throw new Error('Failed to create deposit transaction')
    }
  }

  /**
   * Create wallet payment transaction (deduct from wallet)
   */
  async createPaymentTransaction(
    studentId: string,
    amount: number,
    description: string,
    metadata?: any
  ): Promise<WalletTransaction> {
    try {
      const wallet = await this.getStudentWallet(studentId)
      
      // Check if sufficient balance
      if (wallet.balance < amount) {
        throw new Error('Insufficient wallet balance')
      }

      // Create transaction record
      const transaction: Omit<WalletTransaction, 'id'> = {
        walletId: wallet.id,
        studentId,
        type: 'fee_deduction',
        amount,
        currency: wallet.currency,
        description,
        reference: `WALLET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'completed',
        paymentMethod: 'wallet',
        metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const transactionRef = await addDoc(collection(db, 'wallet-transactions'), transaction)

      // Update wallet balance
      const newBalance = wallet.balance - amount
      await updateDoc(doc(db, 'student-wallets', wallet.id), {
        balance: newBalance,
        updatedAt: new Date().toISOString(),
        lastTransactionDate: new Date().toISOString()
      })

      return {
        id: transactionRef.id,
        ...transaction
      }
    } catch (error) {
      console.error('Error creating payment transaction:', error)
      throw new Error('Failed to create payment transaction')
    }
  }

  /**
   * Process Paystack payment to wallet
   * SIMPLIFIED VERSION: Removes complex locking to fix deposit failures
   */
  async processPaystackPayment(
    studentId: string,
    paystackReference: string,
    paystackData: any
  ): Promise<WalletTransaction> {
    try {
      console.log(`Processing Paystack payment: ${paystackReference} for student: ${studentId}`);
      
      // STEP 1: Check for existing completed transactions with this reference
      const existingQuery = query(
        collection(db, 'wallet-transactions'),
        where('reference', '==', paystackReference),
        where('status', '==', 'completed'),
        limit(1)
      )
      
      const existingSnapshot = await getDocs(existingQuery)
      if (!existingSnapshot.empty) {
        console.log(`Payment already processed: ${paystackReference} - PREVENTING DUPLICATE`);
        const existingTransaction = existingSnapshot.docs[0].data();
        return {
          id: existingSnapshot.docs[0].id,
          ...existingTransaction
        } as WalletTransaction;
      }

      // STEP 2: Create the deposit transaction
      const amount = paystackData.amount || 0;
      console.log(`Creating deposit transaction for amount: ¢${amount / 100}`);
      
      const transaction = await this.createDepositTransaction(studentId, amount, paystackReference, paystackData);
      console.log(`Deposit transaction created successfully: ${transaction.id}`);
      
      return transaction;
    } catch (error) {
      console.error('Error processing Paystack payment:', error);
      throw new Error(`Failed to process Paystack payment: ${error.message}`);
    }
  }

  /**
   * Check if student has sufficient wallet balance
   */
  async hasSufficientBalance(studentId: string, amount: number): Promise<boolean> {
    try {
      const wallet = await this.getStudentWallet(studentId)
      return wallet.balance >= amount
    } catch (error) {
      console.error('Error checking wallet balance:', error)
      return false
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(studentId: string): Promise<number> {
    try {
      const wallet = await this.getStudentWallet(studentId)
      return wallet.balance
    } catch (error) {
      console.error('Error getting wallet balance:', error)
      return 0
    }
  }

  /**
   * Process service payment from wallet
   */
  async processServicePayment(
    studentId: string,
    amount: number,
    services: Array<{
      serviceId: string
      serviceName: string
      quantity: number
      amount: number
      total: number
    }>,
    description?: string
  ): Promise<boolean> {
    try {
      console.log(`Processing service payment for student ${studentId}: ¢${amount / 100}`)
      
      // Check if student has sufficient balance
      const hasBalance = await this.hasSufficientBalance(studentId, amount)
      if (!hasBalance) {
        console.log(`Insufficient balance for student ${studentId}`)
        return false
      }

      // Get wallet first to ensure we have the correct wallet ID
      const wallet = await this.getStudentWallet(studentId)
      const walletRef = doc(db, 'student-wallets', wallet.id)
      
      // Create transaction reference
      const transactionRef = `SR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Create wallet transaction
      const walletTransaction: Omit<WalletTransaction, 'id'> = {
        walletId: wallet.id,
        studentId,
        type: 'payment',
        amount: amount,
        currency: 'GHS',
        description: description || `Service payment: ${services.map(s => s.serviceName).join(', ')}`,
        reference: transactionRef,
        status: 'completed',
        paymentMethod: 'wallet',
        metadata: {
          services: services.map(s => s.serviceId),
          serviceNames: services.map(s => s.serviceName),
          feeType: 'service_payment',
          academicYear: new Date().getFullYear().toString(),
          semester: 'First Semester'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Use transaction to ensure atomicity
      const result = await runTransaction(db, async (firestoreTransaction) => {
        // Get current wallet
        const walletDoc = await firestoreTransaction.get(walletRef)
        if (!walletDoc.exists()) {
          throw new Error('Wallet not found')
        }

        const walletData = walletDoc.data() as StudentWallet
        if (walletData.balance < amount) {
          throw new Error('Insufficient balance')
        }

        // Update wallet balance
        firestoreTransaction.update(walletRef, {
          balance: walletData.balance - amount,
          updatedAt: new Date().toISOString(),
          lastTransactionDate: new Date().toISOString()
        })

        // Add transaction record
        const transactionDocRef = doc(collection(db, 'wallet-transactions'))
        firestoreTransaction.set(transactionDocRef, walletTransaction)

        return true
      })

      console.log(`Service payment processed successfully for student ${studentId}`)
      return result

    } catch (error) {
      console.error('Error processing service payment:', error)
      return false
    }
  }

  /**
   * Process Paystack service payment (for tracking)
   */
  async processPaystackServicePayment(
    studentId: string,
    amount: number,
    paystackReference: string,
    paystackData: any,
    services: Array<{
      serviceId: string
      serviceName: string
      quantity: number
      amount: number
      total: number
    }>
  ): Promise<boolean> {
    try {
      console.log(`Processing Paystack service payment for student ${studentId}: ¢${amount / 100}`)
      
      // Create transaction reference
      const transactionRef = `SR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Create wallet transaction (for tracking only, no balance deduction)
      const transaction: Omit<WalletTransaction, 'id'> = {
        walletId: studentId,
        studentId,
        type: 'payment',
        amount: amount,
        currency: 'GHS',
        description: `Service payment: ${services.map(s => s.serviceName).join(', ')}`,
        reference: transactionRef,
        status: 'completed',
        paymentMethod: 'paystack',
        paystackData: {
          reference: paystackReference,
          transactionId: paystackData.id,
          channel: paystackData.channel,
          gateway_response: paystackData.gateway_response,
          paid_at: paystackData.paid_at
        },
        metadata: {
          services: services.map(s => s.serviceId),
          serviceNames: services.map(s => s.serviceName),
          feeType: 'service_payment',
          academicYear: new Date().getFullYear().toString(),
          semester: 'First Semester'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Add transaction record
      const transactionDocRef = doc(collection(db, 'wallet-transactions'))
      await setDoc(transactionDocRef, transaction)

      console.log(`Paystack service payment processed successfully for student ${studentId}`)
      return true

    } catch (error) {
      console.error('Error processing Paystack service payment:', error)
      return false
    }
  }
}

// Export singleton instance
export const walletService = WalletService.getInstance()
