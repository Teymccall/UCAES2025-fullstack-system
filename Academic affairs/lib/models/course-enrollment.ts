import { mongoose, Schema, isServer, createModel } from './model-utils';

const courseEnrollmentSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    required: [true, 'Student ID is required'],
    ref: 'Student'
  },
  course: {
    type: Schema.Types.ObjectId,
    required: [true, 'Course ID is required'],
    ref: 'Course'
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    ref: 'AcademicYear'
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    ref: 'Semester'
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'withdrawn', 'completed'],
    default: 'pending'
  },
  grade: {
    type: String
  },
  marks: {
    type: Number
  },
  attendance: {
    type: Number,
    min: 0,
    max: 100
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Staff'
  },
  approvalDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for performance - only run server-side
if (isServer) {
  courseEnrollmentSchema.index({ student: 1, course: 1, academicYear: 1, semester: 1 }, { unique: true });
  courseEnrollmentSchema.index({ student: 1 });
  courseEnrollmentSchema.index({ course: 1 });
  courseEnrollmentSchema.index({ academicYear: 1, semester: 1 });
  courseEnrollmentSchema.index({ status: 1 });
}

// Add pre-save hook to update the updatedAt field
courseEnrollmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create and export the model
export const CourseEnrollment = createModel('CourseEnrollment', courseEnrollmentSchema, 'courseEnrollments');

export default CourseEnrollment; 