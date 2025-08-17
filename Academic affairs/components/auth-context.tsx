'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, signInWithCustomToken } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';

type User = {
  uid: string;
  username: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  permissions: string[];
  sessionToken?: string;
  customToken?: string;
  assignedCourses?: string[];
};

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  signup: (userData: any) => Promise<void>;
  refreshAuth: () => Promise<void>;
  // Derived helpers used across app screens
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  canAccessCourse: (courseCode: string) => boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    // Check for stored user data in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // If we have stored user data but Firebase Auth is not signed in, try to sign in
      if (userData.customToken) {
        console.log('Attempting to restore Firebase Auth session...');
        signInWithCustomToken(auth, userData.customToken).catch((error: any) => {
          console.error('Failed to restore Firebase Auth session:', error);
          
          // Handle specific Firebase auth errors
          if (error?.code === 'auth/invalid-custom-token' || 
              error?.code === 'auth/custom-token-mismatch' ||
              error?.code === 'auth/argument-error') {
            console.log('Stored custom token is invalid. Clearing authentication data.');
            // Clear invalid stored data
            localStorage.removeItem('user');
            setUser(null);
            setError('Your session has expired. Please log in again.');
          } else {
            // For other errors, keep the user data but log the error
            console.error('Firebase Auth restoration error (non-critical):', error);
          }
        });
      }
    }

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setLoading(false);
      if (firebaseUser) {
        console.log('Firebase auth state changed: user signed in');
      } else {
        console.log('Firebase auth state changed: no user');
        // Don't clear stored user data immediately, as we might be using custom auth
      }
    });

    return () => unsubscribe();
  }, []);

  // Add a real-time listener to check the user's account status
  useEffect(() => {
    if (!user || !user.uid) return;

    console.log('[AuthContext] Checking user status for uid:', user.uid);

    // Function to check if user document exists and is active
    const checkUserStatus = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        console.log('[AuthContext] Looking up user document with uid:', user.uid);
        const userDoc = await getDoc(userRef);
        
        console.log('[AuthContext] User document exists:', userDoc.exists());
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('[AuthContext] User status:', userData.status);
          console.log('[AuthContext] User role:', userData.role);
        }
        
        // If user document doesn't exist or status is not active, force logout
        if (!userDoc.exists() || userDoc.data().status !== 'active') {
          console.log('[AuthContext] User account is no longer active or has been deleted, logging out');
          await logout();
          router.push('/login?reason=account-suspended');
        } else {
          console.log('[AuthContext] User status check passed');
        }
      } catch (error) {
        console.error('[AuthContext] Error checking user status:', error);
      }
    };

    // Set up real-time listener for user document
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userRef, 
      (docSnapshot) => {
        console.log('[AuthContext] Real-time update - document exists:', docSnapshot.exists());
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          console.log('[AuthContext] Real-time update - status:', userData.status);
        }
        
        // If document doesn't exist or status is not active, force logout
        if (!docSnapshot.exists() || docSnapshot.data().status !== 'active') {
          console.log('[AuthContext] Real-time update: User account is no longer active, logging out');
          logout();
          router.push('/login?reason=account-suspended');
        }
      },
      (error) => {
        console.error('[AuthContext] Error listening to user document:', error);
        // If we can't access the document (e.g., it was deleted), logout
        if (error.code === 'permission-denied') {
          console.log('[AuthContext] Cannot access user document, likely deleted. Logging out.');
          logout();
          router.push('/login?reason=account-deleted');
        }
      }
    );

    // Initial check
    checkUserStatus();

    return () => unsubscribe();
  }, [user, router]);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log("[AuthContext] Attempting login for username:", username);

      // Call login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log("[AuthContext] Login API response:", data);

      if (!data.success) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return { success: false, error: data.error || 'Login failed' };
      }

      // Use the custom token to sign in with Firebase Auth (if available)
      if (data.user.customToken) {
        console.log("[AuthContext] Signing in with custom token");
        try {
          await signInWithCustomToken(auth, data.user.customToken);
          console.log("[AuthContext] Firebase Auth sign-in successful");
        } catch (firebaseError: any) {
          console.error("[AuthContext] Firebase Auth error:", firebaseError);
          
          // Handle specific Firebase auth errors during login
          if (firebaseError?.code === 'auth/invalid-custom-token' || 
              firebaseError?.code === 'auth/custom-token-mismatch' ||
              firebaseError?.code === 'auth/argument-error') {
            console.error("[AuthContext] Invalid custom token received from server");
            setError('Authentication failed. Please contact the system administrator.');
            setLoading(false);
            return { success: false, error: 'Authentication failed. Please contact the system administrator.' };
          }
          // For other Firebase errors, continue with login but log the issue
          console.log("[AuthContext] Firebase Auth failed but continuing with custom authentication");
        }
      } else {
        console.log("[AuthContext] No custom token provided, using custom authentication");
      }

      console.log('[AuthContext] User data received:', {
        uid: data.user.uid,
        username: data.user.username,
        role: data.user.role,
        status: data.user.status,
        permissions: data.user.permissions
      });

      // Check if the user account is active before proceeding
      if (data.user.status !== 'active') {
        setError('Account is suspended. Please contact an administrator.');
        setLoading(false);
        return { success: false, error: 'Account is suspended. Please contact an administrator.' };
      }

      // Store user data
      console.log("[AuthContext] Storing user data in localStorage");
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      setLoading(false);
      console.log("[AuthContext] Login successful, returning user data");
      // Do not redirect here, let the page handle it
      return { success: true, user: data.user };
    } catch (err) {
      console.error('[AuthContext] Login error:', err);
      setError('An error occurred during login');
      setLoading(false);
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // Only try to sign out from Firebase Auth if user is signed in
      try {
        await signOut(auth);
      } catch (firebaseError) {
        console.log('[AuthContext] No Firebase Auth user to sign out, continuing with custom logout');
      }
      
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setError('An error occurred during logout');
      setLoading(false);
    }
  };

  const signup = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      setLoading(false);
      router.push('/login');
    } catch (err) {
      console.error('Signup error:', err);
      setError('An error occurred during signup');
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      // Throttle refresh to avoid re-auth on every navigation
      const now = Date.now();
      if (isRefreshing) {
        return;
      }
      // Skip if we refreshed within the last 5 minutes
      if (lastRefreshAt && now - lastRefreshAt < 5 * 60 * 1000) {
        return;
      }

      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;

      const userData = JSON.parse(storedUser);
      // If Firebase already has a signed-in user, skip network work
      if ((auth as any)?.currentUser) {
        setLastRefreshAt(now);
        return;
      }

      if (userData.customToken) {
        setIsRefreshing(true);
        console.log('Refreshing Firebase Auth session...');
        await signInWithCustomToken(auth, userData.customToken);
        console.log('Firebase Auth session refreshed successfully');
        setLastRefreshAt(Date.now());
      }
    } catch (error: any) {
      console.error('Failed to refresh Firebase Auth session:', error);
      
      // Handle specific Firebase auth errors
      if (error?.code === 'auth/invalid-custom-token' || 
          error?.code === 'auth/custom-token-mismatch' ||
          error?.code === 'auth/argument-error') {
        console.log('Custom token is invalid or expired. Clearing stored authentication data.');
        // Clear invalid stored data and redirect to login
        localStorage.removeItem('user');
        setUser(null);
        setError('Your session has expired. Please log in again.');
        router.push('/login?reason=session-expired');
      } else {
        // For other errors, just log them but don't clear user data
        console.error('Firebase Auth refresh error (non-critical):', error);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      signup,
      refreshAuth,
      // Derived helpers expected by various pages
      isAuthenticated: !!user,
      isLoading: loading,
      hasPermission: (permission: string) => {
        const perms = user?.permissions ?? [];
        return perms.includes('full_access') || perms.includes(permission);
      },
      canAccessCourse: (_courseCode: string) => {
        // Grant course access if user has course-related permissions or is director
        if (!user) return false;
        if (user.role === 'director') return true;
        const perms = user.permissions ?? [];
        return (
          perms.includes('full_access') ||
          perms.includes('course_management') ||
          perms.includes('result_entry')
        );
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
