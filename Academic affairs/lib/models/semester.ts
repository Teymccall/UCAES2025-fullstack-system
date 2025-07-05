import { mongoose, Schema, isServer, createModel } from './model-utils';

const semesterSchema = new Schema({
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    ref: 'AcademicYear'
  },
  name: {
    type: String,
    required: [true, 'Semester name is required']
  },
  number: {
    type: String,
    required: [true, 'Semester number is required'],
    enum: ['1', '2', '3']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  registrationStartDate: {
    type: Date
  },
  registrationEndDate: {
    type: Date
  },
  examStartDate: {
    type: Date
  },
  examEndDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed', 'upcoming'],
    default: 'upcoming'
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
  semesterSchema.index({ academicYear: 1, number: 1 }, { unique: true });
  semesterSchema.index({ status: 1 });
}

// Add pre-save hook to update the updatedAt field
semesterSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create and export the model
export const Semester = createModel('Semester', semesterSchema, 'semesters');

export default Semester; 