import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, FileText, CheckCircle, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-green-600 mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              University College of Agriculture and Environmental Studies
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome to our student registration portal. Complete your registration in simple steps.
          </p>
        </div>

        {/* Registration Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-green-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl text-center">Student Registration Portal</CardTitle>
              <CardDescription className="text-green-100 text-center">
                Join the University College of Agriculture and Environmental Studies
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {/* Programme Highlights */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Available Programmes</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">B.Sc. Sustainable Agriculture</h4>
                    <p className="text-sm text-green-600 mt-1">4-year programme</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">B.Sc. Sustainable Forestry</h4>
                    <p className="text-sm text-green-600 mt-1">4-year programme</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">B.Sc. Environmental Science and Management</h4>
                    <p className="text-sm text-green-600 mt-1">4-year programme</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">Personal Information</h3>
                    <p className="text-sm text-gray-600">Basic details and identification</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">Academic Details</h3>
                    <p className="text-sm text-gray-600">Programme and qualification info</p>
                  </div>
                </div>
              </div>

              {/* Registration Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">Before You Start:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Have your National ID or Passport ready</li>
                  <li>• Prepare a recent passport-sized photograph</li>
                  <li>• Gather your academic certificates and transcripts</li>
                  <li>• Ensure you have guardian/parent contact information</li>
                </ul>
              </div>

              <div className="text-center">
                <Link href="/register">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg">
                    Start Registration Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <p className="text-sm text-gray-500 mt-2">Registration takes approximately 10-15 minutes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardContent className="p-6">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Easy Process</h3>
              <p className="text-sm text-gray-600">Simple 4-step registration process</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Secure Upload</h3>
              <p className="text-sm text-gray-600">Safe document and photo upload</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Instant Confirmation</h3>
              <p className="text-sm text-gray-600">Immediate registration confirmation</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
