"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap } from "lucide-react"
import Link from "next/link"
import type { FormData } from "@/app/register/page"
import { submitStudentRegistration, getStudentRegistration } from "@/lib/firebase-service"
import ReviewSummary from "@/components/review-summary"
import { toast } from "@/components/ui/use-toast"

export default function ConfirmationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData | null>(null)
  const [currentRegistration, setCurrentRegistration] = useState<any | null>(null) // Add this
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [registrationId, setRegistrationId] = useState<string | null>(null)
  const [registrationNumber, setRegistrationNumber] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [verificationError, setVerificationError] = useState<string | null>(null)

  useEffect(() => {
    console.log("🏁 CONFIRMATION PAGE LOADED")
    console.log("🌐 Current URL:", window.location.href)
    
    // First check if we have a registration ID from URL parameters (new registration)
    const urlParams = new URLSearchParams(window.location.search)
    const urlRegistrationId = urlParams.get('id')
    
    console.log("🔍 Checking URL parameters:")
    console.log("   📋 URL Registration ID:", urlRegistrationId)
    
    // DEBUG: Check all localStorage keys
    console.log("🗂️ ALL localStorage keys:")
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      const value = localStorage.getItem(key!)
      console.log(`   ${key}: ${value ? 'EXISTS' : 'null'}`)
    }
    
    if (urlRegistrationId) {
      // New registration from URL - clear any old localStorage data and use the new ID
      console.log("✅ NEW registration ID found in URL:", urlRegistrationId)
      console.log("🧹 Clearing old localStorage data...")
      
      const oldRegistrationId = localStorage.getItem("submittedRegistrationId")
      const oldRegistrationData = localStorage.getItem("submittedRegistrationData")
      console.log("   🗂️ Old registration ID in localStorage:", oldRegistrationId)
      console.log("   🗂️ Old registration data exists:", !!oldRegistrationData)
      
      localStorage.removeItem("submittedRegistrationId")
      localStorage.removeItem("submittedRegistrationData")
      console.log("🧹 localStorage cleared")
      
      // Verify the new registration
      const verifyNewRegistration = async () => {
        setIsVerifying(true)
        setVerificationError(null)
        
        try {
          console.log("🔍 Verifying NEW registration ID from URL:", urlRegistrationId)
          const registration = await getStudentRegistration(urlRegistrationId)
          
          console.log("📊 Registration data retrieved from Firebase:", registration)
          
          if (registration) {
            console.log("✅ NEW registration data retrieved:", {
              id: urlRegistrationId,
              name: `${registration.surname} ${registration.otherNames}`,
              email: registration.email,
              registrationNumber: registration.registrationNumber
            })
            
            // New registration exists in Firebase, show success
            setRegistrationId(urlRegistrationId)
            setIsSubmitted(true)
            setCurrentRegistration(registration) // Set the actual registration data
            console.log("🎯 Set currentRegistration state to:", registration)
            
            if (registration.registrationNumber) {
              setRegistrationNumber(registration.registrationNumber)
              console.log("📋 Set registration number:", registration.registrationNumber)
            }
            
            // Save the new registration data to localStorage for future reference
            localStorage.setItem("submittedRegistrationId", urlRegistrationId)
            localStorage.setItem("submittedRegistrationData", JSON.stringify(registration))
            console.log("💾 Saved new registration data to localStorage")
            // Don't overwrite formData here - keep it separate
          } else {
            // Registration doesn't exist in Firebase
            setVerificationError("Registration not found. Please try submitting again.")
            router.push("/register")
          }
        } catch (error) {
          console.error("Error verifying new registration:", error)
          setVerificationError("Unable to verify registration. Please try again.")
          router.push("/register")
        } finally {
          setIsVerifying(false)
        }
      }
      
      verifyNewRegistration()
      return
    }
    
    console.log("❌ No URL registration ID found, checking localStorage...")
    
    // Only if no URL parameter, check localStorage for previous submission
    const savedRegistrationId = localStorage.getItem("submittedRegistrationId")
    
    console.log("🗂️ Checking localStorage:")
    console.log("   📋 Saved registration ID:", savedRegistrationId)
    
    if (savedRegistrationId) {
      console.log("✅ Found saved registration ID in localStorage:", savedRegistrationId)
      
      // Verify that the registration actually exists in Firebase
      const verifyRegistration = async () => {
        setIsVerifying(true)
        setVerificationError(null)
        
        try {
          console.log("🔍 Verifying CACHED registration ID:", savedRegistrationId)
          const registration = await getStudentRegistration(savedRegistrationId)
          
          console.log("📊 Cached registration data retrieved:", registration)
          
          if (registration) {
            console.log("✅ Cached registration found in Firebase:")
            console.log("   👤 Name:", registration.surname, registration.otherNames)
            console.log("   📧 Email:", registration.email)
            console.log("   📋 Registration Number:", registration.registrationNumber)
            
            // Registration exists in Firebase, show success
            setRegistrationId(savedRegistrationId)
            setIsSubmitted(true)
            setCurrentRegistration(registration) // Set the actual registration data
            console.log("🎯 Set currentRegistration to cached data:", registration)
            
            if (registration.registrationNumber) {
              setRegistrationNumber(registration.registrationNumber)
            }
            
            // Try to get the form data from localStorage as well
            const savedData = localStorage.getItem("submittedRegistrationData")
            console.log("🗂️ Saved registration data exists:", !!savedData)
            
            if (savedData) {
              const savedRegistration = JSON.parse(savedData)
              setCurrentRegistration(savedRegistration) // Set the actual registration data
              // Merge the Firebase data with the saved form data to ensure we have profilePictureUrl
              const mergedData = {
                ...savedRegistration,
                profilePictureUrl: registration.profilePictureUrl || savedRegistration.profilePictureUrl
              }
              setFormData(mergedData) // Keep formData for compatibility
              console.log("💾 Loaded saved registration data:", mergedData)
            }
          } else {
            // Registration doesn't exist in Firebase, clear localStorage and show form
            console.warn("Registration ID found in localStorage but not in Firebase, clearing data")
            localStorage.removeItem("submittedRegistrationId")
            localStorage.removeItem("submittedRegistrationData")
            setVerificationError("Previous registration was not completed successfully. Please submit again.")
            
            // Load form data if available
            const data = localStorage.getItem("registrationData")
            if (data) {
              setFormData(JSON.parse(data))
            } else {
              router.push("/register")
            }
          }
        } catch (error) {
          console.error("Error verifying registration:", error)
          setVerificationError("Unable to verify previous registration. Please try submitting again.")
          
          // Clear localStorage data on verification error
          localStorage.removeItem("submittedRegistrationId")
          localStorage.removeItem("submittedRegistrationData")
          
          // Load form data if available
          const data = localStorage.getItem("registrationData")
          if (data) {
            setFormData(JSON.parse(data))
          } else {
            router.push("/register")
          }
        } finally {
          setIsVerifying(false)
        }
      }
      
      verifyRegistration()
      return // Skip the rest of the effect
    }
    
    console.log("❌ No saved registration ID found in localStorage")
    console.log("🔍 Checking for form data in progress...")
    
    // Check if we have new registration data (from completing the form)
    const newRegistrationData = localStorage.getItem("registrationData")
    console.log("📝 New registration data in localStorage exists:", !!newRegistrationData)
    
    if (newRegistrationData) {
      // We have new form data - this means we're coming from the registration form
      // Clear any old cached registration data to show review instead of success
      console.log("🧹 Clearing old cached registration data for new review...")
      localStorage.removeItem("submittedRegistrationId")
      localStorage.removeItem("submittedRegistrationData")
      
      const formDataFromStorage = JSON.parse(newRegistrationData)
      console.log("📋 Loaded new form data from localStorage:", formDataFromStorage)
      console.log("📸 Profile picture data from localStorage:", {
        hasProfilePicture: !!formDataFromStorage.profilePicture,
        profilePictureType: typeof formDataFromStorage.profilePicture,
        profilePicture: formDataFromStorage.profilePicture,
        hasPreviewUrl: formDataFromStorage.profilePicture && typeof formDataFromStorage.profilePicture === 'object' && 'previewUrl' in formDataFromStorage.profilePicture,
        previewUrl: formDataFromStorage.profilePicture && typeof formDataFromStorage.profilePicture === 'object' ? formDataFromStorage.profilePicture.previewUrl : 'N/A'
      });
      setFormData(formDataFromStorage)
    } else {
      console.log("❌ No new form data found, redirecting to register page")
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
      console.log("🚀 STARTING REGISTRATION SUBMISSION...")
      console.log("📋 Student data:", {
        name: `${formData.surname} ${formData.otherNames}`,
        email: formData.email,
        programme: formData.programme
      })
      
      // Debug profile picture data
      console.log("📸 PROFILE PICTURE DEBUG:");
      console.log("   - Has profilePicture:", !!formData.profilePicture);
      console.log("   - Profile picture type:", typeof formData.profilePicture);
      console.log("   - Is File object:", formData.profilePicture instanceof File);
      if (formData.profilePicture && typeof formData.profilePicture === 'object') {
        console.log("   - Profile picture object keys:", Object.keys(formData.profilePicture));
        console.log("   - Has file property:", 'file' in formData.profilePicture);
        console.log("   - Has isFileObject property:", 'isFileObject' in formData.profilePicture);
        console.log("   - Has previewUrl:", 'previewUrl' in formData.profilePicture);
      }
      
      // We now upload directly to Cloudinary during selection, so no file reconstruction is needed
      console.log("📤 CALLING submitStudentRegistration with direct Cloudinary data:");
      console.log("   - formData.profilePicture:", formData.profilePicture);
      const registrationId = await submitStudentRegistration(formData, null)
      console.log("✅ Registration successful! ID:", registrationId)
      
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
      
      // Get the updated registration data from Firebase to include profilePictureUrl
      try {
        const updatedRegistration = await getStudentRegistration(registrationId)
        if (updatedRegistration) {
          const storageData = {
            ...prepareDataForStorage(formData),
            profilePictureUrl: updatedRegistration.profilePictureUrl,
            profilePicturePublicId: updatedRegistration.profilePicturePublicId
          }
          localStorage.setItem("submittedRegistrationData", JSON.stringify(storageData))
        } else {
          localStorage.setItem("submittedRegistrationData", JSON.stringify(prepareDataForStorage(formData)))
        }
      } catch (error) {
        console.error("Error fetching updated registration:", error)
        localStorage.setItem("submittedRegistrationData", JSON.stringify(prepareDataForStorage(formData)))
      }
      
      // No file data kept in localStorage anymore
      localStorage.removeItem("registrationData")
      
      toast({
        title: "Registration Successful!",
        description: "Your registration has been submitted successfully. You will receive a confirmation email shortly.",
        variant: "default",
      })
      
    } catch (error) {
      console.error("Registration submission error:", error)
      
      // Handle specific error types with appropriate toast notifications
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      
      if (errorMessage.includes("NETWORK_ERROR:")) {
        const message = errorMessage.replace("NETWORK_ERROR: ", "")
        toast({
          title: "Internet Connection Problem",
          description: message,
          variant: "destructive",
          duration: 8000, // Show longer for network issues
        })
        setError("Network connection problem. Please check your internet and try again.")
      } else if (errorMessage.includes("PERMISSION_ERROR:")) {
        const message = errorMessage.replace("PERMISSION_ERROR: ", "")
        toast({
          title: "Access Denied",
          description: message,
          variant: "destructive",
          duration: 6000,
        })
        setError("Access denied. Please contact your system administrator.")
      } else if (errorMessage.includes("QUOTA_ERROR:")) {
        const message = errorMessage.replace("QUOTA_ERROR: ", "")
        toast({
          title: "System Limit Reached",
          description: message,
          variant: "destructive",
          duration: 6000,
        })
        setError("System limit reached. Please contact your administrator.")
      } else if (errorMessage.includes("DATABASE_ERROR:")) {
        const message = errorMessage.replace("DATABASE_ERROR: ", "")
        toast({
          title: "Database Error",
          description: message,
          variant: "destructive",
          duration: 5000,
        })
        setError("Database error occurred. Please try again.")
      } else {
        toast({
          title: "Registration Failed",
          description: "An unexpected error occurred. Please try again or contact support.",
          variant: "destructive",
          duration: 5000,
        })
        setError("Failed to submit registration. Please try again.")
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

  const handleRetry = () => {
    setError(null)
    setVerificationError(null)
    // The form data should already be loaded, so we can just try submitting again
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <span className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600 text-xs">⏳</span>
          <p>Verifying previous registration...</p>
        </div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <span className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600 text-xs">⏳</span>
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
                              <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center text-white text-xl">✓</div>
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
                  <span className="font-semibold">Student ID:</span> {currentRegistration?.studentIndexNumber || formData?.studentIndexNumber || "Will be assigned after approval"}
                </p>
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Password:</span> Your date of birth (DD-MM-YYYY format)
                </p>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Your personal details:</p>
                {console.log("🖼️ RENDERING PERSONAL DETAILS:")}
                {console.log("   🎯 currentRegistration:", currentRegistration)}
                {console.log("   📝 formData:", formData)}
                {console.log("   👤 Will display name:", currentRegistration ? `${currentRegistration.surname} ${currentRegistration.otherNames}` : `${formData?.surname} ${formData?.otherNames}`)}
                {console.log("   📧 Will display email:", currentRegistration?.email || formData?.email)}
                {console.log("   🏫 Will display programme:", currentRegistration?.programme || formData?.programme)}
                <p>
                  <span className="font-medium">Name:</span> {currentRegistration ? `${currentRegistration.surname} ${currentRegistration.otherNames}` : `${formData?.surname} ${formData?.otherNames}`}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {currentRegistration?.email || formData?.email}
                </p>
                <p>
                  <span className="font-medium">Programme:</span> {currentRegistration?.programme || formData?.programme}
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <span className="h-4 w-4 mr-2 text-xs">📥</span>
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
                            <span className="h-4 w-4 mr-2 text-xs">←</span>
                Back to Edit
          </Button>
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-green-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Registration Confirmation</h1>
          </div>
        </div>

        {/* Verification Error Alert */}
        {verificationError && (
          <div className="max-w-4xl mx-auto mb-6">
            <Alert>
              <span className="h-4 w-4 text-xs">⚠️</span>
              <AlertDescription>
                {verificationError}
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRetry}
                    className="mt-2"
                  >
                    <span className="h-4 w-4 mr-2 text-xs">🔄</span>
                    Try Again
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <Alert variant="destructive">
              <span className="h-4 w-4 text-xs">⚠️</span>
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
                  <span className="h-4 w-4 mr-2 text-xs">✏️</span>
                  Edit Information
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700 flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 mr-2 animate-spin text-xs">⏳</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">✓</span>
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
