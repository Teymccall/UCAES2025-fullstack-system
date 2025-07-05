import mongoose, { Schema, model, models } from 'mongoose';

// Check if running on server or client
const isServer = typeof window === 'undefined';

// Student schema tailored for the student portal
const studentSchema = new Schema({
  // Personal Information
  surname: {
    type: String,
    required: [true, 'Surname is required'],
    uppercase: true
  },
  otherNames: {
    type: String,
    required: [true, 'Other names are required'],
    uppercase: true
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    lowercase: true,
    enum: ['male', 'female']
  },
  dateOfBirth: {
    type: String,
    required: [true, 'Date of birth is required']
  },
  placeOfBirth: {
    type: String,
    uppercase: true
  },
  nationality: {
    type: String,
    uppercase: true
  },
  religion: {
    type: String,
    uppercase: true
  },
  maritalStatus: {
    type: String,
    lowercase: true
  },
  nationalId: {
    type: String,
    uppercase: true
  },
  ssnitNumber: {
    type: String,
    uppercase: true
  },
  physicalChallenge: {
    type: String,
    lowercase: true
  },
  
  // Student ID info
  studentIndexNumber: String,
  indexNumber: {
    type: String,
    required: [true, 'Index number is required']
  },
  adminStudentId: String, // UCAES ID format
  profilePictureUrl: String,
  
  // Contact Details
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required']
  },
  street: String,
  city: String,
  country: String,
  
  // Guardian Details
  guardianName: String,
  relationship: String,
  guardianContact: String,
  guardianEmail: String,
  guardianAddress: String,
  
  // Academic Information
  programme: {
    type: String,
    required: [true, 'Programme is required']
  },
  programType: String,
  programDuration: Number,
  yearOfEntry: String,
  entryQualification: String,
  entryLevel: String,
  currentLevel: {
    type: String,
    required: [true, 'Current level is required']
  },
  hallOfResidence: String,
  
  // Registration Status
  registrationDate: Date,
  status: {
    type: String,
    default: 'active'
  },
  yearOfCompletion: String,
  
  // Portal specific fields
  lastLogin: Date,
  passwordResetRequired: {
    type: Boolean,
    default: false
  }
});

// Add indexes for performance - only run server-side
if (isServer) {
  studentSchema.index({ email: 1 });
  studentSchema.index({ indexNumber: 1 }, { unique: true });
  studentSchema.index({ studentIndexNumber: 1 });
  studentSchema.index({ adminStudentId: 1 });
}

// Fix for Next.js with mongoose model creation
export const Student = isServer 
  ? (mongoose.models.Student || mongoose.model('Student', studentSchema, 'students'))
  : null;

// Function to get a student by index number
export async function getStudentByIndexNumber(indexNumber: string) {
  // No isServer check - always attempt to get the student
  
  try {
    // Connect directly to student_system database without checking env variables
    const uri = 'mongodb://localhost:27017/student_system';
    console.log("Connecting to MongoDB using direct URI:", uri);
    
    // Ensure there's a MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log("MongoDB not connected, connecting now...");
      await mongoose.connect(uri);
    } else {
      console.log("MongoDB already connected");
    }
    
    // Create the model if it doesn't exist yet
    const StudentModel = mongoose.models.Student || 
      mongoose.model('Student', studentSchema, 'students');
    
    // Find student by index number
    return await StudentModel.findOne({ indexNumber });
  } catch (error) {
    console.error("Error fetching student by index number:", error);
    throw error;
  }
}

// Function to verify student credentials
export async function verifyStudentCredentials(studentId: string, dateOfBirth: string) {
  try {
    // Connect directly to student_system database without checking env variables
    const uri = 'mongodb://localhost:27017/student_system';
    console.log("Connecting to MongoDB for verification using direct URI:", uri);
    console.log("Trying to verify student with ID:", studentId);
    
    // Ensure there's a MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log("MongoDB not connected, connecting now...");
      await mongoose.connect(uri);
    } else {
      console.log("MongoDB already connected");
    }
    
    // Normalize the student ID - remove any spaces and convert to uppercase
    const normalizedStudentId = studentId.trim().toUpperCase();
    console.log("Normalized ID for lookup:", normalizedStudentId);
    
    // Create the model if it doesn't exist yet
    const StudentModel = mongoose.models.Student || 
      mongoose.model('Student', studentSchema, 'students');
    
    // First try indexNumber
    let student = await StudentModel.findOne({ indexNumber: normalizedStudentId });
    console.log("Found by indexNumber:", student ? "Yes" : "No");
    
    // If not found, try studentIndexNumber
    if (!student) {
      student = await StudentModel.findOne({ studentIndexNumber: normalizedStudentId });
      console.log("Found by studentIndexNumber:", student ? "Yes" : "No");
    }
    
    // If still not found, try adminStudentId
    if (!student) {
      student = await StudentModel.findOne({ adminStudentId: normalizedStudentId });
      console.log("Found by adminStudentId:", student ? "Yes" : "No");
    }
    
    // If no student found with any ID
    if (!student) {
      console.error("Student not found with any ID matching:", normalizedStudentId);
      console.error("Available fields tried: indexNumber, studentIndexNumber, adminStudentId");
      throw new Error("Student not found. Please check your Student ID.");
    }
    
    console.log("Student found with data:", {
      indexNumber: student.indexNumber,
      studentIndexNumber: student.studentIndexNumber,
      adminStudentId: student.adminStudentId,
      dateOfBirth: student.dateOfBirth
    });
    
    console.log("Comparing dates - Input DOB:", dateOfBirth, "Student DOB:", student.dateOfBirth);
    
    // Check if the dateOfBirth format matches
    if (student.dateOfBirth !== dateOfBirth) {
      console.error("Date of birth mismatch for student:", normalizedStudentId);
      console.error("Expected:", student.dateOfBirth, "Received:", dateOfBirth);
      throw new Error("Invalid date of birth. Please check your credentials.");
    }
    
    // Update last login time
    student.lastLogin = new Date();
    await student.save();
    
    console.log("Student verification successful");
    return student;
  } catch (error) {
    console.error("Error verifying student credentials:", error);
    throw error;
  }
}

export default Student; 