"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, ArrowLeft, Edit, CheckCircle, Download, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import type { FormData } from "@/app/register/page"
import { submitStudentRegistration, getStudentRegistration } from "@/lib/firebase-service"
import ReviewSummary from "@/components/review-summary"

export default function ConfirmationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationId, setRegistrationId] = useState<string | null>(null)
  const [registrationNumber, setRegistrationNumber] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if we already have a registration ID from a previous submission
    const savedRegistrationId = localStorage.getItem("submittedRegistrationId")
    
    if (savedRegistrationId) {
      // We've already submitted the form
      setRegistrationId(savedRegistrationId)
      setIsSubmitted(true)
      
      // Try to fetch registration details to get the registration number
      const fetchRegistrationDetails = async () => {
        try {
          const registration = await getStudentRegistration(savedRegistrationId)
          if (registration && registration.registrationNumber) {
            setRegistrationNumber(registration.registrationNumber)
          }
        } catch (error) {
          console.error("Error fetching registration details:", error)
        }
      }
      
      fetchRegistrationDetails()
      
      // Try to get the form data from localStorage as well
      const savedData = localStorage.getItem("submittedRegistrationData")
      if (savedData) {
        setFormData(JSON.parse(savedData))
      }
      
      return // Skip the rest of the effect
    }
    
    // Otherwise, check for registration data in progress
    const data = localStorage.getItem("registrationData")
    if (data) {
      setFormData(JSON.parse(data))
    } else {
      router.push("/register")
    }
  }, [router])

  useEffect(() => {
    // Fetch registration details if we have an ID
    const fetchRegistrationDetails = async () => {
      if (registrationId) {
        try {
          const registration = await getStudentRegistration(registrationId)
          if (registration && registration.registrationNumber) {
            setRegistrationNumber(registration.registrationNumber)
          }
        } catch (error) {
          console.error("Error fetching registration details:", error)
        }
      }
    }

    if (isSubmitted && registrationId) {
      fetchRegistrationDetails()
    }
  }, [isSubmitted, registrationId])

  const handleSubmit = async () => {
    if (!formData) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Check if Firebase is initialized and authenticated
      const auth = await import('@/lib/firebase').then(module => module.auth);
      
      // Wait for auth state to be ready before submitting
      if (auth.currentUser === null) {
        console.log("Waiting for authentication to complete...");
        await new Promise(resolve => {
          const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
          });
          // Fallback timeout in case auth never completes
          setTimeout(resolve, 2000);
        });
      }
      
      const registrationId = await submitStudentRegistration(formData)
      setRegistrationId(registrationId)
      setIsSubmitted(true)

      // Prepare data for localStorage by handling special objects
      const prepareDataForStorage = (data: FormData): any => {
        const storageData = { ...data }
        
        // Handle profilePicture specially
        if (storageData.profilePicture) {
          if (storageData.profilePicture instanceof File) {
            // For File objects, just store null as we can't serialize them
            storageData.profilePicture = null
          } else if (typeof storageData.profilePicture === 'object' && 'url' in storageData.profilePicture) {
            // For custom photo objects, we can store them as is
            // These have url, name, type, size, hasImage properties
          }
        }
        
        return storageData
      }

      // Store the registration ID and data for page refreshes
      localStorage.setItem("submittedRegistrationId", registrationId)
      localStorage.setItem("submittedRegistrationData", JSON.stringify(prepareDataForStorage(formData)))
      
      // Clear the stored registration data
      localStorage.removeItem("registrationData")
      localStorage.removeItem("registrationFormInProgress")
      localStorage.removeItem("registrationActiveTab")
    } catch (error) {
      console.error("Registration submission error:", error)
      
      // Handle permission errors specifically
      if (error instanceof Error && error.message.includes("permission")) {
        setError("Permission error: Firebase access denied. Please try refreshing the page and submitting again.");
      } else {
        setError(error instanceof Error ? error.message : "An unexpected error occurred")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = () => {
    // If we're going back to edit, restore the form data to the in-progress storage
    if (formData) {
      localStorage.setItem("registrationFormInProgress", JSON.stringify(formData))
    }
    router.push("/register")
  }

  const handleStartOver = () => {
    // Clear all registration data and go back to the beginning
    localStorage.removeItem("submittedRegistrationId")
    localStorage.removeItem("submittedRegistrationData")
    localStorage.removeItem("registrationData")
    localStorage.removeItem("registrationFormInProgress")
    localStorage.removeItem("registrationActiveTab")
    router.push("/register")
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p>Loading registration data...</p>
        </div>
      </div>
    )
  }

  if (isSubmitted && registrationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-6">
        <Card className="max-w-md mx-auto text-center shadow-lg w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">Registration Successful!</CardTitle>
            <CardDescription>Your application has been submitted successfully</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="font-medium text-gray-700">Registration Number:</p>
              <p className="text-xl font-bold text-green-700">
                {registrationNumber || "Processing..."}
              </p>
              <div className="mt-2 pt-2 border-t border-green-200">
                <p className="text-sm font-medium text-gray-600">Reference ID:</p>
                <p className="text-sm font-mono text-gray-700">{registrationId}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Your application will be reviewed by our admissions team.</li>
                <li>You will receive notification of your application status within 5-7 business days.</li>
                <li>Once approved, you can log in to the Student Portal using your:</li>
              </ol>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Student ID:</span> {formData.studentIndexNumber || "Will be assigned after approval"}
                </p>
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Password:</span> Your date of birth (DD-MM-YYYY format)
                </p>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Your personal details:</p>
                <p>
                  <span className="font-medium">Name:</span> {`${formData.surname} ${formData.otherNames}`}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {formData.email}
                </p>
                <p>
                  <span className="font-medium">Programme:</span> {formData.programme}
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Download Registration Receipt
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-2 pt-2">
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                Return to Home
              </Button>
            </Link>
            <Button variant="ghost" className="text-sm" onClick={handleStartOver}>
              Register Another Student
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="sm" className="mr-4" onClick={handleEdit}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Edit
          </Button>
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-green-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Registration Confirmation</h1>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-green-600 text-white">
              <CardTitle className="text-xl">Review Your Information</CardTitle>
              <p className="text-green-100">Please review all details before final submission</p>
            </CardHeader>
            <CardContent className="p-6">
              {/* Use the ReviewSummary component instead of custom layout */}
              <ReviewSummary formData={formData} />
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between mt-6">
                <Button variant="outline" onClick={handleEdit} className="flex items-center" disabled={isSubmitting}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Information
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700 flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Registration
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
