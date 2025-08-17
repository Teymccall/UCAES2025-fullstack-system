"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Calendar, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import Image from 'next/image'
import { Loader } from "@/components/ui/loader"

export default function LoginPage() {
  const router = useRouter()
  const [studentId, setStudentId] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { login, isAuthenticated } = useAuth()

  useEffect(() => {
    setMounted(true)
    
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!studentId || !dateOfBirth) {
      setError('Please enter both your Student ID and Date of Birth')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Call the login function from the auth context
      await login({ studentId, dateOfBirth })
      
      // Show success message
      setSuccess(true)
      
      // Redirect to dashboard after a short delay to show success message
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (err: any) {
      console.error('Login error:', err)
      setError('Incorrect Student ID or Password')
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  // Don't render anything during hydration to avoid mismatch
  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="h-24 w-24 sm:h-32 sm:w-32 relative mx-auto mb-4 sm:mb-6">
            <Image
              src="/logo.png"
              alt="UCAES Logo"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">UCAES Student Portal</h1>
          <p className="text-sm sm:text-base text-gray-600">University College of Agriculture and Environmental Studies</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl text-center">Student Login</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {error && (
                <Alert variant="destructive" className="mb-4 sm:mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="mb-4 sm:mb-6 bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm">Login successful! Redirecting...</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="studentId" className="text-sm sm:text-base flex items-center gap-2">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  Student ID / Index Number
                </Label>
                <Input
                  id="studentId"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="uppercase h-12 text-base"
                  disabled={loading || success}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="dateOfBirth" className="text-base flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Date of Birth (DD-MM-YYYY)
                </Label>
                <div className="relative">
                  <Input
                    id="dateOfBirth"
                    type={showPassword ? "text" : "password"}
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="h-12 text-base pr-10"
                    disabled={loading || success}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading || success}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className={`w-full h-12 text-base font-medium ${success ? 'bg-green-600' : 'bg-green-600 hover:bg-green-700'} mt-6`}
                disabled={loading || success}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="relative h-5 w-5">
                      <Loader className="h-5 w-5" />
                    </div>
                    <span>Signing in</span>
                  </div>
                ) : success ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Login Successful</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
