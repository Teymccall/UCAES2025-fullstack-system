# Firebase Authentication Implementation Plan

## Current Status

We've temporarily disabled the security rules to fix the immediate "Missing or insufficient permissions" error. This is a temporary solution for development but is **not secure for production**.

## Implementation Plan

### Phase 1: Login Flow Enhancement

1. **Update Auth Provider**
   - The current `AuthProvider` in `components/auth-context.tsx` is already set up but might not be preserving authentication state properly.
   - Ensure that Firebase auth state is properly persisted using `onAuthStateChanged` listener.
   - Verify that the user's permissions and assigned courses are loaded into the context.

2. **Login Component Enhancement**
   - Ensure the login form correctly uses `signInWithEmailAndPassword` from Firebase.
   - Add proper error handling for authentication failures.
   - Implement "Remember me" functionality if needed.

3. **Protected Routes**
   - Create a higher-order component or middleware to protect routes that require authentication.
   - Redirect unauthenticated users to the login page.

### Phase 2: User Management

1. **User Data Structure**
   - Ensure the user document structure in Firestore contains all fields required by security rules:
     - `role` (director/staff)
     - `permissions` (array of permission strings)
     - `assignedCourses` (for staff)

2. **User Profile Management**
   - Create a profile page where users can view their information.
   - Allow directors to manage staff accounts and permissions.

### Phase 3: Security Rules Integration

1. **Test Authentication**
   - Verify that authenticated users can access resources based on their role and permissions.
   - Create test cases for each major permission scenario.

2. **Enable Rules Incrementally**
   - Instead of enabling all security rules at once, enable them collection by collection:
     1. Enable rules for users collection
     2. Enable rules for courses collection
     3. Continue with other collections

3. **User Feedback**
   - Add proper error messages for permission denied scenarios.
   - Show UI elements only for actions that the user has permission to perform.

### Phase 4: Advanced Features

1. **Audit Logging**
   - Implement detailed audit logging for all significant actions.
   - Ensure these logs can only be viewed by directors as per the security rules.

2. **Session Management**
   - Add session timeout functionality.
   - Implement "force logout" capability for administrators.

3. **Password Management**
   - Implement forgot password functionality.
   - Add ability to change password.

## Implementation Details

### User Login Flow

```javascript
// In login page component
import { useState } from 'react'
import { useAuth } from '@/components/auth-context'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      const result = await login(username, password)
      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.error || 'Failed to login')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    }
  }
  
  // ... rest of component
}
```

### Protected Route Component

```javascript
// components/protected-route.tsx
'use client'

import { useAuth } from '@/components/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedRoute({ 
  children,
  requiredPermissions = [],
  requiredRole = null
}) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (requiredRole && user?.role !== requiredRole) {
        router.push('/unauthorized')
      } else if (
        requiredPermissions.length > 0 && 
        !requiredPermissions.every(perm => user?.permissions?.includes(perm))
      ) {
        router.push('/unauthorized')
      }
    }
  }, [isLoading, isAuthenticated, user, router, requiredRole, requiredPermissions])
  
  if (isLoading) {
    return <div>Loading...</div>
  }
  
  if (!isAuthenticated) {
    return null
  }
  
  return children
}
```

## Re-enabling Security Rules

Once the authentication implementation is complete, we can re-enable the security rules by:

1. Removing the temporary rules in `firestore.rules` and `database.rules.json`
2. Uncommenting the proper security rules
3. Deploying the updated rules:
   ```
   firebase deploy --only firestore:rules,database
   ```

## Testing Checklist

Before re-enabling security rules, verify:

- [ ] Users can log in successfully
- [ ] Authentication state persists across page refreshes
- [ ] Protected routes redirect unauthenticated users to login
- [ ] Director users can access all collections
- [ ] Staff users can only access collections they have permission for
- [ ] Staff can only modify data for courses they're assigned to
- [ ] Proper error messages are shown for permission denied scenarios

## Timeline

- Phase 1: 2 days
- Phase 2: 2 days
- Phase 3: 3 days
- Phase 4: 3 days

Total implementation time: ~10 days 