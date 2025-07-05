import { mongoose, Schema, isServer, createModel } from './model-utils';

const courseSchema = new Schema({
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Course name is required']
  },
  description: {
    type: String
  },
  credits: {
    type: Number,
    required: [true, 'Course credits are required'],
    min: 1
  },
  level: {
    type: Number,
    required: [true, 'Course level is required']
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    enum: [1, 2, 3] // Allow for trimester systems
  },
  faculty: {
    type: String,
    required: [true, 'Faculty is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required']
  },
  prerequisites: [{
    type: String,
    ref: 'Course'
  }],
  corequisites: [{
    type: String,
    ref: 'Course'
  }],
  programs: [{
    type: Schema.Types.ObjectId,
    ref: 'Program'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'discontinued'],
    default: 'active'
  },
  courseType: {
    type: String,
    enum: ['core', 'elective'],
    required: true,
  },
  specialization: {
    type: String, // e.g., 'Agronomy', 'Animal Science'
    trim: true,
  },
  instructors: [{
    type: Schema.Types.ObjectId,
    ref: 'Staff'
  }],
  learningOutcomes: [String],
  assessmentMethod: {
    type: String
  },
  availableAcademicYear: {
    type: String,
    default: ''
  },
  availableSemester: {
    type: String,
    default: ''
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
  courseSchema.index({ code: 1 }, { unique: true });
  courseSchema.index({ name: 1 });
  courseSchema.index({ faculty: 1, department: 1 });
  courseSchema.index({ programs: 1 });
  courseSchema.index({ level: 1, semester: 1 });
  courseSchema.index({ status: 1 });
}

// Add pre-save hook to update the updatedAt field
courseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create and export the model
export const Course = createModel('Course', courseSchema, 'courses');

export default Course;