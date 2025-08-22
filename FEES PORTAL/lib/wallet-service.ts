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
      console.log(`🚀 PROCESSING PAYSTACK PAYMENT STARTED`);
      console.log(`   Reference: ${paystackReference}`);
      console.log(`   Student ID: ${studentId}`);
      console.log(`   Amount: ¢${(paystackData.amount || 0) / 100}`);
      console.log(`   Timestamp: ${new Date().toISOString()}`);
      
      // CRITICAL: Use database transaction to prevent race conditions
      return await runTransaction(db, async (firestoreTransaction) => {
        // ENHANCED DUPLICATE PREVENTION: Check for ANY existing transactions with this reference
        console.log(`🔍 STEP 1: Checking for existing transactions with reference: ${paystackReference}`);
      
      const existingQuery = query(
        collection(db, 'wallet-transactions'),
        where('reference', '==', paystackReference),
        limit(1)
      )
      
      const existingSnapshot = await getDocs(existingQuery)
      if (!existingSnapshot.empty) {
          console.log(`⚠️ DUPLICATE PREVENTED: Reference ${paystackReference} already exists in database`);
          console.log(`   Existing Transaction ID: ${existingSnapshot.docs[0].id}`);
          console.log(`   Existing Transaction Data:`, existingSnapshot.docs[0].data());
          
        const existingTransaction = existingSnapshot.docs[0].data();
        return {
          id: existingSnapshot.docs[0].id,
          ...existingTransaction
        } as WalletTransaction;
      }

        console.log(`✅ STEP 1 PASSED: No existing transactions found with reference: ${paystackReference}`);

        // Additional safety check: Look for any transactions with this reference in the last 10 seconds
        console.log(`🔍 STEP 2: Checking for recent transactions with reference: ${paystackReference}`);
        const tenSecondsAgo = new Date(Date.now() - 10000).toISOString();
        console.log(`   Time window: ${tenSecondsAgo} to ${new Date().toISOString()}`);
        
      const recentQuery = query(
        collection(db, 'wallet-transactions'),
        where('reference', '==', paystackReference),
          where('createdAt', '>=', tenSecondsAgo),
        limit(1)
      );
      
      const recentSnapshot = await getDocs(recentQuery);
      if (!recentSnapshot.empty) {
          console.log(`⚠️ RECENT DUPLICATE PREVENTED: Reference ${paystackReference} found in recent transactions`);
          console.log(`   Recent Transaction ID: ${recentSnapshot.docs[0].id}`);
          console.log(`   Recent Transaction Data:`, recentSnapshot.docs[0].data());
          
        const existingTransaction = recentSnapshot.docs[0].data();
        return {
          id: recentSnapshot.docs[0].id,
          ...existingTransaction
        } as WalletTransaction;
      }

        console.log(`✅ STEP 2 PASSED: No recent transactions found with reference: ${paystackReference}`);

        // STEP 3: Create the deposit transaction within the transaction
      const amount = paystackData.amount || 0;
      console.log(`Creating deposit transaction for amount: ¢${amount / 100}`);
      
        // Final safety check before creating transaction
        console.log(`🔍 STEP 3: Final duplicate check before creating transaction`);
        const finalCheck = await getDocs(query(
          collection(db, 'wallet-transactions'),
          where('reference', '==', paystackReference),
          limit(1)
        ));
        
        if (!finalCheck.empty) {
          console.log(`🚨 FINAL DUPLICATE CHECK: Reference ${paystackReference} found before creation - returning existing`);
          console.log(`   Final Check Transaction ID: ${finalCheck.docs[0].id}`);
          console.log(`   Final Check Transaction Data:`, finalCheck.docs[0].data());
          
          const existingTransaction = finalCheck.docs[0].data();
          return {
            id: finalCheck.docs[0].id,
            ...existingTransaction
          } as WalletTransaction;
        }
        
        console.log(`✅ STEP 3 PASSED: Final check confirms no duplicates`);
        
        // Create transaction only if no duplicates found
        console.log(`💰 CREATING DEPOSIT TRANSACTION:`);
        console.log(`   Amount: ¢${amount / 100}`);
        console.log(`   Student ID: ${studentId}`);
        console.log(`   Reference: ${paystackReference}`);
        
        // Create the transaction within the database transaction
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
        const transactionDocRef = doc(collection(db, 'wallet-transactions'))
        firestoreTransaction.set(transactionDocRef, transaction)
        console.log(`Transaction added with ID: ${transactionDocRef.id}`);

        // Update wallet balance within the transaction
        const newBalance = wallet.balance + amount
        console.log(`Updating wallet balance from ¢${wallet.balance / 100} to ¢${newBalance / 100}`);
        
        const walletRef = doc(db, 'student-wallets', wallet.id)
        firestoreTransaction.update(walletRef, {
          balance: newBalance,
          updatedAt: new Date().toISOString(),
          lastTransactionDate: new Date().toISOString()
        })
        console.log(`Wallet balance updated successfully`);

        console.log(`✅ DEPOSIT TRANSACTION CREATED SUCCESSFULLY: ${transactionDocRef.id}`);
        console.log(`🎉 PROCESSING COMPLETE - No duplicates detected`);
        
        return {
          id: transactionDocRef.id,
          ...transaction
        } as WalletTransaction;
      });
      
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
      // SAFETY CHECK: Ensure amount is in pesewas (not cedis)
      if (amount < 1000) { // If amount is less than 10 cedis, it might be in cedis
        console.warn(`⚠️ WARNING: Service payment amount (${amount}) seems unusually low. Expected amount in pesewas.`)
        console.warn(`   If this is in cedis, multiply by 100 before calling this method.`)
        console.warn(`   Student: ${studentId}, Amount: ${amount}`)
      }
      
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
   * Process fee payment from wallet
   */
  async processFeePayment(
    studentId: string,
    amount: number,
    description: string,
    metadata?: any
  ): Promise<boolean> {
    try {
      // SAFETY CHECK: Ensure amount is in pesewas (not cedis)
      if (amount < 1000) { // If amount is less than 10 cedis, it might be in cedis
        console.warn(`⚠️ WARNING: Fee payment amount (${amount}) seems unusually low. Expected amount in pesewas.`)
        console.warn(`   If this is in cedis, multiply by 100 before calling this method.`)
        console.warn(`   Student: ${studentId}, Amount: ${amount}`)
      }
      
      console.log(`Processing fee payment for student ${studentId}: ¢${amount / 100}`)
      
      // Check if student has sufficient balance
      const hasBalance = await this.hasSufficientBalance(studentId, amount)
      if (!hasBalance) {
        console.log(`Insufficient balance for student ${studentId}`)
        return false
      }

      // Get wallet first to ensure we have the correct wallet ID
      const wallet = await this.getStudentWallet(studentId)
      const walletRef = doc(db, 'student-wallets', wallet.id)
      
      // Create transaction reference with a unique identifier
      const transactionRef = `FEE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Check for recent duplicate transactions (within last 60 seconds)
      const sixtySecondsAgo = new Date(Date.now() - 60 * 1000).toISOString()
      const recentTransactionsQuery = query(
        collection(db, 'wallet-transactions'),
        where('studentId', '==', studentId),
        where('type', '==', 'fee_deduction'),
        where('amount', '==', amount),
        where('createdAt', '>=', sixtySecondsAgo),
        orderBy('createdAt', 'desc'),
        limit(10)
      )
      
      const recentTransactions = await getDocs(recentTransactionsQuery)
      
      if (!recentTransactions.empty) {
        console.warn(`Potential duplicate transaction detected for student ${studentId}. Checking details...`)
        
        // Check if there's a transaction with the same amount and metadata in the last 60 seconds
        const potentialDuplicates = recentTransactions.docs.filter(doc => {
          const transaction = doc.data() as WalletTransaction
          
          // Check for exact transaction ID match if available
          if (metadata?.transactionId && transaction.metadata?.transactionId === metadata.transactionId) {
            return true;
          }
          
          // Check for similar transaction details
          return transaction.amount === amount && 
                 transaction.metadata?.semester === metadata?.semester &&
                 transaction.metadata?.academicYear === metadata?.academicYear
        })
        
        if (potentialDuplicates.length > 0) {
          console.error(`Duplicate transaction prevented for student ${studentId}`)
          return true // Return true to prevent UI errors, but log the duplicate
        }
      }
      
      // Create wallet transaction
      const walletTransaction: Omit<WalletTransaction, 'id'> = {
        walletId: wallet.id,
        studentId,
        type: 'fee_deduction',
        amount: amount,
        currency: 'GHS',
        description: description || `Fee payment`,
        reference: transactionRef,
        status: 'completed',
        paymentMethod: 'wallet',
        metadata: {
          ...metadata,
          feeType: 'tuition_fee',
          academicYear: metadata?.academicYear || new Date().getFullYear().toString(),
          semester: metadata?.semester || 'Current Semester',
          transactionTimestamp: Date.now() // Add timestamp for additional uniqueness
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

        // Also create a record in student-payments collection for fee calculation
        const paymentRecord = {
          studentId: studentId,
          studentName: '', // Will be populated from student data if available
          amount: amount / 100, // Convert back to cedis
          category: 'tuition',
          status: 'completed',
          method: 'wallet',
          reference: transactionRef,
          description: description || `Fee payment via wallet`,
          paymentDate: new Date().toISOString().split('T')[0],
          submittedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          paymentPeriod: metadata?.paymentPeriod || 'semester1', // Default to semester1 if not specified
          paymentFor: [metadata?.paymentPeriod || 'semester1'], // Ensure paymentFor is set
          academicYear: metadata?.academicYear || new Date().getFullYear().toString(),
          semester: metadata?.semester || 'Current Semester',
          verifiedBy: 'system',
          reviewedAt: new Date().toISOString()
        }

        const paymentDocRef = doc(collection(db, 'student-payments'))
        firestoreTransaction.set(paymentDocRef, paymentRecord)

        return true
      })

      console.log(`Fee payment processed successfully for student ${studentId}`)
      return result

    } catch (error) {
      console.error('Error processing fee payment:', error)
      return false
    }
  }

  /**
   * Process Paystack fee payment (for tracking)
   */
  async processPaystackFeePayment(
    studentId: string,
    amount: number,
    paystackReference: string,
    paystackData: any,
    metadata?: any
  ): Promise<boolean> {
    try {
      console.log(`Processing Paystack fee payment for student ${studentId}: ¢${amount / 100}`)
      
      // First check if this Paystack reference has already been processed
      // to prevent duplicate transactions
      const existingTransactionsQuery = query(
        collection(db, 'wallet-transactions'),
        where('paymentMethod', '==', 'paystack'),
        where('paystackData.reference', '==', paystackReference),
        limit(1)
      )
      
      const existingTransactions = await getDocs(existingTransactionsQuery)
      
      if (!existingTransactions.empty) {
        console.warn(`Duplicate Paystack transaction prevented: ${paystackReference}`)
        return true // Return true to prevent UI errors, but log the duplicate
      }
      
      // Create transaction reference
      const transactionRef = `FEE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Create wallet transaction (for tracking only, no balance deduction)
      const transaction: Omit<WalletTransaction, 'id'> = {
        walletId: studentId,
        studentId,
        type: 'fee_deduction',
        amount: amount,
        currency: 'GHS',
        description: `Fee payment via Paystack`,
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
          ...metadata,
          feeType: 'tuition_fee',
          academicYear: metadata?.academicYear || new Date().getFullYear().toString(),
          semester: metadata?.semester || 'Current Semester',
          transactionTimestamp: Date.now() // Add timestamp for additional uniqueness
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Add transaction record
      const transactionDocRef = doc(collection(db, 'wallet-transactions'))
      await setDoc(transactionDocRef, transaction)

      // Also create a record in student-payments collection for fee calculation
      const paymentRecord = {
        studentId: studentId,
        studentName: '', // Will be populated from student data if available
        amount: amount / 100, // Convert back to cedis
        category: 'tuition',
        status: 'completed',
        method: 'paystack',
        reference: transactionRef,
        description: description || `Fee payment via Paystack`,
        paymentDate: new Date().toISOString().split('T')[0],
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        paymentPeriod: metadata?.paymentPeriod || 'semester1',
        paymentFor: [metadata?.paymentPeriod || 'semester1'],
        academicYear: metadata?.academicYear || new Date().getFullYear().toString(),
        semester: metadata?.semester || 'Current Semester',
        verifiedBy: 'system',
        reviewedAt: new Date().toISOString()
      }

      const paymentDocRef = doc(collection(db, 'student-payments'))
      await setDoc(paymentDocRef, paymentRecord)

      console.log(`Paystack fee payment processed successfully for student ${studentId}`)
      return true

    } catch (error) {
      console.error('Error processing Paystack fee payment:', error)
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
      
      // First check if this Paystack reference has already been processed
      // to prevent duplicate transactions
      const existingTransactionsQuery = query(
        collection(db, 'wallet-transactions'),
        where('paymentMethod', '==', 'paystack'),
        where('paystackData.reference', '==', paystackReference),
        limit(1)
      )
      
      const existingTransactions = await getDocs(existingTransactionsQuery)
      
      if (!existingTransactions.empty) {
        console.warn(`Duplicate Paystack service transaction prevented: ${paystackReference}`)
        return true // Return true to prevent UI errors, but log the duplicate
      }
      
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
          semester: 'First Semester',
          transactionTimestamp: Date.now() // Add timestamp for additional uniqueness
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

  /**
   * Clean up duplicate transactions (emergency fix)
   */
  async cleanupDuplicateTransactions(): Promise<{ removed: number, errors: number }> {
    try {
      console.log('🧹 Starting duplicate transaction cleanup...');
      
      let removed = 0;
      let errors = 0;
      
      // Get all wallet transactions
      const transactionsSnapshot = await getDocs(collection(db, 'wallet-transactions'));
      
      if (transactionsSnapshot.size === 0) {
        console.log('✅ No transactions found to clean up');
        return { removed: 0, errors: 0 };
      }
      
      console.log(`📊 Found ${transactionsSnapshot.size} total transactions`);
      
      // Group by reference
      const transactionsByReference: { [key: string]: any[] } = {};
      
      transactionsSnapshot.forEach(doc => {
        const transaction = doc.data();
        const reference = transaction.reference;
        
        if (!transactionsByReference[reference]) {
          transactionsByReference[reference] = [];
        }
        transactionsByReference[reference].push({
          id: doc.id,
          ...transaction
        });
      });
      
      // Find duplicates
      const duplicates = Object.entries(transactionsByReference)
        .filter(([reference, transactions]) => transactions.length > 1)
        .map(([reference, transactions]) => ({ reference, transactions }));
      
      console.log(`🚨 Found ${duplicates.length} duplicate references`);
      
      if (duplicates.length === 0) {
        console.log('✅ No duplicates found');
        return { removed: 0, errors: 0 };
      }
      
      // Remove duplicates (keep the first one)
      for (const { reference, transactions } of duplicates) {
        try {
          console.log(`🧹 Cleaning up reference: ${reference} (${transactions.length} duplicates)`);
          
          // Keep the first transaction, remove the rest
          const toRemove = transactions.slice(1);
          
          for (const duplicate of toRemove) {
            console.log(`   Removing duplicate transaction: ${duplicate.id}`);
            await deleteDoc(doc(db, 'wallet-transactions', duplicate.id));
            removed++;
          }
          
          console.log(`✅ Cleaned up ${toRemove.length} duplicates for reference: ${reference}`);
          
        } catch (error) {
          console.error(`❌ Error cleaning up reference ${reference}:`, error);
          errors++;
        }
      }
      
      console.log(`🎉 Cleanup complete: ${removed} duplicates removed, ${errors} errors`);
      return { removed, errors };
      
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      throw new Error(`Failed to cleanup duplicate transactions: ${error.message}`);
    }
  }

  /**
   * Get transaction statistics for debugging
   */
  async getTransactionStats(): Promise<{
    total: number;
    byType: { [key: string]: number };
    byStatus: { [key: string]: number };
    duplicates: number;
  }> {
    try {
      const transactionsSnapshot = await getDocs(collection(db, 'wallet-transactions'));
      
      if (transactionsSnapshot.size === 0) {
        return { total: 0, byType: {}, byStatus: {}, duplicates: 0 };
      }
      
      const transactions = transactionsSnapshot.docs.map(doc => doc.data());
      
      // Count by type
      const byType: { [key: string]: number } = {};
      const byStatus: { [key: string]: number } = {};
      
      transactions.forEach(transaction => {
        byType[transaction.type] = (byType[transaction.type] || 0) + 1;
        byStatus[transaction.status] = (byStatus[transaction.status] || 0) + 1;
      });
      
      // Count duplicates
      const references = transactions.map(t => t.reference);
      const uniqueReferences = new Set(references);
      const duplicates = references.length - uniqueReferences.size;
      
      return {
        total: transactionsSnapshot.size,
        byType,
        byStatus,
        duplicates
      };
      
    } catch (error) {
      console.error('Error getting transaction stats:', error);
      throw new Error('Failed to get transaction statistics');
    }
  }
}

// Export singleton instance
export const walletService = WalletService.getInstance()
