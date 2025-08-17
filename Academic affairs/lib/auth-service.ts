import 'server-only';
import { connectToDatabase, mongoose } from './mongodb';
import bcrypt from 'bcryptjs';
import User from './models/user';

// Database name
const dbName = "academic_affairs";

/**
 * User interface representing a staff member
 */
export interface User {
  uid: string;
  username: string;
  name: string;
  email: string;
  role: "director" | "staff" | "Lecturer" | "finance_officer" | "exam_officer" | "admissions_officer" | "registrar";
  department?: string;
  position?: string;
  assignedCourses?: string[];
  permissions: string[];
  status: "active" | "inactive" | "suspended";
  sessionToken?: string;
  lastLogin?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Authenticate a user with username and password
 */
export async function authenticateUser(username: string, password: string): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  try {
    // Connect to database (this initializes mongoose)
    await connectToDatabase();
    
    // Find user by username using mongoose model
    const user = await User.findOne({ username });
    
    if (!user) {
      return {
        success: false,
        error: "Invalid username or password. Please check your credentials and try again."
      };
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return {
        success: false,
        error: "Invalid username or password. Please check your credentials and try again."
      };
    }
    
    // Check if user is active
    if (user.status !== "active") {
      return {
        success: false,
        error: "Your account is not active. Please contact the administrator."
      };
    }
    
    // Generate a new session token
    const sessionToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Update last login timestamp and session token
    user.lastLogin = new Date();
    user.updatedAt = new Date();
    user.sessionToken = sessionToken;
    await user.save();
    
    // Convert MongoDB document to User interface
    const formattedUser: User = {
      uid: user.uid,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      assignedCourses: user.assignedCourses,
      permissions: user.permissions,
      status: user.status,
      sessionToken: sessionToken,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    return {
      success: true,
      user: formattedUser
    };
  } catch (error: any) {
    console.error("Authentication error:", error);
    return {
      success: false,
      error: "Authentication failed. Please try again later."
    };
  }
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    await connectToDatabase();
    
    // Find user by username using mongoose model
    const user = await User.findOne({ username });
    
    if (!user) {
      return null;
    }
    
    // Convert MongoDB document to User interface
    const formattedUser: User = {
      uid: user.uid,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      assignedCourses: user.assignedCourses,
      permissions: user.permissions,
      status: user.status,
      sessionToken: user.sessionToken,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    return formattedUser;
  } catch (error) {
    console.error("Error getting user by username:", error);
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(
  email: string,
  password: string,
  userData: Omit<User, 'uid' | 'createdAt' | 'updatedAt'>
): Promise<User | null> {
  try {
    await connectToDatabase();
    
    // Check if username already exists using mongoose model
    const existingUser = await User.findOne({ 
      $or: [
        { username: userData.username },
        { email }
      ]
    });
    
    if (existingUser) {
      console.error("User already exists with this username or email");
      return null;
    }
    
    // Generate a unique ID
    const uid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user document using mongoose model
    const newUser = new User({
      uid,
      ...userData,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Save to database
    await newUser.save();
    
    // Return user without password
    const userObject = newUser.toObject();
    delete userObject.password;
    return userObject as User;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

/**
 * Update an existing user
 */
export async function updateUser(
  uid: string,
  userData: Partial<User>
): Promise<User | null> {
  try {
    await connectToDatabase();
    
    // Find and update user by uid using mongoose model
    const updatedUser = await User.findOneAndUpdate(
      { uid },
      { 
        ...userData, 
        updatedAt: new Date() 
      },
      { new: true }
    );
    
    if (!updatedUser) {
      console.error("User not found");
      return null;
    }
    
    // Convert MongoDB document to User interface
    const userObject = updatedUser.toObject();
    delete userObject.password;
    return userObject as User;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}

/**
 * Delete a user
 */
export async function deleteUser(uid: string): Promise<boolean> {
  try {
    await connectToDatabase();
    
    // Delete user by uid using mongoose model
    const result = await User.deleteOne({ uid });
    
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    await connectToDatabase();
    
    // Get all users using mongoose model
    const users = await User.find({});
    
    // Convert MongoDB documents to User interface
    return users.map(user => {
      const userObj = user.toObject();
      delete userObj.password;
      return userObj as User;
    });
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
} 