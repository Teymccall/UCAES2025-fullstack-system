"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { User as UserIcon, Mail, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SignupPage() {
  const router = useRouter()
  
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
            <CardTitle className="text-2xl font-bold">Lecturer Account Creation</CardTitle>
            <CardDescription>
              Information about getting access to the lecturer portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important Notice</AlertTitle>
              <AlertDescription>
                Lecturer accounts are now created exclusively by the Academic Affairs department.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <h3 className="text-lg font-medium">How to Get Access</h3>
              
              <div className="space-y-2 text-muted-foreground">
                <p>To request a lecturer account for the UCAES portal:</p>
                <ol className="list-decimal list-inside text-left space-y-2">
                  <li>Contact the Academic Affairs department</li>
                  <li>Provide your full name, email address, and department</li>
                  <li>The Director will create your account and assign courses</li>
                  <li>You'll receive login credentials via email</li>
                </ol>
              </div>
              
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  If you already have an account, please sign in below.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGoToLogin} className="w-full">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 