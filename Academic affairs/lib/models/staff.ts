import { mongoose, Schema, isServer, createModel } from './model-utils';

const staffSchema = new Schema({
  staffId: {
    type: String,
    required: [true, 'Staff ID is required']
    // Removed unique: true to avoid duplicate index warning (handled by .index() below)
  },
  title: {
    type: String,
    enum: ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'],
    required: [true, 'Title is required']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required']
  },
  otherNames: {
    type: String
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: [true, 'Gender is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required']
    // Removed unique: true to avoid duplicate index warning (handled by .index() below)
    ,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  faculty: {
    type: String,
    required: [true, 'Faculty is required']
  },
  position: {
    type: String,
    required: [true, 'Position is required']
  },
  dateOfBirth: {
    type: Date
  },
  dateOfEmployment: {
    type: Date,
    required: [true, 'Date of employment is required']
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  expertise: [String],
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave', 'terminated'],
    default: 'active'
  },
  role: {
    type: String,
    enum: ['lecturer', 'assistant-lecturer', 'professor', 'director', 'admin'],
    required: [true, 'Role is required']
  },
  profilePicture: {
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
  staffSchema.index({ staffId: 1 }, { unique: true });
  staffSchema.index({ email: 1 }, { unique: true });
  staffSchema.index({ department: 1, faculty: 1 });
  staffSchema.index({ status: 1 });
  staffSchema.index({ role: 1 });
}

// Add pre-save hook to update the updatedAt field
staffSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for full name
staffSchema.virtual('fullName').get(function() {
  return `${this.title} ${this.firstName} ${this.lastName}`;
});

// Create and export the model
export const Staff = createModel('Staff', staffSchema, 'staff');

export default Staff;