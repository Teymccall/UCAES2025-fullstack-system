"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    studentId: "",
    dateOfBirth: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login, user } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!formData.studentId || !formData.dateOfBirth) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    try {
      const success = await login(formData.studentId, formData.dateOfBirth)

      if (success) {
        router.push("/")
      } else {
        setError("Invalid student ID or date of birth. Please check your credentials and try again.")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (studentId: string, dateOfBirth: string) => {
    setFormData({ studentId, dateOfBirth })
    setIsLoading(true)
    setError("")

    try {
      const success = await login(studentId, dateOfBirth)
      if (success) {
        router.push("/")
      }
    } catch (err) {
      setError("Demo login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">UCAES Fees Portal</h1>
          <p className="text-gray-600 mt-2">University College of Agriculture and Environmental Studies</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Student Login</CardTitle>
            <CardDescription>Access your fees and payment information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  type="text"
                  placeholder="e.g., AG/2021/001234"
                  value={formData.studentId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, studentId: e.target.value.toUpperCase() }))}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <div className="relative">
                  <Input
                    id="dateOfBirth"
                    type={showPassword ? "text" : "date"}
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
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

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-3">Demo Accounts</h4>
              <div className="space-y-2">
                <div className="text-xs text-blue-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-2"
                    onClick={() => handleDemoLogin("AG/2021/001234", "2000-01-15")}
                    disabled={isLoading}
                  >
                    <div>
                      <p className="font-medium">John Doe</p>
                      <p className="text-blue-600">ID: AG/2021/001234 | DOB: 2000-01-15</p>
                    </div>
                  </Button>
                </div>
                <div className="text-xs text-blue-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-2"
                    onClick={() => handleDemoLogin("AG/2021/001235", "2001-03-22")}
                    disabled={isLoading}
                  >
                    <div>
                      <p className="font-medium">Jane Smith</p>
                      <p className="text-blue-600">ID: AG/2021/001235 | DOB: 2001-03-22</p>
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Having trouble logging in?{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Contact Support
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>&copy; 2025 University College of Agriculture and Environmental Studies</p>
        </div>
      </div>
    </div>
  )
}
