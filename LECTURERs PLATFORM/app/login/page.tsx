"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    try {
      // Sign in with email/password
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const { uid } = userCredential.user
      
      // Fetch user data from Firestore
      const userDocRef = doc(db, "users", uid)
      const userDoc = await getDoc(userDocRef)
      
      if (!userDoc.exists()) {
        setError("User account not found")
        return
      }
      
      const userData = userDoc.data()
      
      // Check if user is a Lecturer
      if (userData.role !== "Lecturer") {
        setError("This account does not have lecturer access")
        return
      }
      
      // Check if account is approved
      if (userData.status === "pending") {
        setError("Your account is pending approval by the Academic Affairs Director")
        return
      }
      
      if (userData.status === "suspended") {
        setError("Your account has been suspended. Please contact Academic Affairs")
        return
      }
      
      // Redirect to lecturer dashboard
      router.push("/lecturer/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)
      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password")
      } else {
        setError("An error occurred during login. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center p-4 sm:p-6">
            <div className="flex justify-center mb-2">
              <Image
                src="/logo.png"
                alt="University College of Agriculture and Environmental Studies Logo"
                width={80}
                height={80}
                className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
                priority
              />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold">UCAES Lecturer Portal</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              University College of Agriculture and Environmental Studies
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

              <Button type="submit" className="w-full" disabled={isLoading || !email || !password}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account? <a href="/signup" className="text-blue-600 underline">Contact Academic Affairs</a>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border-blue-100 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Lecturer accounts are created by the Academic Affairs department. 
                If you need access, please contact them directly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 