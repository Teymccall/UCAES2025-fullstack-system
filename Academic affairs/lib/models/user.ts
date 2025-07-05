import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Define the User schema
const UserSchema: Schema = new Schema({
  uid: {
    type: String,
    default: () => uuidv4(),
    required: true
    // Removed unique: true to avoid duplicate index warning (handled by .index() in other models if needed)
  },
  username: {
    type: String,
    required: true,
    // Removed unique: true to avoid duplicate index warning (handled by .index() in other models if needed)
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    // Removed unique: true to avoid duplicate index warning (handled by .index() in other models if needed)
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['director', 'staff', 'admin'],
    default: 'director',
    required: true
  },
  department: {
    type: String,
    default: 'Academic Affairs',
    required: true
  },
  position: {
    type: String,
    default: 'Academic Director'
  },
  permissions: {
    type: [String],
    default: [
      'full_access', 
      'staff_management', 
      'course_management', 
      'student_management',
      'result_management', 
      'academic_management', 
      'system_settings', 
      'audit_trail'
    ]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  sessionToken: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Check if the model is already compiled and export it, otherwise compile and export
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);