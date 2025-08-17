# Student Wallet Integration for UCAES Fees Portal

## 🎯 **Overview**

The Student Wallet System is a comprehensive financial management solution that allows students to:

1. **Deposit money** into their wallet using Paystack
2. **View their balance** and transaction history
3. **Pay fees instantly** using wallet funds
4. **Track all transactions** with detailed records

## 🚀 **Features Implemented**

### ✅ **Core Wallet Features**
- **Wallet Dashboard**: Complete overview of balance, deposits, and payments
- **Deposit System**: Add money to wallet via Paystack integration
- **Instant Payments**: Pay fees directly from wallet balance
- **Transaction History**: Detailed records of all wallet activities
- **Balance Tracking**: Real-time balance updates

### ✅ **Payment Integration**
- **Paystack Integration**: Secure payment processing for deposits
- **Multiple Payment Methods**: Card, Bank Transfer, Mobile Money
- **Webhook Handling**: Automatic wallet updates via Paystack webhooks
- **Payment Verification**: Secure verification of all transactions

### ✅ **User Experience**
- **Quick Amount Buttons**: Predefined deposit amounts (¢50, ¢100, ¢200, etc.)
- **Balance Display**: Shows available balance in payment forms
- **Insufficient Balance Handling**: Clear messaging when balance is low
- **Transaction Export**: Download transaction history as CSV

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Student UI    │    │  Wallet System   │    │  Paystack API   │
│                 │    │                  │    │                 │
│ Wallet Dashboard│◄──►│  Balance Mgmt    │◄──►│  Payment Proc   │
│ Deposit Form    │    │  Transaction DB  │    │  Webhooks       │
│ Payment Forms   │    │  Security Layer  │    │  Verification   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 **File Structure**

```
FEES PORTAL/
├── lib/
│   ├── models/
│   │   └── wallet.ts                    # Wallet data models
│   ├── wallet-service.ts                # Wallet business logic
│   └── paystack-service.ts              # Paystack integration
├── components/student/wallet/
│   ├── wallet-dashboard.tsx             # Main wallet interface
│   ├── wallet-deposit-form.tsx          # Deposit form
│   └── wallet-transaction-history.tsx   # Transaction history
├── app/
│   ├── wallet/
│   │   ├── page.tsx                     # Wallet page
│   │   └── callback/
│   │       └── page.tsx                 # Deposit callback
│   └── api/paystack/webhook/
│       └── route.ts                     # Webhook handler
└── components/student/fees/
    └── payment-form.tsx                 # Updated with wallet option
```

## 💾 **Database Schema**

### **Student Wallet Collection**
```typescript
interface StudentWallet {
  id: string
  studentId: string
  balance: number                    // Balance in pesewas
  currency: string                   // GHS, NGN, etc.
  status: 'active' | 'suspended' | 'closed'
  createdAt: string
  updatedAt: string
  lastTransactionDate?: string
}
```

### **Wallet Transactions Collection**
```typescript
interface WalletTransaction {
  id: string
  walletId: string
  studentId: string
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'fee_deduction'
  amount: number                     // Amount in pesewas
  currency: string
  description: string
  reference: string                  // Paystack reference
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  paymentMethod?: 'paystack' | 'wallet' | 'manual' | 'refund'
  paystackData?: {                   // Paystack transaction details
    reference: string
    transactionId: string
    channel: string
    gateway_response: string
    paid_at: string
  }
  metadata?: {                       // Additional transaction data
    feeType?: string
    academicYear?: string
    semester?: string
    services?: string[]
  }
  createdAt: string
  updatedAt: string
}
```

## 🔄 **Payment Flow**

### **1. Wallet Deposit Flow**
```
Student → Deposit Form → Paystack → Payment → Webhook → Wallet Update
   ↓           ↓           ↓         ↓         ↓         ↓
Enter Amount → Select Method → Pay → Verify → Process → Balance Updated
```

### **2. Fee Payment Flow**
```
Student → Fee Selection → Payment Form → Wallet Check → Payment → Transaction Record
   ↓           ↓              ↓            ↓           ↓           ↓
Select Fees → Choose Method → Check Balance → Deduct → Complete → Update Records
```

## 🛠️ **API Endpoints**

### **Wallet Service Methods**
```typescript
// Get or create student wallet
getStudentWallet(studentId: string): Promise<StudentWallet>

// Get wallet summary with totals
getWalletSummary(studentId: string): Promise<WalletSummary>

// Get transaction history
getWalletTransactions(studentId: string, limit?: number): Promise<WalletTransaction[]>

// Create deposit transaction
createDepositTransaction(studentId: string, amount: number, reference: string, paystackData: any): Promise<WalletTransaction>

// Create payment transaction (deduct from wallet)
createPaymentTransaction(studentId: string, amount: number, description: string, metadata?: any): Promise<WalletTransaction>

// Process Paystack payment to wallet
processPaystackPayment(studentId: string, reference: string, paystackData: any): Promise<WalletTransaction>

// Check if sufficient balance
hasSufficientBalance(studentId: string, amount: number): Promise<boolean>

// Get wallet balance
getWalletBalance(studentId: string): Promise<number>
```

