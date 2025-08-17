"use client"

import { useState, FormEvent, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Lock, User as UserIcon, AlertTriangle } from "lucide-react"
import { useAuth } from "@/components/auth-context"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [statusMessage, setStatusMessage] = useState<{type: string, message: string} | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login, error: authError } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Check for account status messages in URL
    const reason = searchParams.get('reason')
    if (reason === 'account-suspended') {
      setStatusMessage({
        type: 'warning',
        message: 'Your account has been suspended by an administrator. Please contact the academic affairs office for assistance.'
      })
    } else if (reason === 'account-deleted') {
      setStatusMessage({
        type: 'error',
        message: 'Your account has been deleted. Please contact the academic affairs office if you believe this is an error.'
      })
    } else if (reason === 'password-changed') {
      setStatusMessage({
        type: 'info',
        message: 'Your password has been changed. Please login with your new credentials.'
      })
    } else if (reason === 'session-expired') {
      setStatusMessage({
        type: 'warning',
        message: 'Your session has expired due to security reasons. Please log in again.'
      })
    } else if (reason === 'auth-error') {
      setStatusMessage({
        type: 'error',
        message: 'There was an authentication error. Please try logging in again. If the problem persists, contact the system administrator.'
      })
    }
    
    // Display auth context errors
    if (authError) {
      setError(authError)
    }
  }, [searchParams, authError])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setStatusMessage(null)
    setIsLoading(true)
    
    try {
      const result = await login(username, password)
      
      if (result.success) {
        // Redirect based on role
        if (result.user?.role === "director") {
          router.push("/director/dashboard")
        } else if (["staff", "finance_officer", "exam_officer", "admissions_officer", "registrar", "Lecturer"].includes(result.user?.role)) {
          router.push("/staff/dashboard")
        } else {
          // Fallback for unknown roles
          router.push("/staff/dashboard")
        }
      } else {
        // Handle specific error types
        const errorMsg = result.error || "Invalid username or password"
        if (errorMsg.includes('session has expired')) {
          setStatusMessage({
            type: 'warning',
            message: 'Your session has expired. Please log in again.'
          })
        } else if (errorMsg.includes('Authentication failed')) {
          setStatusMessage({
            type: 'error',
            message: 'Authentication system error. Please contact the system administrator if this problem continues.'
          })
        } else {
          setError(errorMsg)
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred. Please try again. If the problem persists, contact the system administrator.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <Image
                src="/uceslogo.png"
                alt="UCAES Logo"
                width={100}
                height={100}
                style={{ objectFit: "contain", borderRadius: 0 }}
                // className="h-20 w-auto" // Remove or comment out any rounded or border-radius classes
              />
            </div>
            <CardTitle className="text-2xl font-bold">Administration</CardTitle>
            <CardDescription>
              Enter your credentials to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusMessage && (
              <Alert 
                className={`mb-4 ${
                  statusMessage.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 
                  statusMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 
                  'bg-blue-50 border-blue-200 text-blue-700'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  {statusMessage.type === 'warning' ? 'Account Suspended' : 
                   statusMessage.type === 'error' ? 'Account Deleted' : 
                   'Password Changed'}
                </AlertTitle>
                <AlertDescription>{statusMessage.message}</AlertDescription>
              </Alert>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !username || !password}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account? <a href="/login/signup" className="text-blue-600 underline">Sign up as Director</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
