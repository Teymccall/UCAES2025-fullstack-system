# 🚨 CRITICAL: Payment Unit Conversion Guide

## ⚠️ **IMPORTANT: This document prevents payment processing errors**

### **The Problem We Fixed**
- **Wallet amounts are stored in PESEWAS** (1 cedi = 100 pesewas)
- **Fee amounts are in CEDIS** (main currency unit)
- **Payment functions expect amounts in PESEWAS**
- **If you pass cedis instead of pesewas, only 1% of the intended amount will be processed**

### **Example of the Error**
```typescript
// ❌ WRONG: This will only deduct ¢30.5 instead of ¢3,050
const success = await walletService.processFeePayment(
  studentId,
  3050, // Amount in cedis - WRONG!
  description,
  metadata
)

// ✅ CORRECT: This will deduct the full ¢3,050
const amountInPesewas = Math.round(3050 * 100) // 305,000 pesewas
const success = await walletService.processFeePayment(
  studentId,
  amountInPesewas, // Amount in pesewas - CORRECT!
  description,
  metadata
)
```

## 🔧 **Payment Functions and Their Unit Requirements**

### **1. processFeePayment()**
- **Expected Unit**: PESEWAS
- **Purpose**: Process semester/tuition fee payments
- **Usage**: Always convert cedis to pesewas before calling

```typescript
// ✅ CORRECT USAGE
const feeAmountInCedis = 3050 // First semester fee
const feeAmountInPesewas = Math.round(feeAmountInCedis * 100)

const success = await walletService.processFeePayment(
  studentId,
  feeAmountInPesewas, // 305,000 pesewas
  description,
  metadata
)
```

### **2. processServicePayment()**
- **Expected Unit**: PESEWAS
- **Purpose**: Process service fee payments
- **Usage**: Service amounts are already in pesewas from the database

```typescript
// ✅ CORRECT USAGE (service amounts are already in pesewas)
const success = await walletService.processServicePayment(
  studentId,
  totalAmount, // Already in pesewas from service calculation
  services,
  description
)
```

### **3. createPaymentTransaction()**
- **Expected Unit**: PESEWAS
- **Purpose**: Create general payment transactions
- **Usage**: Convert cedis to pesewas before calling

```typescript
// ✅ CORRECT USAGE
const amountInCedis = 100 // Payment amount
const amountInPesewas = Math.round(amountInCedis * 100)

const transaction = await walletService.createPaymentTransaction(
  studentId,
  amountInPesewas, // 10,000 pesewas
  description,
  metadata
)
```

## 📍 **Components That Handle Unit Conversion**

### **✅ Already Fixed Components**
1. **current-semester-fees.tsx** - Converts cedis to pesewas for fee payments
2. **payment-form.tsx** - Converts cedis to pesewas for general payments
3. **service-payment.tsx** - Uses amounts already in pesewas

### **🔍 Components to Check When Adding New Features**
- Any new payment components
- Admin payment processing
- Bulk payment operations
- Payment import/export functions

## 🛡️ **Safety Measures Added**

### **1. Runtime Warnings**
The wallet service now logs warnings if amounts seem unusually low:

```typescript
// SAFETY CHECK: Ensure amount is in pesewas (not cedis)
if (amount < 1000) { // If amount is less than 10 cedis, it might be in cedis
  console.warn(`⚠️ WARNING: Fee payment amount (${amount}) seems unusually low. Expected amount in pesewas.`)
  console.warn(`   If this is in cedis, multiply by 100 before calling this method.`)
}
```

### **2. Clear Documentation**
All payment function calls now have clear comments explaining the unit requirement.

### **3. Unit Conversion Utilities**
Consider creating utility functions for consistent conversion:

```typescript
// utils/currency-conversion.ts
export const cedisToPesewas = (cedis: number): number => Math.round(cedis * 100)
export const pesewasToCedis = (pesewas: number): number => pesewas / 100
export const formatCedis = (pesewas: number): string => `¢${(pesewas / 100).toLocaleString()}`
```

## 🧪 **Testing Checklist**

Before deploying any payment-related changes:

- [ ] Verify all payment amounts are in the correct units
- [ ] Test with realistic fee amounts (e.g., ¢3,050 not ¢30.5)
- [ ] Check console for unit conversion warnings
- [ ] Verify wallet balance updates correctly
- [ ] Test payment success/failure scenarios

## 🚨 **Emergency Fixes**

If you encounter this issue again:

1. **Immediate**: Check console for unit conversion warnings
2. **Verify**: Confirm the amount being passed to payment functions
3. **Fix**: Convert cedis to pesewas using `Math.round(amount * 100)`
4. **Test**: Verify the correct amount is processed
5. **Document**: Add clear comments explaining the unit conversion

## 📞 **Support**

If you're unsure about unit conversion:
1. Check this document first
2. Look for existing examples in the codebase
3. Check console warnings for guidance
4. Ask the development team

---

**Remember: When in doubt, convert cedis to pesewas before calling payment functions!**
