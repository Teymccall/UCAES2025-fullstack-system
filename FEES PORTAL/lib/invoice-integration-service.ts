// Invoice Integration Service - Connect Finance Officer invoices to student payment portal
import { getFirestore, collection, doc, getDocs, addDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface StudentInvoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  createdAt: string;
  createdBy: string;
  paidAt?: string;
  paymentReference?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
  total: number;
}

export interface InvoicePaymentRequest {
  invoiceId: string;
  studentId: string;
  amount: number;
  paymentMethod: 'wallet' | 'paystack';
  paymentReference?: string;
}

/**
 * Get all invoices for a student
 */
export async function getStudentInvoices(studentId: string): Promise<StudentInvoice[]> {
  try {
    console.log('📄 Fetching invoices for student:', studentId);
    
    const invoicesRef = collection(db, 'invoices');
    const q = query(
      invoicesRef,
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const invoices: StudentInvoice[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Calculate if invoice is overdue
      const now = new Date();
      const dueDate = new Date(data.dueDate);
      const isOverdue = now > dueDate && data.status === 'pending';
      
      invoices.push({
        id: doc.id,
        invoiceNumber: data.invoiceNumber,
        studentId: data.studentId,
        studentName: data.studentName,
        items: data.items || [],
        subtotal: data.subtotal || 0,
        tax: data.tax || 0,
        total: data.total || 0,
        status: isOverdue ? 'overdue' : data.status,
        dueDate: data.dueDate,
        createdAt: data.createdAt,
        createdBy: data.createdBy,
        paidAt: data.paidAt,
        paymentReference: data.paymentReference,
        paymentMethod: data.paymentMethod,
        notes: data.notes
      });
    });
    
    console.log(`📊 Found ${invoices.length} invoices for student`);
    
    // Categorize invoices
    const pending = invoices.filter(i => i.status === 'pending').length;
    const overdue = invoices.filter(i => i.status === 'overdue').length;
    const paid = invoices.filter(i => i.status === 'paid').length;
    
    console.log(`   📋 Status breakdown: ${pending} pending, ${overdue} overdue, ${paid} paid`);
    
    return invoices;
  } catch (error) {
    console.error('❌ Error fetching student invoices:', error);
    return [];
  }
}

/**
 * Get pending invoice balance for a student
 */
export async function getStudentInvoiceBalance(studentId: string): Promise<{
  totalPending: number;
  totalOverdue: number;
  invoiceCount: number;
  overdueCount: number;
}> {
  try {
    const invoices = await getStudentInvoices(studentId);
    
    const pendingInvoices = invoices.filter(i => i.status === 'pending');
    const overdueInvoices = invoices.filter(i => i.status === 'overdue');
    
    const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);
    
    return {
      totalPending,
      totalOverdue,
      invoiceCount: pendingInvoices.length,
      overdueCount: overdueInvoices.length
    };
  } catch (error) {
    console.error('❌ Error calculating invoice balance:', error);
    return {
      totalPending: 0,
      totalOverdue: 0,
      invoiceCount: 0,
      overdueCount: 0
    };
  }
}

/**
 * Process invoice payment
 */
