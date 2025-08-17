"use client"

import { ReactNode, createContext, useContext, useState, useEffect, useCallback } from "react"
import { loginStudent, logoutStudent, getCurrentStudent, type Student } from "@/lib/auth"
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Define the auth context type
interface AuthContextType {
  student: Student | null
  loading: boolean
  error: string | null
  login: (credentials: { studentId: string; dateOfBirth: string }) => Promise<Student>
  logout: () => void
  isAuthenticated: boolean
  refreshUserData: () => Promise<boolean>
  mounted: boolean
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  student: null,
  loading: true,
  error: null,
  login: async () => { throw new Error("Not implemented") },
  logout: () => {},
  isAuthenticated: false,
  refreshUserData: async () => false,
  mounted: false
})

// Export the auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Function to refresh user data from Firestore
  const refreshUserData = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    
    try {
      // Get current student from localStorage
      const currentStudent = getCurrentStudent();
      
      if (!currentStudent || !currentStudent.id) {
        console.log("No student data found to refresh");
        return false;
      }
      
      // Check both student-registrations and students collections
      console.log("Refreshing user data from Firestore for ID:", currentStudent.id);
      
      // First try with the registration ID
      let studentDoc = await getDoc(doc(db, "student-registrations", currentStudent.id));
      let freshData;
      
      if (studentDoc.exists()) {
        freshData = studentDoc.data();
        console.log("Found student data in student-registrations");
      } else {
        // Try students collection
        studentDoc = await getDoc(doc(db, "students", currentStudent.id));
        
        if (studentDoc.exists()) {
          freshData = studentDoc.data();
          console.log("Found student data in students collection");
        } else {
          // Try by email
          if (currentStudent.email) {
            const lowercaseEmail = currentStudent.email.toLowerCase();
            const studentQuery = query(
              collection(db, "students"),
              where("email", "==", lowercaseEmail),
              limit(1)
            );
            
            const querySnapshot = await getDocs(studentQuery);
            if (!querySnapshot.empty) {
              freshData = querySnapshot.docs[0].data();
              console.log("Found student data by email lookup");
            }
          }
          
          // Try by registration number
          if (!freshData && currentStudent.registrationNumber) {
            const regQuery = query(
              collection(db, "students"),
              where("registrationNumber", "==", currentStudent.registrationNumber),
              limit(1)
            );
            
            const querySnapshot = await getDocs(regQuery);
            if (!querySnapshot.empty) {
              freshData = querySnapshot.docs[0].data();
              console.log("Found student data by registration number lookup");
            }
          }
        }
      }
      
      // If we found data, update the student object
      if (freshData) {
        console.log("Fresh data found:", freshData);
        
        // Create updated student object with ALL properties from fresh data
        const updatedStudent: Student = {
          ...currentStudent,
          ...freshData,
          id: currentStudent.id,
          // Make sure critical fields are properly copied over
          surname: freshData.surname || currentStudent.surname,
          otherNames: freshData.otherNames || currentStudent.otherNames,
          email: freshData.email || currentStudent.email,
        };
        
        // Update localStorage with fresh data
        const sessionData = {
          isLoggedIn: true,
          studentId: currentStudent.id,
          sessionExpires: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
          studentData: updatedStudent
        };
        
        localStorage.setItem('studentSession', JSON.stringify(sessionData));
        
        // Update state
        setStudent(updatedStudent);
        console.log("User data refreshed successfully");
        return true;
      } else {
        console.log("No fresh data found for student");
        return false;
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return false;
    }
  }, []);

  // Check for existing session on mount and set up session check interval
  useEffect(() => {
    // Mark component as mounted
    setMounted(true);
    
    const checkSession = async () => {
      try {
        const studentData = getCurrentStudent()
        
        if (studentData) {
          setStudent(studentData)
          setIsAuthenticated(true)
          
          // Refresh data from Firestore when page loads
          // But don't update the state yet to avoid hydration errors
          setTimeout(() => {
            refreshUserData().catch(console.error);
          }, 1000);
        } else {
          setStudent(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Error checking session:", error)
        // If there's an error with the session, clear it
        setStudent(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    // Initial session check - use setTimeout to avoid hydration issues
    if (typeof window !== 'undefined') {
      setTimeout(checkSession, 0);
    } else {
      setLoading(false);
    }
    
    // Set up an interval to periodically check the session (every 5 minutes)
    let sessionCheckInterval: NodeJS.Timeout | null = null;
    if (typeof window !== 'undefined') {
      sessionCheckInterval = setInterval(() => {
        if (isAuthenticated) {
          refreshUserData().catch(console.error);
        }
      }, 5 * 60 * 1000);
    }
    
    // Clean up the interval on component unmount
    return () => {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
    };
  }, [refreshUserData, isAuthenticated]);

  // Login handler
  const login = async (credentials: { studentId: string; dateOfBirth: string }): Promise<Student> => {
    setLoading(true)
    setError(null)

    try {
      // Call the loginStudent function from auth.ts
      const studentData = await loginStudent(credentials)
      setStudent(studentData)
      setIsAuthenticated(true)
      return studentData
    } catch (err: any) {
      setError(err.message || "Authentication failed")
      setStudent(null)
      setIsAuthenticated(false)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Logout handler
  const logout = (): void => {
    setLoading(true)
    
    try {
      logoutStudent()
      setStudent(null)
      setIsAuthenticated(false)
    } catch (err: any) {
      console.error("Logout error:", err)
      setError(err.message || "Logout failed")
    } finally {
      setLoading(false)
    }
  }

  // Provide the auth context to children
  return (
    <AuthContext.Provider value={{
      student,
      loading,
      error,
      login,
      logout,
      isAuthenticated,
      refreshUserData,
      mounted
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Export a hook to use the auth context
export const useAuth = () => useContext(AuthContext) 