import { mongoose, Schema, isServer, createModel } from './model-utils';

const academicYearSchema = new Schema({
  year: {
    type: String,
    required: [true, 'Academic year is required']
    // Removed unique: true to avoid duplicate index warning (handled by .index() below)
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
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
  academicYearSchema.index({ year: 1 }, { unique: true });
  academicYearSchema.index({ status: 1 });
}

// Add pre-save hook to update the updatedAt field
academicYearSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create and export the model
export const AcademicYear = createModel('AcademicYear', academicYearSchema, 'academicYears');

export default AcademicYear;