export async function processInvoicePayment(
  paymentRequest: InvoicePaymentRequest
): Promise<{ success: boolean; message: string; paymentReference?: string }> {
  try {
    console.log('💳 Processing invoice payment:', paymentRequest);
    
    // Get invoice details
    const invoicesRef = collection(db, 'invoices');
    const invoiceQuery = query(invoicesRef, where('__name__', '==', paymentRequest.invoiceId));
    const invoiceSnapshot = await getDocs(invoiceQuery);
    
    if (invoiceSnapshot.empty) {
      return { success: false, message: 'Invoice not found' };
    }
    
    const invoiceDoc = invoiceSnapshot.docs[0];
    const invoice = invoiceDoc.data();
    
    // Validate payment amount
    if (paymentRequest.amount !== invoice.total) {
      return { success: false, message: 'Payment amount does not match invoice total' };
    }
    
    // Validate student
    if (paymentRequest.studentId !== invoice.studentId) {
      return { success: false, message: 'Invoice does not belong to this student' };
    }
    
    // Check if already paid
    if (invoice.status === 'paid') {
      return { success: false, message: 'Invoice has already been paid' };
    }
    
    // Generate payment reference
    const paymentReference = paymentRequest.paymentReference || `INV-${Date.now()}-${paymentRequest.studentId}`;
    
    // Process payment based on method
    let paymentResult;
    
    if (paymentRequest.paymentMethod === 'wallet') {
      paymentResult = await processWalletInvoicePayment(paymentRequest, invoice);
    } else if (paymentRequest.paymentMethod === 'paystack') {
      paymentResult = await processPaystackInvoicePayment(paymentRequest, invoice);
    } else {
      return { success: false, message: 'Invalid payment method' };
    }
    
    if (!paymentResult.success) {
      return paymentResult;
    }
    
    // Update invoice status
    await updateDoc(doc(db, 'invoices', paymentRequest.invoiceId), {
      status: 'paid',
      paidAt: new Date().toISOString(),
      paymentReference: paymentReference,
      paymentMethod: paymentRequest.paymentMethod,
      updatedAt: new Date().toISOString()
    });
    
    // Create payment record for invoice
    await createInvoicePaymentRecord(paymentRequest, invoice, paymentReference);
    
    console.log(`✅ Invoice payment processed successfully: ${paymentReference}`);
    
    return {
      success: true,
      message: 'Invoice payment processed successfully',
      paymentReference
    };
    
  } catch (error) {
    console.error('❌ Error processing invoice payment:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process payment'
    };
  }
}

/**
 * Process wallet payment for invoice
 */
async function processWalletInvoicePayment(
  paymentRequest: InvoicePaymentRequest,
  invoice: any
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🏦 Processing wallet payment for invoice...');
    
    // Import wallet service
    const { WalletService } = await import('./wallet-service');
    const walletService = new WalletService();
    
    // Check wallet balance
    const walletBalance = await walletService.getWalletBalance(paymentRequest.studentId);
    
    if (walletBalance < paymentRequest.amount * 100) { // Convert to pesewas
      return {
        success: false,
        message: `Insufficient wallet balance. Required: ¢${paymentRequest.amount}, Available: ¢${walletBalance / 100}`
      };
    }
    
    // Deduct from wallet
    const deductionResult = await walletService.deductFromWallet(
      paymentRequest.studentId,
      paymentRequest.amount * 100, // Convert to pesewas
      `Invoice payment: ${invoice.invoiceNumber}`,
      'invoice_payment',
      {
        invoiceId: paymentRequest.invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        description: invoice.items?.[0]?.description || 'Invoice payment'
      }
    );
    
    if (!deductionResult.success) {
      return {
        success: false,
        message: `Wallet deduction failed: ${deductionResult.message}`
      };
    }
    
    console.log('✅ Wallet payment successful');
    return { success: true, message: 'Wallet payment processed' };
    
  } catch (error) {
    console.error('❌ Error processing wallet invoice payment:', error);
    return {
      success: false,
      message: 'Wallet payment processing failed'
    };
  }
}

/**
 * Process Paystack payment for invoice
 */
