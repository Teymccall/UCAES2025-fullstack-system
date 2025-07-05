"use client"

import { useState, useEffect, useCallback } from "react"
import { loginStudent, logoutStudent, getCurrentStudent, type Student } from "@/lib/auth"
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface UseAuthReturn {
  student: Student | null
  loading: boolean
  error: string | null
  login: (credentials: { studentId: string; dateOfBirth: string }) => Promise<Student>
  logout: () => void
  isAuthenticated: boolean
  refreshUserData: () => Promise<boolean>
}

export const useAuth = (): UseAuthReturn => {
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Function to refresh user data from Firestore
  const refreshUserData = useCallback(async (): Promise<boolean> => {
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
      
      // If not found by ID, try finding by email or student number
      if (!studentDoc.exists() && currentStudent.email) {
        console.log("Trying to find student by email:", currentStudent.email);
        
        // Try students collection by email
        const studentsRef = collection(db, "students");
        const emailQuery = query(studentsRef, where("email", "==", currentStudent.email.toLowerCase()), limit(1));
        const querySnapshot = await getDocs(emailQuery);
        
        if (!querySnapshot.empty) {
          studentDoc = querySnapshot.docs[0];
          freshData = studentDoc.data();
          console.log("Found student by email in students collection");
        } else if (currentStudent.studentIndexNumber) {
          // Try by student index number
          console.log("Trying to find student by index number:", currentStudent.studentIndexNumber);
          const indexQuery = query(studentsRef, 
            where("studentIndexNumber", "==", currentStudent.studentIndexNumber), 
            limit(1));
          const indexSnapshot = await getDocs(indexQuery);
          
          if (!indexSnapshot.empty) {
            studentDoc = indexSnapshot.docs[0];
            freshData = studentDoc.data();
            console.log("Found student by index number");
          }
        }
      } else if (studentDoc.exists()) {
        freshData = studentDoc.data();
        console.log("Found student by ID in student-registrations");
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
    const sessionCheckInterval = setInterval(() => {
      if (isAuthenticated) {
        refreshUserData().catch(console.error);
      }
    }, 5 * 60 * 1000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(sessionCheckInterval);
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

  return {
    student,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    refreshUserData
  }
}
