# Finance Service Integration Guide

## Overview

This document explains the complete integration between the Academic Affairs finance system and the Fees Portal for managing academic services. The system allows staff to create services in Academic Affairs, which are then available for students to request through the Fees Portal.

## System Architecture

### 1. Academic Affairs (Service Creation)
- **Location**: `/staff/finance` and `/director/finance` pages
- **Purpose**: Create and manage academic services
- **Database**: Firebase `fee-services` collection
- **API**: `/api/finance/services` (GET, POST, PUT, DELETE)

### 2. Fees Portal (Service Requests)
- **Location**: `/fees` page → "Request Services" tab
- **Purpose**: Allow students to request available services
- **Database**: Firebase `service-requests` collection
- **API**: `/api/finance/service-requests` (GET, POST)

## Data Flow

### Service Creation Flow
```
1. Staff/Director creates service in Academic Affairs
   ↓
2. Service stored in Firebase 'fee-services' collection
   ↓
3. Service becomes available for student requests
```

### Service Request Flow
```
1. Student browses available services in Fees Portal
   ↓
2. Student selects services and submits request
   ↓
3. Request stored in Firebase 'service-requests' collection
   ↓
4. Student can view and pay for approved requests
```

## Database Schema

### Fee Services Collection (`fee-services`)
```typescript
interface ServiceFee {
  id?: string
  name: string                    // Service name
  description?: string            // Service description
  amount: number                  // Service cost
  type: 'Service' | 'Mandatory' | 'Optional'
  category: string                // e.g., 'Academic', 'Administrative'
  isActive: boolean               // Whether service is available
  forProgrammes?: string[]        // Applicable programmes (empty = all)
  forLevels?: string[]            // Applicable levels (empty = all)
  createdAt: string
  updatedAt: string
  createdBy: string               // User who created the service
}
```

### Service Requests Collection (`service-requests`)
```typescript
interface ServiceRequest {
  id?: string
  studentId: string               // Student registration number
  studentName: string             // Student full name
  serviceId: string               // Reference to fee-services
  serviceName: string             // Service name (for display)
  serviceAmount: number           // Service cost
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  requestDate: string
  approvedDate?: string
  notes?: string
  approvedBy?: string
}
```

## API Endpoints

### Academic Affairs API

#### GET `/api/finance/services`
- **Purpose**: Fetch all available services
- **Response**: Array of ServiceFee objects
- **Used by**: Fees Portal to display available services

#### POST `/api/finance/services`
- **Purpose**: Create a new service
- **Body**: ServiceFee object (without id)
- **Response**: Created service with id
- **Used by**: Academic Affairs finance pages

#### PUT `/api/finance/services`
- **Purpose**: Update an existing service
- **Body**: ServiceFee object with id
- **Response**: Updated service
- **Used by**: Academic Affairs finance pages

#### DELETE `/api/finance/services`
- **Purpose**: Delete a service
- **Body**: Service id
- **Response**: Success confirmation
- **Used by**: Academic Affairs finance pages

### Fees Portal API

#### GET `/api/finance/services`
- **Purpose**: Fetch available services for students
- **Query Params**: programme, level, category, type
- **Response**: Filtered array of ServiceFee objects
- **Used by**: Fees Portal service request component

#### GET `/api/finance/service-requests`
- **Purpose**: Fetch service requests for a student
- **Query Params**: studentId, status
- **Response**: Array of ServiceRequest objects
- **Used by**: Fees Portal service request dashboard

#### POST `/api/finance/service-requests`
- **Purpose**: Create service requests for a student
- **Body**: { studentId, studentName, services[], notes }
- **Response**: Created request with id
- **Used by**: Fees Portal service request component

## Integration Points

### 1. Service Retrieval
The Fees Portal retrieves services from Academic Affairs using a fallback strategy:

```typescript
// 1. Try local API first
const localResponse = await fetch('/api/finance/services')

// 2. Try Academic Affairs API as fallback
const academicResponse = await fetch('http://localhost:3000/api/finance/services')

// 3. Fallback to Firebase directly
const servicesRef = collection(db, 'fee-services')
```

### 2. Service Request Creation
The Fees Portal creates service requests using a fallback strategy:

```typescript
// 1. Try local API first
const localResponse = await fetch('/api/finance/service-requests', {
  method: 'POST',
  body: JSON.stringify({ studentId, studentName, services, notes })
})

// 2. Try Academic Affairs API as fallback
const academicResponse = await fetch('http://localhost:3000/api/finance/service-requests', {
  method: 'POST',
  body: JSON.stringify({ studentId, serviceIds, notes })
})

// 3. Fallback to Firebase directly
const requestsRef = collection(db, 'service-requests')
```

## Key Features

### 1. Service Filtering
- Services are filtered by student's programme and level
- Only active services are shown to students
- Services can be categorized (Academic, Administrative, etc.)

### 2. Duplicate Prevention
- System prevents duplicate service requests
- Checks for existing pending/approved requests before creating new ones

### 3. Auto-Approval
- Service requests are auto-approved for immediate payment
- Can be modified to require manual approval workflow

### 4. Payment Integration
- Approved service requests appear in student's fee statement
- Students can pay using wallet balance or Paystack
- Payment status is tracked in the system

## Testing

### Manual Testing
1. Create a service in Academic Affairs finance page
2. Verify service appears in Fees Portal service request page
3. Submit a service request as a student
4. Verify request appears in service request dashboard
5. Verify request appears in student's fee statement

### Automated Testing
Run the test script to verify integration:
```bash
node test-finance-service-integration.js
```

## Troubleshooting

### Common Issues

1. **Services not appearing in Fees Portal**
   - Check if service is marked as `isActive: true`
   - Verify student's programme/level matches service criteria
   - Check Firebase connection and permissions

2. **Service requests not being created**
   - Verify student ID format matches expected format
   - Check if service exists in `fee-services` collection
   - Verify API endpoints are accessible

3. **API connection issues**
   - Check if Academic Affairs server is running on port 3000
   - Verify CORS settings if calling cross-origin
   - Check network connectivity between services

### Debug Steps

1. Check browser console for API errors
2. Verify Firebase collections have correct data
3. Test API endpoints directly using Postman or curl
4. Check server logs for detailed error messages

## Security Considerations

1. **Authentication**: All API endpoints should require proper authentication
2. **Authorization**: Verify user permissions before allowing service creation/modification
3. **Data Validation**: Validate all input data before storing in database
4. **Rate Limiting**: Implement rate limiting to prevent abuse

## Future Enhancements

1. **Approval Workflow**: Add manual approval process for service requests
2. **Bulk Operations**: Allow bulk service creation and management
3. **Analytics**: Add reporting and analytics for service usage
4. **Notifications**: Add email/SMS notifications for service request status changes
5. **Integration**: Integrate with other university systems (SIS, ERP, etc.)

## Conclusion

The finance service integration provides a seamless experience for both staff and students. Staff can easily create and manage services in Academic Affairs, while students can conveniently request and pay for these services through the Fees Portal. The system is designed with fallback mechanisms to ensure reliability and proper error handling for a robust user experience.

