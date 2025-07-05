import { mongoose, Schema, isServer, createModel } from './model-utils';

const resultSchema = new Schema({
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
  marks: {
    classWork: {
      type: Number,
      min: 0,
      max: 100
    },
    midTerm: {
      type: Number,
      min: 0,
      max: 100
    },
    finalExam: {
      type: Number,
      min: 0,
      max: 100
    },
    total: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  grade: {
    type: String
  },
  gradePoint: {
    type: Number,
    min: 0,
    max: 4.0
  },
  status: {
    type: String,
    enum: ['submitted', 'approved', 'rejected', 'published'],
    default: 'submitted'
  },
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Staff',
    required: [true, 'Submitted by is required']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Staff'
  },
  approvedAt: {
    type: Date
  },
  remarks: {
    type: String
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
  resultSchema.index({ student: 1, course: 1, academicYear: 1, semester: 1 }, { unique: true });
  resultSchema.index({ student: 1 });
  resultSchema.index({ course: 1 });
  resultSchema.index({ academicYear: 1, semester: 1 });
  resultSchema.index({ status: 1 });
  resultSchema.index({ submittedBy: 1 });
}

// Add pre-save hook to update the updatedAt field
resultSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create and export the model
export const Result = createModel('Result', resultSchema, 'results');

export default Result; 