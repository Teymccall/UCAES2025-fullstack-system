"use client"

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Info } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@ucaes.edu.gh')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const router = useRouter()

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)
      
      await signInWithEmailAndPassword(auth, email, password)
      
      // Redirect to admin dashboard after successful login
      router.push('/admin')
    } catch (error) {
      console.error('Login error:', error)
      
      // Handle different Firebase auth errors
      const errorCode = (error as any)?.code
      
      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found') {
        setError('Invalid email or password. If this is your first time, click "Create Admin Account" below.')
      } else if (errorCode === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later')
      } else if (errorCode === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection')
      } else {
        setError(`Login failed: ${(error as Error).message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleCreateAccount = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)
      
      await createUserWithEmailAndPassword(auth, email, password)
      setMessage('Admin account created successfully! You will be redirected to the dashboard.')
      
      // Redirect to admin dashboard after successful account creation
      setTimeout(() => {
        router.push('/admin')
      }, 2000)
    } catch (error) {
      console.error('Account creation error:', error)
      
      // Handle different Firebase auth errors
      const errorCode = (error as any)?.code
      
      if (errorCode === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please log in instead.')
      } else if (errorCode === 'auth/invalid-email') {
        setError('Invalid email address')
      } else if (errorCode === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.')
      } else if (errorCode === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection')
      } else {
        setError(`Account creation failed: ${(error as Error).message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (isFirstTimeSetup) {
      await handleCreateAccount()
    } else {
      await handleSignIn()
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-6">
              <div className="h-40 w-40 relative">
                <Image
                  src="/uces.png"
                  alt="UCAES Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </div>
            <CardTitle className="text-2xl text-center font-bold">
              {isFirstTimeSetup ? 'Create Admin Account' : 'UCAES Admin Login'}
            </CardTitle>
            <CardDescription className="text-center">
              {isFirstTimeSetup 
                ? 'Set up your admin account to access the system' 
                : 'Enter your credentials to access the admin panel'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {message && (
              <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
                <Info className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Success</AlertTitle>
                <AlertDescription className="text-green-700">{message}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@ucaes.edu.gh"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {isFirstTimeSetup && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-green-700 hover:bg-green-800"
                disabled={isLoading}
              >
                {isLoading 
                  ? (isFirstTimeSetup ? 'Creating Account...' : 'Logging in...') 
                  : (isFirstTimeSetup ? 'Create Admin Account' : 'Login')}
              </Button>
              
              <div className="text-center">
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-sm text-green-700"
                  onClick={() => {
                    setIsFirstTimeSetup(!isFirstTimeSetup)
                    setError(null)
                    setMessage(null)
                  }}
                >
                  {isFirstTimeSetup 
                    ? 'Already have an account? Login' 
                    : 'First time? Create Admin Account'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm text-gray-500">
            University College of Agriculture and Environmental Studies
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 