async function processPaystackInvoicePayment(
  paymentRequest: InvoicePaymentRequest,
  invoice: any
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('💳 Processing Paystack payment for invoice...');
    
    // Import Paystack service
    const { PaystackService } = await import('./paystack-service');
    
    // Initialize Paystack payment
    const paystackResult = await PaystackService.initializePayment({
      email: `${paymentRequest.studentId}@student.ucaes.edu.gh`, // Mock email
      amount: paymentRequest.amount * 100, // Convert to pesewas
      currency: 'GHS',
      reference: paymentRequest.paymentReference || `INV-${Date.now()}`,
      metadata: {
        type: 'invoice_payment',
        invoiceId: paymentRequest.invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        studentId: paymentRequest.studentId,
        description: `Invoice payment: ${invoice.invoiceNumber}`
      }
    });
    
    if (!paystackResult.success) {
      return {
        success: false,
        message: `Paystack initialization failed: ${paystackResult.message}`
      };
    }
    
    console.log('✅ Paystack payment initialized');
    return { success: true, message: 'Paystack payment initialized' };
    
  } catch (error) {
    console.error('❌ Error processing Paystack invoice payment:', error);
    return {
      success: false,
      message: 'Paystack payment processing failed'
    };
  }
}

/**
 * Create payment record for invoice payment
 */
async function createInvoicePaymentRecord(
  paymentRequest: InvoicePaymentRequest,
  invoice: any,
  paymentReference: string
): Promise<void> {
  try {
    const paymentRecord = {
      studentId: paymentRequest.studentId,
      studentName: invoice.studentName,
      paymentType: 'invoice',
      invoiceId: paymentRequest.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      amount: paymentRequest.amount,
      paymentMethod: paymentRequest.paymentMethod,
      paymentReference: paymentReference,
      description: `Invoice payment: ${invoice.invoiceNumber}`,
      status: 'completed',
      paymentDate: new Date().toISOString().split('T')[0],
      submittedAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
      academicYear: '2025/2026', // Default academic year
      semester: 'Current', // Default semester
      category: 'invoice',
      items: invoice.items
    };
    
    // Add to student-payments collection for consistency
    await addDoc(collection(db, 'student-payments'), paymentRecord);
    
    console.log('✅ Invoice payment record created');
  } catch (error) {
    console.error('❌ Error creating invoice payment record:', error);
  }
}

/**
 * Get invoice payment history for a student
 */
export async function getInvoicePaymentHistory(studentId: string): Promise<any[]> {
  try {
    console.log('📊 Fetching invoice payment history for student:', studentId);
    
    const paymentsRef = collection(db, 'student-payments');
    const q = query(
      paymentsRef,
      where('studentId', '==', studentId),
      where('paymentType', '==', 'invoice'),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const payments: any[] = [];
    querySnapshot.forEach((doc) => {
      payments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`📊 Found ${payments.length} invoice payments`);
    return payments;
    
  } catch (error) {
    console.error('❌ Error fetching invoice payment history:', error);
    return [];
  }
}

/**
 * Check if invoices affect student's main fee balance
 */
export async function getInvoiceImpactOnFees(studentId: string): Promise<{
  hasOutstandingInvoices: boolean;
  totalInvoiceBalance: number;
  affectsRegistration: boolean;
  message?: string;
}> {
  try {
    const invoiceBalance = await getStudentInvoiceBalance(studentId);
    
    const hasOutstanding = invoiceBalance.totalPending > 0 || invoiceBalance.totalOverdue > 0;
    const totalBalance = invoiceBalance.totalPending + invoiceBalance.totalOverdue;
    
    // Invoices could affect registration if they're overdue
    const affectsRegistration = invoiceBalance.totalOverdue > 0;
    
    let message;
    if (affectsRegistration) {
      message = `You have ¢${invoiceBalance.totalOverdue} in overdue invoices that may affect your registration.`;
    } else if (hasOutstanding) {
      message = `You have ¢${totalBalance} in pending invoices.`;
    }
    
    return {
      hasOutstandingInvoices: hasOutstanding,
      totalInvoiceBalance: totalBalance,
      affectsRegistration,
      message
    };
  } catch (error) {
    console.error('❌ Error checking invoice impact on fees:', error);
    return {
      hasOutstandingInvoices: false,
      totalInvoiceBalance: 0,
      affectsRegistration: false
    };
  }
}

export default {
  getStudentInvoices,
  getStudentInvoiceBalance,
  processInvoicePayment,
  getInvoicePaymentHistory,
  getInvoiceImpactOnFees
};



