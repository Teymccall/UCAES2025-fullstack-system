# UCAES Fees Portal

A comprehensive fees and payments portal for the University College of Agriculture and Environmental Studies, built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

### Student Fees Portal
- **Dashboard Overview**: Fees status and payment summary
- **My Fees Page**: Detailed breakdown of all fees and charges
- **Payment Submission**: Upload receipts for bank transfers and mobile money
- **Payment History**: Track all payment transactions and status
- **Real-time Updates**: Live fee balance and payment verification status
- **Responsive Design**: Mobile-friendly interface optimized for all devices

### Key Portal Features
- **Secure Authentication**: Student ID + Date of Birth login system
- **Fee Management**: View, track, and pay university fees
- **Payment Tracking**: Monitor payment status and verification
- **Receipt Management**: Upload and download payment receipts
- **Notifications**: Real-time alerts for payment status updates
- **Audit Trail**: Complete history of all fee-related activities

### Admin Panel
- **Payment Verification**: Review and approve/reject student payments
- **Student Management**: Monitor all student fee statuses
- **Overview Dashboard**: Key metrics and statistics
- **Bulk Operations**: Efficient payment processing
- **Reporting**: Generate payment reports

### Key Components
- **Authentication**: Student ID + Date of Birth login
- **Firebase Integration**: Real-time data synchronization
- **File Upload**: Secure receipt storage
- **Notifications**: Status updates and alerts
- **Audit Logging**: Track all system activities

## Technology Stack

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **Backend**: Firebase (Firestore + Storage)
- **Language**: TypeScript
- **Font**: Inter

## Color Scheme

- **Primary Green**: #15803d
- **Background**: #ffffff
- **Status Colors**: Green (paid), Yellow (partial), Red (overdue)

## Installation

1. **Download the code** using the "Download Code" button
2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`
3. **Set up Firebase**:
   - Create a Firebase project
   - Enable Firestore and Storage
   - Update `lib/firebase.ts` with your config
4. **Run the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx                 # Updated dashboard
│   ├── fees/page.tsx           # Student fees page
│   ├── admin/fees/page.tsx     # Admin payment management
│   └── login/page.tsx          # Authentication
├── components/
│   ├── student/fees/           # Student fee components
│   └── admin/fees/             # Admin fee components
├── lib/
│   ├── firebase.ts             # Firebase configuration
│   └── types.ts                # TypeScript definitions
└── data/
    └── sample-data.json        # Demo data
\`\`\`

## Demo Credentials

**Student Login:**
- Student ID: `AG/2021/001234`
- Date of Birth: `2000-01-15`

## Firebase Collections

### Required Collections:
- `students` - Student information
- `fees` - Fee records per student
- `payments` - Payment transactions
- `users` - User authentication
- `auditLogs` - System activity logs
- `announcements` - System notifications

### Sample Document Structure:

**fees/{studentId}**
\`\`\`json
{
  "studentId": "AG/2021/001234",
  "totalTuition": 5000,
  "paidAmount": 3000,
  "outstandingBalance": 2000,
  "status": "partial",
  "dueDate": "2025-06-01",
  "categories": [...]
}
\`\`\`

**fees/{studentId}/payments/{paymentId}**
\`\`\`json
{
  "id": "pay_001",
  "date": "2025-01-15",
  "category": "tuition",
  "amount": 1500,
  "method": "bank",
  "status": "verified",
  "reference": "TXN123456789",
  "receiptUrl": "/receipts/receipt1.pdf"
}
\`\`\`

## Features Implementation

### Student Features
1. **Account Balance Display** - Real-time fee status
2. **Payment Categories** - Tuition, Hostel, Library, Other
3. **Payment History** - Complete transaction records
4. **Payment Submission** - Upload receipts with validation
5. **Status Tracking** - Pending/Verified/Rejected status

### Admin Features
1. **Payment Verification** - Review submitted payments
2. **Student Overview** - Monitor all student fees
3. **Bulk Operations** - Efficient payment processing
4. **Reporting** - Generate detailed reports
5. **Dashboard Metrics** - Key performance indicators

### Security Features
1. **File Validation** - Type and size restrictions
2. **Audit Logging** - Track all activities
3. **Role-based Access** - Student/Admin permissions
4. **Secure Upload** - Firebase Storage integration

## Customization

### Colors
Update `tailwind.config.ts` to modify the color scheme:
\`\`\`typescript
primary: {
  DEFAULT: "#15803d", // University green
  foreground: "#ffffff",
}
\`\`\`

### Bank Details
Update bank information in the payment form component or Firebase configuration.

### File Upload Limits
Modify file size and type restrictions in the payment form validation.

## Deployment

1. **Build the project**:
   \`\`\`bash
   npm run build
   \`\`\`
2. **Deploy to Vercel**:
   - Connect your GitHub repository
   - Add Firebase environment variables
   - Deploy with one click

## Support

For technical support or customization requests, please contact the development team.

## License

This project is developed for the University College of Agriculture and Environmental Studies.
