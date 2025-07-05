# UCAES Lecturer Portal

A comprehensive lecturer portal for the University College of Agriculture and Environmental Studies, built with Next.js 15, TypeScript, Tailwind CSS, and Firebase.

## Features

### 🎯 Core Functionality
- **Dashboard**: Overview of assigned courses, pending grades, and recent activity
- **Course Management**: View assigned courses and enrolled students
- **Grade Submission**: Submit and manage student grades with approval workflow
- **Announcements**: Create and manage announcements for students

### 🔧 Technical Features
- **Next.js 15**: Latest App Router with Server Components
- **TypeScript**: Full type safety throughout the application
- **Firebase Integration**: Real-time database with Firestore
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Security**: Role-based access control and audit logging

### 🎨 Design System
- **Color Scheme**: Green (#15803d) and white (#ffffff) branding
- **Typography**: Inter font family
- **Components**: shadcn/ui component library
- **Icons**: Lucide React icons
- **Layout**: Collapsible sidebar with top navigation

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd ucaes-lecturer-portal
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Authentication
   - Update `lib/firebase.ts` with your Firebase configuration

4. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   Add your Firebase configuration to `.env.local`

5. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   Navigate to [http://localhost:3000/lecturer](http://localhost:3000/lecturer)

## Project Structure

\`\`\`
├── app/
│   ├── lecturer/                 # Lecturer portal pages
│   │   ├── page.tsx             # Dashboard
│   │   ├── courses/             # Course management
│   │   ├── grade-submission/    # Grade submission
│   │   ├── announcements/       # Announcements
│   │   └── layout.tsx           # Lecturer layout
│   └── globals.css              # Global styles
├── components/
│   ├── lecturer/                # Lecturer-specific components
│   │   ├── sidebar.tsx          # Navigation sidebar
│   │   ├── top-bar.tsx          # Top navigation
│   │   └── ...                  # Other components
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── firebase.ts              # Firebase configuration
│   ├── types.ts                 # TypeScript types
│   └── sample-data.ts           # Sample data for development
└── ...
\`\`\`

## Firebase Collections

### Users
\`\`\`typescript
{
  id: string
  name: string
  email: string
  role: 'Lecturer' | 'Admin' | 'Student'
  assignedCourses?: string[]
  department?: string
}
\`\`\`

### Courses
\`\`\`typescript
{
  id: string
  code: string
  title: string
  semester: string
  level: number
  credits: number
  lecturerId: string
}
\`\`\`

### Students
\`\`\`typescript
{
  id: string
  indexNumber: string
  firstName: string
  lastName: string
  email: string
  level: number
  department: string
}
\`\`\`

### Grades
\`\`\`typescript
{
  id: string
  studentId: string
  courseId: string
  lecturerId: string
  grade: string
  remarks?: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
}
\`\`\`

### Registrations
\`\`\`typescript
{
  id: string
  studentId: string
  courseId: string
  semester: string
  status: 'Active' | 'Dropped' | 'Completed'
}
\`\`\`

## Key Features

### Dashboard
- Real-time statistics and metrics
- Recent activity feed
- Quick action buttons
- Announcements preview

### Course Management
- View assigned courses
- Filter by semester and level
- Student enrollment counts
- Direct access to grade submission

### Grade Submission
- Course and semester selection
- Student list with grade inputs
- CSV upload functionality
- Confirmation dialogs
- Audit trail logging

### Announcements
- Create new announcements
- Urgency levels (Normal, Important, Urgent)
- Target audience selection
- Real-time updates

## Security Features

- **Role-based Access**: Lecturers can only access their assigned courses
- **Audit Logging**: All actions are logged for accountability
- **Input Validation**: Client and server-side validation
- **CSRF Protection**: Built-in Next.js security features
- **Secure Headers**: Security headers configured

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
\`\`\`bash
npm run build
npm start
\`\`\`

## Development

### Adding New Features
1. Create components in `components/lecturer/`
2. Add pages in `app/lecturer/`
3. Update types in `lib/types.ts`
4. Add Firebase functions in `lib/firebase.ts`

### Testing
\`\`\`bash
npm run lint          # ESLint
npm run type-check    # TypeScript checking
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@ucaes.edu.gh
- Documentation: [Project Wiki]
- Issues: [GitHub Issues]

## Acknowledgments

- University College of Agriculture and Environmental Studies
- Next.js team for the amazing framework
- shadcn for the beautiful UI components
- Firebase for the backend infrastructure
