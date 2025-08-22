// Permission management system for role-based access control

/**
 * Available permissions in the system
 */
export const PERMISSIONS = {
  // Administrative permissions
  'full_access': 'Full system access (Director only)',
  'staff_management': 'Manage staff accounts',
  'system_settings': 'Access system settings',
  'audit_trail': 'View audit trail',
  
  // Academic management
  'academic_administration': 'Academic year and semester management',
  'course_management': 'Create and manage courses',
  'program_management': 'Manage academic programs',
  'student_records': 'Access student records',
  'student_management': 'Manage student information',
  
  // Financial management
  'finance_management': 'Full finance access',
  'fee_calculation': 'Calculate and set fees',
  'payment_processing': 'Process payments',
  'financial_reports': 'View financial reports',
  
  // Examination and results
  'exam_management': 'Manage examinations',
  'results_approval': 'Approve and publish results',
  'result_entry': 'Enter course results',
  'transcript_generation': 'Generate student transcripts',
  'degree_audit': 'Perform degree audits',
  'compliance_management': 'Manage regulatory compliance',
  
  // Admissions
  'admission_review': 'Review admission applications',
  'admission_approval': 'Approve/reject applications',
  
  // Course registration
  'registration_management': 'Manage course registrations',
  'registration_approval': 'Approve course registrations',
  
  // Daily operations
  'daily_reports': 'Submit daily reports',
  'lecturer_management': 'Manage lecturer accounts',
  
  // Dashboard access
  'view_dashboard': 'View dashboard and statistics'
} as const;

/**
 * Role-based permission assignments
 */
export const ROLE_PERMISSIONS = {
  'director': [
    'full_access',
    'staff_management',
    'system_settings',
    'audit_trail',
    'academic_administration',
    'course_management',
    'program_management',
    'student_records',
    'student_management',
    'finance_management',
    'fee_calculation',
    'payment_processing',
    'financial_reports',
    'exam_management',
    'results_approval',
    'result_entry',
    'transcript_generation',
    'admission_review',
    'admission_approval',
    'registration_management',
    'registration_approval',
    'daily_reports',
    'lecturer_management',
    'view_dashboard'
  ],
  
  'finance_officer': [
    'finance_management',
    'fee_calculation',
    'payment_processing',
    'financial_reports',
    'student_records', // Read-only for student info
    'daily_reports',
    'view_dashboard'
  ],
  
  'exam_officer': [
    'exam_management',
    'results_approval',
    'transcript_generation',
    'student_records',
    'daily_reports',
    'view_dashboard'
  ],
  
  'admissions_officer': [
    'admission_review',
    'admission_approval',
    'student_records',
    'daily_reports',
    'view_dashboard'
  ],
  
  'registrar': [
    'registration_management',
    'registration_approval',
    'student_records',
    'course_management', // Limited to registration-related course management
    // Extra access for program/course structure and academic actions
    'program_management',
    'student_management',
    'lecturer_management',
    'academic_administration',
    'transcript_generation',
    'degree_audit',
    'compliance_management',
    'exam_management', // Added for oversight
    'daily_reports',
    'view_dashboard', // For dashboard access
    // Additional permissions for comprehensive registrar access
    'results_approval', // For academic oversight
    'fee_calculation', // For fee-related academic decisions
    'admission_review', // For final admission approval
    'admission_approval' // For final admission decisions
  ],
  
  'staff': [
    'course_management', // Limited to assigned courses
    'result_entry', // Limited to assigned courses
    'student_records', // Limited to their students
    'daily_reports',
    'view_dashboard'
  ],
  
  'Lecturer': [
    'course_management', // Limited to assigned courses
    'result_entry', // Limited to assigned courses
    'student_records', // Limited to their students
    'daily_reports',
    'view_dashboard'
  ]
} as const;

/**
 * Get permissions for a specific role
 */
export function getPermissionsByRole(role: keyof typeof ROLE_PERMISSIONS): string[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  // Director with full_access can access everything
  if (userPermissions.includes('full_access')) {
    return true;
  }
  
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if a user has any of the required permissions
 */
export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  // Director with full_access can access everything
  if (userPermissions.includes('full_access')) {
    return true;
  }
  
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

/**
 * Get user-friendly role names
 */
export const ROLE_LABELS = {
  'director': 'Director',
  'finance_officer': 'Finance Officer',
  'exam_officer': 'Exam Officer',
  'admissions_officer': 'Admissions Officer',
  'registrar': 'Registrar',
  'staff': 'Staff Member',
  'Lecturer': 'Lecturer'
} as const;

/**
 * Get role label for display
 */
export function getRoleLabel(role: keyof typeof ROLE_LABELS): string {
  return ROLE_LABELS[role] || role;
}

/**
 * Role descriptions for staff management
 */
export const ROLE_DESCRIPTIONS = {
  'director': 'Full system access and administrative control',
  'finance_officer': 'Manages student fees, payments, and financial reports',
  'exam_officer': 'Manages examinations, approves results, and generates transcripts',
  'admissions_officer': 'Reviews and processes admission applications',
  'registrar': 'Comprehensive academic administration, student lifecycle management, and academic policy oversight',
  'staff': 'Basic staff member with limited course access',
  'Lecturer': 'Academic staff member with course teaching responsibilities'
} as const;

export type UserRole = keyof typeof ROLE_PERMISSIONS;
export type Permission = keyof typeof PERMISSIONS;
