# UCAES Grading Workflow Guide

## Overview
This document outlines the complete grading workflow from lecturers submitting grades to director approval and publication.

## System Architecture

### 1. Lecturers Platform (`LECTURE PLATFORM/`)
**Location**: `app/lecturer/grade-submission/page.tsx`

**Features**:
- Course and semester selection
- Student grade entry (Assessment 10%, Mid-semester 20%, Final Exam 70%)
- Automatic grade calculation
- Grade submission to director for review
- Submission history tracking

**Grade Components**:
- **Assessment & Practicals**: 10% (0-10 points)
- **Mid-semester Exam**: 20% (0-20 points)  
- **Final Exam**: 70% (0-70 points)
- **Total**: 100% (0-100 points)

**Grade Scale**:
- A: 80-100
- B+: 75-79
- B: 70-74
- C+: 65-69
- C: 60-64
- D+: 55-59
- D: 50-54
- E: 45-49
- F: 0-44

### 2. Academic Affairs Director Panel (`Academic affairs/`)
**Location**: `app/director/results/page.tsx`

**Features**:
- Review pending grade submissions
- Approve or reject submissions
- Publish approved results
- Export grades to CSV
- Real-time notifications for new submissions

## Database Collections

### Grade Submissions
**Collection**: `grade-submissions`
```typescript
{
  submissionId: string,
  submittedBy: string, // lecturerId
  courseId: string,
  courseCode: string,
  courseName: string,
  academicYear: string,
  semester: string,
  submissionDate: Timestamp,
  status: 'pending_approval' | 'approved' | 'published',
  approvedBy?: string,
  approvedDate?: Timestamp,
  grades: GradeObject[],
  totalStudents: number,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Individual Student Grades
**Collection**: `student-grades`
```typescript
{
  studentId: string,
  courseId: string,
  courseCode: string,
  courseName: string,
  lecturerId: string,
  academicYear: string,
  semester: string,
  assessment: number,
  midsem: number,
  exams: number,
  total: number,
  grade: string,
  status: 'pending_approval' | 'approved' | 'published',
  submissionId: string,
  submittedAt: Timestamp,
  createdAt: Timestamp
}
```

## Workflow Steps

### 1. Lecturer Grade Entry
1. Lecturer logs into the platform
2. Selects academic year, semester, and course
3. System loads registered students for the course
4. Lecturer enters grades for each component:
   - Assessment & Practicals (0-10)
   - Mid-semester Exam (0-20)
   - Final Exam (0-70)
5. System automatically calculates total and letter grade
6. Lecturer reviews and submits grades

### 2. Grade Submission Process
1. Grades are saved to `grade-submissions` collection
2. Individual student grades are saved to `student-grades` collection
3. Status is set to `pending_approval`
4. Director receives notification of new submission

### 3. Director Review Process
1. Director accesses the Results Approval panel
2. Views pending grade submissions
3. Reviews individual student grades
4. Can approve, reject, or request changes
5. Approved submissions can be published

### 4. Result Publication
1. Director publishes approved results
2. Status changes to `published`
3. Results become visible to students
4. Grades are finalized and cannot be modified

## Status Flow

```
Submitted → Pending Approval → Approved → Published
    ↓              ↓              ↓           ↓
Lecturer    Director Review   Director    Final
Submits     Required         Approves    Published
```

## Key Features

### For Lecturers
- ✅ Real-time grade calculation
- ✅ Submission history tracking
- ✅ Course and student validation
- ✅ Grade component validation
- ✅ Bulk grade submission

### For Directors
- ✅ Real-time notifications
- ✅ Comprehensive review interface
- ✅ Approval/rejection workflow
- ✅ CSV export functionality
- ✅ Status tracking
- ✅ Student information display

## Security & Validation

### Lecturer Validation
- Only assigned lecturers can grade courses
- Student must be registered for the course
- Grade components must be within valid ranges
- All required fields must be completed

### Director Validation
- Only directors can approve/publish results
- Full audit trail of all actions
- Cannot modify published results
- Export functionality for record keeping

## Recent Improvements

### Added Features
1. **Submission History**: Lecturers can view their submission history
2. **Real-time Notifications**: Directors get alerts for new submissions
3. **Status Indicators**: Clear visual status indicators
4. **Refresh Functionality**: Manual refresh for latest data
5. **Enhanced UI**: Better user experience with improved interfaces

### Technical Improvements
1. **TypeScript Types**: Fixed all linter errors in system-config.ts
2. **Error Handling**: Improved error handling and user feedback
3. **Data Validation**: Enhanced validation for grade submissions
4. **Performance**: Optimized database queries and data loading

## Usage Instructions

### For Lecturers
1. Navigate to `/lecturer/grade-submission`
2. Select academic year, semester, and course
3. Enter grades for each student
4. Review calculated totals and letter grades
5. Submit for director approval
6. Check submission history for status updates

### For Directors
1. Navigate to `/director/results`
2. Review pending submissions
3. Click on submissions to view detailed grades
4. Approve or reject submissions
5. Publish approved results
6. Export data as needed

## Troubleshooting

### Common Issues
1. **Grades not calculating**: Check that all components are within valid ranges
2. **Students not loading**: Verify course assignment and registration
3. **Submission failed**: Check internet connection and try again
4. **Status not updating**: Refresh the page to see latest status

### Support
For technical issues, contact the system administrator.
For academic issues, contact the academic affairs office. 