## 🎨 **User Interface**

### **Wallet Dashboard**
- **Balance Overview**: Current balance, total deposits, total payments
- **Quick Actions**: Add money, pay fees, view history
- **Recent Transactions**: Last 5 transactions with status
- **Transaction History**: Full history with search and filters

### **Deposit Form**
- **Amount Input**: Manual entry with quick amount buttons
- **Payment Method Selection**: Card, Bank Transfer, Mobile Money
- **Real-time Validation**: Amount and method validation
- **Progress Tracking**: Payment initialization and completion

### **Payment Integration**
- **Balance Display**: Shows available balance in payment forms
- **Wallet Payment Option**: Pay directly from wallet when sufficient balance
- **Insufficient Balance Handling**: Clear messaging and alternative options

## 🔒 **Security Features**

### **Transaction Security**
- **Unique References**: Each transaction has a unique reference
- **Duplicate Prevention**: Checks for existing transactions
- **Webhook Verification**: Validates Paystack webhook signatures
- **Balance Validation**: Prevents overdrawing from wallet

### **Data Protection**
- **Amount Validation**: All amounts validated before processing
- **Student Verification**: Ensures transactions belong to correct student
- **Audit Trail**: Complete transaction history for all operations

## 🧪 **Testing**

### **Test Scenarios**
1. **Wallet Creation**: New student gets wallet automatically
2. **Deposit Processing**: Paystack payment adds to wallet
3. **Balance Updates**: Real-time balance updates after transactions
4. **Payment Processing**: Fee payments deduct from wallet
5. **Insufficient Balance**: Proper handling when balance is low
6. **Transaction History**: Accurate recording of all transactions

### **Test Data**
```javascript
// Test wallet deposit
const testDeposit = {
  studentId: 'TEST123',
  amount: 5000, // ¢50.00
  reference: 'TEST-DEPOSIT-001',
  paystackData: {
    id: 'test_transaction_id',
    channel: 'card',
    gateway_response: 'Successful',
    paid_at: new Date().toISOString()
  }
}

// Test fee payment
const testPayment = {
  studentId: 'TEST123',
  amount: 2000, // ¢20.00
  description: 'Payment for Tuition Fee',
  metadata: {
    feeType: 'tuition',
    academicYear: '2024/2025',
    semester: 'First'
  }
}
```

## 🚀 **Deployment**

### **Environment Variables**
```bash
# Paystack Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...

# Wallet Configuration
NEXT_PUBLIC_WALLET_ENABLED=true
NEXT_PUBLIC_WALLET_CURRENCY=GHS
```

### **Database Setup**
1. **Collections**: Create `student-wallets` and `wallet-transactions` collections
2. **Indexes**: Add indexes for performance
3. **Security Rules**: Configure Firestore security rules

### **Webhook Configuration**
1. **Paystack Dashboard**: Set webhook URL to `/api/paystack/webhook`
2. **Events**: Enable `charge.success` and `charge.failed` events
3. **Testing**: Use Paystack webhook testing tools

## 📊 **Monitoring & Analytics**

### **Key Metrics**
- **Total Wallet Deposits**: Sum of all deposits
- **Total Wallet Payments**: Sum of all fee payments
- **Average Balance**: Average wallet balance across students
- **Transaction Volume**: Number of transactions per period
- **Success Rate**: Percentage of successful transactions

### **Logging**
- **Transaction Logs**: All wallet transactions logged
- **Error Logs**: Failed transactions and errors
- **Webhook Logs**: Paystack webhook events
- **Performance Logs**: Response times and system performance

## 🔄 **Future Enhancements**

### **Planned Features**
- **Payment Plans**: Scheduled payments from wallet
- **Refund System**: Automated refund processing
- **Wallet Transfers**: Transfer between students
- **Budget Management**: Spending limits and alerts
- **Analytics Dashboard**: Advanced reporting and insights

### **Integration Opportunities**
- **SMS Notifications**: Transaction alerts via SMS
- **Email Receipts**: Automated receipt generation
- **Admin Dashboard**: Wallet management for administrators
- **API Access**: External system integration

## 🆘 **Troubleshooting**

### **Common Issues**
1. **Balance Not Updating**: Check webhook configuration and logs
2. **Payment Failures**: Verify Paystack keys and network connectivity
3. **Duplicate Transactions**: Check transaction reference uniqueness
4. **Insufficient Balance**: Validate balance calculation logic

### **Debug Commands**
```javascript
// Check wallet balance
const balance = await walletService.getWalletBalance('STUDENT_ID')

// Get transaction history
const transactions = await walletService.getWalletTransactions('STUDENT_ID')

// Verify Paystack payment
const verification = await paystackService.verifyPayment('REFERENCE')
```

## 📞 **Support**

For technical support or questions about the wallet integration:

1. **Check Logs**: Review console and server logs for errors
2. **Verify Configuration**: Ensure all environment variables are set
3. **Test Webhooks**: Use Paystack webhook testing tools
4. **Contact Support**: Reach out to the development team

---

**🎉 The Student Wallet System is now fully integrated and ready for production use!**

