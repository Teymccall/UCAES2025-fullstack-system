"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { School, User, Calendar, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [studentId, setStudentId] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    setError(null)
    setLoading(true)

    if (!studentId || !dateOfBirth) {
      setError("Please fill in all fields.")
      setLoading(false)
      return
    }

    // Validate date of birth format (DD-MM-YYYY)
    const dobRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/
    if (!dobRegex.test(dateOfBirth)) {
      setError("Please enter date of birth in the format DD-MM-YYYY (e.g., 16-06-2000)")
      setLoading(false)
      return
    }

    try {
      // Call login function from auth context
      await login({
        studentId: studentId.trim(),
        dateOfBirth: dateOfBirth.trim()
      })

      // Success - redirect to dashboard
      router.push("/")
    } catch (err: any) {
      // Show specific error message
      setError(err.message || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div suppressHydrationWarning className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
            <School className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">UCAES Student Portal</h1>
          <p className="text-gray-600">University College of Agriculture and Environmental Studies</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Student Login</CardTitle>
            <CardDescription>Enter your Student ID and Date of Birth to access your portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="studentId" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Student ID / Index Number
                </Label>
                <Input
                  id="studentId"
                  type="text"
                  placeholder="e.g., 10288633 or UCAES2023001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="uppercase"
                  disabled={loading}
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500">
                  Enter your registration number or index number as provided during registration
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </Label>
                <div className="relative">
                  <Input
                    id="dateOfBirth"
                    type={showPassword ? "text" : "password"}
                    placeholder="DD-MM-YYYY (e.g., 16-06-2000)"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Enter your date of birth exactly as provided during registration (DD-MM-YYYY format)
                </p>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? (
                  <>
                    <span className="mr-2">Signing in</span>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 text-center">
            <p className="text-sm text-gray-500">
              Having trouble? Contact the IT Support Desk
            </p>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Need help? Contact Student Affairs Office</p>
          <p>Email: support@ucaes.edu.gh | Phone: +233 XX XXX XXXX</p>
        </div>
      </div>
    </div>
  )
}
