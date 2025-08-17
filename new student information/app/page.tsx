import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="bg-gradient-to-br from-green-50 to-white">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6">
            <div className="mb-4 sm:mb-0 sm:mr-4">
              <Image
                src="/logo.png"
                alt="UCAES Logo"
                width={80}
                height={80}
                className="mx-auto sm:mx-0"
                priority
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                University College of Agriculture and Environmental Studies
              </h1>
            </div>
          </div>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Welcome to our student registration portal. Complete your registration in simple steps.
          </p>
        </div>

        {/* Registration Card */}
        <div className="max-w-4xl mx-auto px-4">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-green-600 text-white rounded-t-lg p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl text-center">Student Registration Portal</CardTitle>
              <CardDescription className="text-green-100 text-center text-sm sm:text-base">
                Join the University College of Agriculture and Environmental Studies
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              {/* Programme Highlights */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 text-center">Available Programmes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 text-sm sm:text-base">B.Sc. Sustainable Agriculture</h4>
                    <p className="text-xs sm:text-sm text-green-600 mt-1">4-year programme</p>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 text-sm sm:text-base">B.Sc. Sustainable Forestry</h4>
                    <p className="text-xs sm:text-sm text-green-600 mt-1">4-year programme</p>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg sm:col-span-2 lg:col-span-1">
                    <h4 className="font-medium text-green-800 text-sm sm:text-base">B.Sc. Environmental Science and Management</h4>
                    <p className="text-xs sm:text-sm text-green-600 mt-1">4-year programme</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="flex items-center space-x-3 p-3 sm:p-0">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">Personal Information</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Basic details and identification</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 sm:p-0">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-green-600 rounded flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">📄</div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">Academic Details</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Programme and qualification info</p>
                  </div>
                </div>
              </div>

              {/* Registration Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Before You Start:</h4>
                <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                  <li>• Have your National ID or Passport ready</li>
                  <li>• Prepare a recent passport-sized photograph</li>
                  <li>• Gather your academic certificates and transcripts</li>
                  <li>• Ensure you have guardian/parent contact information</li>
                </ul>
              </div>

              <div className="text-center">
                <Link href="/register">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg w-full sm:w-auto">
                    Start Registration Now
                    <span className="ml-2">→</span>
                  </Button>
                </Link>
                <p className="text-xs sm:text-sm text-gray-500 mt-2 px-4">Registration takes approximately 10-15 minutes</p>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8 max-w-4xl mx-auto px-4">
          <Card className="text-center">
            <CardContent className="p-4 sm:p-6">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-600 rounded-full flex items-center justify-center text-white text-lg sm:text-2xl mx-auto mb-3 sm:mb-4">✓</div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Easy Process</h3>
              <p className="text-xs sm:text-sm text-gray-600">Simple 4-step registration process</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4 sm:p-6">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-600 rounded-full flex items-center justify-center text-white text-lg sm:text-2xl mx-auto mb-3 sm:mb-4">🔒</div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Secure Upload</h3>
              <p className="text-xs sm:text-sm text-gray-600">Safe document and photo upload</p>
            </CardContent>
          </Card>
          <Card className="text-center sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Instant Confirmation</h3>
              <p className="text-xs sm:text-sm text-gray-600">Immediate registration confirmation</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
