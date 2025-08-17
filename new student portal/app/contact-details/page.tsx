import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Phone, Mail, MapPin, User, Home } from "lucide-react"

export default function ContactDetails() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
          <Users className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Details</h1>
          <p className="text-gray-600">Guardian and student contact information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guardian Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Guardian Details
            </CardTitle>
            <CardDescription>Primary contact person for emergencies and official communication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <User className="h-4 w-4" />
                Guardian's Name
              </label>
              <p className="text-gray-900 font-medium">Mrs. Jane Doe</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Relationship to Student</label>
              <p className="text-gray-900 font-medium">Mother</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Guardian's Contact Number
              </label>
              <p className="text-gray-900 font-medium">+233 24 123 4567</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Guardian's Email
              </label>
              <p className="text-gray-900 font-medium">jane.doe@email.com</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Guardian's Address
              </label>
              <div className="text-gray-900 font-medium">
                <p>123 Main Street</p>
                <p>East Legon, Accra</p>
                <p>Greater Accra Region</p>
                <p>Ghana</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Contact Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Student Contact Details
            </CardTitle>
            <CardDescription>Your personal contact information for university communication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Mobile Number
              </label>
              <p className="text-gray-900 font-medium">+233 55 987 6543</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Telephone Number
              </label>
              <p className="text-gray-500 italic">Not provided</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Student's Email
              </label>
              <p className="text-gray-900 font-medium">john.doe@student.ucaes.edu.gh</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Home className="h-4 w-4" />
                Student's Address
              </label>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-500">Street</label>
                  <p className="text-gray-900 font-medium">University Hostel Block A, Room 205</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">City</label>
                  <p className="text-gray-900 font-medium">Bunso</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Country</label>
                  <p className="text-gray-900 font-medium">Ghana</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-red-600" />
            Emergency Contact
          </CardTitle>
          <CardDescription>Additional emergency contact information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Emergency Contact Name</label>
                <p className="text-gray-900 font-medium">Mr. Robert Doe</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Relationship</label>
                <p className="text-gray-900 font-medium">Father</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Emergency Contact Number</label>
                <p className="text-gray-900 font-medium">+233 20 555 1234</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Alternative Number</label>
                <p className="text-gray-500 italic">Not provided</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Information Notice */}
      <Card>
        <CardContent className="pt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Need to Update Your Information?</h4>
            <p className="text-sm text-blue-800">
              To update your contact details, please visit the Student Affairs Office with the following documents:
            </p>
            <ul className="text-sm text-blue-800 mt-2 ml-4 list-disc">
              <li>Valid student ID card</li>
              <li>Updated contact information form</li>
              <li>Guardian's consent letter (if updating guardian details)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
