"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SignupSuccessPage() {
  const router = useRouter()
  
  // Redirect to signup page since we no longer use this flow
  useEffect(() => {
    setTimeout(() => {
      router.push("/signup")
    }, 5000) // Redirect after 5 seconds
  }, [router])
  
  const handleGoToLogin = () => {
    router.push("/login")
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <Image
                src="/placeholder-logo.png"
                alt="University Logo"
                width={80}
                height={80}
                className="h-20 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold">Account Information</CardTitle>
            <CardDescription>
              Important information about lecturer accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="h-16 w-16 text-blue-600" />
            </div>
            <p className="mb-6">
              Lecturer accounts for the UCAES Portal are now created by the Academic Affairs department.
            </p>
            <p className="mb-6">
              Please contact Academic Affairs to request an account. You will be redirected to
              more information about this process.
            </p>
            <Button onClick={handleGoToLogin} className="w-full">
              Go to Login Page
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              You will be redirected automatically in 5 seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 