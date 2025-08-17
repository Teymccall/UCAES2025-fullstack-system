import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateSequentialApplicationId, createFirebaseUser, getApplicationDataByUserId } from '../utils/applicationUtils';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db } from '../firebase';
import { clearAllLocalData, clearUserData } from '../utils/clearLocalData';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'applicant' | 'staff' | 'admin';
  applicationId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role?: string) => Promise<boolean>;
  logout: () => void;
  clearLocalData: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('AuthContext: Firebase auth state changed:', firebaseUser?.email);
      
      if (firebaseUser) {
        // User is signed in - get basic user data
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'User',
          role: 'applicant' // Default role for admission website users
        };
        
        // ✅ FIXED: Try to get applicationId from user profile first
        try {
          const userProfileRef = doc(db, 'user-profiles', firebaseUser.uid);
          const userProfileDoc = await getDoc(userProfileRef);
          
          if (userProfileDoc.exists()) {
            const profileData = userProfileDoc.data();
            userData.applicationId = profileData.applicationId;
            console.log('AuthContext: Found user profile with ApplicationId:', profileData.applicationId);
          } else {
            // Fallback: check for existing application data (for backward compatibility)
            const applicationData = await getApplicationDataByUserId(firebaseUser.uid);
            if (applicationData) {
              userData.applicationId = applicationData.applicationId;
              console.log('AuthContext: Found legacy application data. ApplicationId:', applicationData.applicationId);
            } else {
              console.log('AuthContext: No application data found for user');
            }
          }
        } catch (error) {
          console.error('AuthContext: Error fetching user data:', error);
        }
        
        console.log('AuthContext: Setting user from Firebase:', userData);
        setUser(userData);
        // Don't store user data in localStorage - rely only on Firebase
      } else {
        // User is signed out
        console.log('AuthContext: User signed out');
        setUser(null);
        // Clear any existing localStorage data
        clearUserData();
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log("🔄 Attempting Firebase login...");
      
      // Use Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log("✅ Firebase login successful:", firebaseUser.email);
      
      // User will be set by the auth state listener
      return true;
    } catch (error: any) {
      console.error("❌ Firebase login error:", error);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later');
      } else {
        throw new Error('Login failed. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role = 'applicant'): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log("🔄 Creating Firebase user account...");
      
      // Create Firebase user account
      const userId = await createFirebaseUser(email, password, name);
      
      let applicationId: string | undefined;
      
      if (role === 'applicant') {
        applicationId = await generateSequentialApplicationId();
        
        // ✅ FIXED: Only store user profile, don't create application record
        await setDoc(doc(db, 'user-profiles', userId), {
          applicationId,
          email,
          name,
          role: 'applicant',
          createdAt: serverTimestamp()
        });
        
        console.log("✅ User profile created with Application ID:", applicationId);
        console.log("🔧 WORKFLOW FIX: Application record will be created only when user submits application");
        console.log("🎯 This prevents draft applications from appearing in staff dashboard");
      }
      
      console.log("✅ Registration successful. User will be automatically logged in.");
      
      // User will be set by the auth state listener
      return true;
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use a stronger password');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection');
      } else {
        throw new Error('Registration failed. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log("🔄 Signing out from Firebase...");
      await signOut(auth);
      console.log("✅ Sign out successful");
      // User state will be cleared by the auth state listener
    } catch (error) {
      console.error("❌ Sign out error:", error);
    }
  };

  const clearLocalData = () => {
    clearAllLocalData();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, clearLocalData, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};