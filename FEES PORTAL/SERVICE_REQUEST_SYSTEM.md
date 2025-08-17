# Service Request System - Complete Implementation Guide

## Overview

The Service Request System allows students to request additional academic services (like field work fees, laboratory fees, etc.) that are placed by Directors of Academic Affairs or Finance Officers. Students can then pay for these approved services using their wallet balance or Paystack card payments.

## System Flow

### 1. Service Creation (Admin/Director Level)
- **Location**: `/admin` page in the Fees Portal
- **Who**: Directors of Academic Affairs, Finance Officers
- **What**: Create and manage services with:
  - Service name, description, amount
  - Type (Service, Mandatory, Optional)
  - Category (Academic, Administrative, etc.)
  - Applicable programmes and levels
  - Active/Inactive status

### 2. Service Request (Student Level)
- **Location**: `/fees` page → "Request Services" tab
- **Who**: Students
- **What**: 
  - Browse available services filtered by their programme and level
  - Select services and quantities
  - Add notes to requests
  - Submit service requests for approval

### 3. Service Approval (Staff Level)
- **Location**: Admin dashboard (to be implemented)
- **Who**: Staff members
- **What**: Review and approve/reject service requests

### 4. Payment (Student Level)
- **Location**: `/fees` page → "My Requests" tab
- **Who**: Students with approved requests
- **What**: 
  - View approved service requests
  - Choose payment method (Wallet or Paystack)
  - Complete payment
  - Get confirmation and receipt

## Components Structure

### Core Components

#### 1. Service Request Component (`service-request.tsx`)
- Displays available services for students
- Allows service selection with quantities
- Handles service request submission
- Integrates with the services API

#### 2. Service Request Dashboard (`service-request-dashboard.tsx`)
- Shows all student service requests
- Filters by status (All, Pending, Approved, Rejected, Paid)
- Integrates with payment component for approved requests

#### 3. Service Payment Component (`service-payment.tsx`)
- Handles payment for approved service requests
- Supports both wallet and Paystack payment methods
- Updates service request status after successful payment

### API Endpoints

#### 1. Services API (`/api/finance/services`)
- `GET`: Fetch available services with filtering
- `POST`: Create new services (admin only)

#### 2. Service Requests API (`/api/finance/service-requests`)
- `GET`: Fetch service requests for a student
- `POST`: Create new service requests

#### 3. Service Request Update API (`/api/finance/service-requests/[id]`)
- `PATCH`: Update service request status
- `GET`: Fetch specific service request

## Database Collections

### 1. `fee-services`
```typescript
{
  id: string
  name: string
  description?: string
  amount: number
  type: 'Service' | 'Mandatory' | 'Optional'
  category: string
  isActive: boolean
  forProgrammes?: string[]
  forLevels?: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
}
```

### 2. `service-requests`
```typescript
{
  id: string
  studentId: string
  studentName: string
  services: Array<{
    serviceId: string
    serviceName: string
    quantity: number
    amount: number
    total: number
  }>
  totalAmount: number
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  requestDate: string
  processedBy?: string
  processedDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}
```

## Payment Integration

### Wallet Payment
- Checks student wallet balance
- Creates wallet transaction
- Updates service request status to 'paid'
- Updates wallet balance

### Paystack Payment
- Integrates with existing Paystack implementation
- Redirects to Paystack payment page
- Handles payment callback
- Updates service request status after successful payment

## User Experience Flow

### For Students:
1. **Browse Services**: Go to Fees → Request Services
2. **Select Services**: Choose services and quantities
3. **Submit Request**: Add notes and submit for approval
4. **Track Status**: Monitor request status in My Requests tab
5. **Make Payment**: Pay for approved services using wallet or card
6. **Get Confirmation**: Receive payment confirmation and receipt

### For Staff:
1. **Review Requests**: View pending service requests
2. **Approve/Reject**: Process requests with notes
3. **Monitor Payments**: Track payment status

## Security Features

- Service filtering by student programme and level
- Duplicate request prevention
- Payment verification
- Status tracking and audit trail
- Role-based access control

## Integration Points

### Existing Systems:
- **Wallet System**: For balance checking and transactions
- **Paystack**: For card payments
- **Authentication**: For user verification
- **Academic Affairs**: For service management

### Future Enhancements:
- **Email Notifications**: For request status updates
- **SMS Notifications**: For payment confirmations
- **Receipt Generation**: PDF receipts for payments
- **Analytics Dashboard**: For payment and service analytics

## Configuration

### Environment Variables:
- Paystack public/secret keys
- Firebase configuration
- API endpoints

### Service Types:
- **Mandatory**: Required fees (e.g., laboratory fees)
- **Service**: Optional services (e.g., field work fees)
- **Optional**: Additional services (e.g., special workshops)

## Testing

### Test Scenarios:
1. Service creation and management
2. Service request submission
3. Request approval/rejection
4. Payment processing (wallet and Paystack)
5. Status updates and notifications
6. Error handling and edge cases

## Deployment

### Prerequisites:
- Firebase project configured
- Paystack account and keys
- Database collections created
- API endpoints deployed

### Steps:
1. Deploy API endpoints
2. Update frontend components
3. Configure Firebase rules
4. Test payment flows
5. Monitor system performance

## Support and Maintenance

### Monitoring:
- Payment success/failure rates
- Service request processing times
- System performance metrics
- Error logs and alerts

### Updates:
- Regular security updates
- Feature enhancements
- Performance optimizations
- Bug fixes and patches

## Conclusion

The Service Request System provides a complete workflow for students to request and pay for academic services. It integrates seamlessly with existing payment systems and provides a user-friendly interface for both students and staff. The system is designed to be scalable, secure, and maintainable for long-term use.
