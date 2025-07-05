import { mongoose, Schema, isServer, createModel } from './model-utils';

const programSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Program name is required']
    // Removed unique: true to avoid duplicate index warning (handled by .index() below)
  },
  code: {
    type: String,
    required: [true, 'Program code is required']
    // Removed unique: true to avoid duplicate index warning (handled by .index() below)
    ,
    uppercase: true
  },
  faculty: {
    type: String,
    required: [true, 'Faculty is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  type: {
    type: String,
    enum: ['degree', 'diploma', 'certificate', 'master', 'phd'],
    required: [true, 'Program type is required']
  },
  description: {
    type: String
  },
  durationYears: {
    type: Number,
    required: [true, 'Program duration is required'],
    min: 1
  },
  credits: {
    type: Number,
    required: [true, 'Total credits is required'],
    min: 1
  },
  entryRequirements: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'discontinued'],
    default: 'active'
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
  programSchema.index({ code: 1 }, { unique: true });
  programSchema.index({ name: 1 }, { unique: true });
  programSchema.index({ faculty: 1, department: 1 });
  programSchema.index({ status: 1 });
}

// Add pre-save hook to update the updatedAt field
programSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create and export the model
export const Program = createModel('Program', programSchema, 'programs');

export default Program;