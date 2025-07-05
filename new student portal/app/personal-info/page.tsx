"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, MapPin, Flag, Heart, CreditCard, Shield, Users, Accessibility, Mail, Phone, Home, School, BookOpen, UserCheck } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"

export default function PersonalInfo() {
  const { student, loading, error } = useAuth();

  if (loading) {
    return <div className="p-6">Loading your information...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  if (!student) {
    return <div className="p-6 text-yellow-600">No student information found. Please log in.</div>;
  }

  // Helper to show dash for empty fields
  const show = (val: any, fallback = "-") => (val && val !== "") ? val : fallback;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
          <User className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personal Information</h1>
          <p className="text-gray-600">Your personal details and identification information</p>
        </div>
      </div>

      {/* Profile Picture Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            Profile Picture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-green-100">
              <Image
                src={student.profilePictureUrl || "/placeholder-user.jpg"}
                alt="Profile Picture"
                width={96}
                height={96}
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{show(student.surname)} {show(student.otherNames)}</h3>
              <p className="text-gray-600">Student ID: {show(student.registrationNumber) || show(student.studentIndexNumber)}</p>
              <Badge className="mt-2 bg-green-100 text-green-800">{show(student.status, "Active Student")}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information & Identification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Surname</label>
                <p className="text-gray-900 font-medium">{show(student.surname)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Other Names</label>
                <p className="text-gray-900 font-medium">{show(student.otherNames)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1"><User className="h-4 w-4" />Gender</label>
                <p className="text-gray-900 font-medium">{show(student.gender)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Calendar className="h-4 w-4" />Date of Birth</label>
                <p className="text-gray-900 font-medium">{show(student.dateOfBirth)}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1"><MapPin className="h-4 w-4" />Place of Birth</label>
              <p className="text-gray-900 font-medium">{show(student.placeOfBirth)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Flag className="h-4 w-4" />Nationality</label>
                <p className="text-gray-900 font-medium">{show(student.nationality)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Heart className="h-4 w-4" />Religion</label>
                <p className="text-gray-900 font-medium">{show(student.religion)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-green-600" />Identification & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Heart className="h-4 w-4" />Marital Status</label><p className="text-gray-900 font-medium">{show(student.maritalStatus)}</p></div>
            <div><label className="text-sm font-medium text-gray-700 flex items-center gap-1"><CreditCard className="h-4 w-4" />Passport Number</label><p className="text-gray-900 font-medium">{show(student.passportNumber)}</p></div>
            <div><label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Shield className="h-4 w-4" />National ID Number</label><p className="text-gray-900 font-medium">{show(student.nationalId)}</p></div>
            <div><label className="text-sm font-medium text-gray-700">SSNIT Number</label><p className="text-gray-500 italic">{show(student.ssnitNumber, "Not provided")}</p></div>
            <div><label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Users className="h-4 w-4" />Number of Children</label><p className="text-gray-900 font-medium">{show(student.numberOfChildren)}</p></div>
            <div><label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Accessibility className="h-4 w-4" />Physical Challenge Information</label><p className="text-gray-900 font-medium">{show(student.physicalChallenge, "None")}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Guardian & Contact Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-green-600" />Guardian Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-medium text-gray-700">Guardian Name</label><p className="text-gray-900 font-medium">{show(student.guardianName)}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Relationship</label><p className="text-gray-900 font-medium">{show(student.relationship)}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Guardian Contact</label><p className="text-gray-900 font-medium">{show(student.guardianContact)}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Guardian Email</label><p className="text-gray-900 font-medium">{show(student.guardianEmail)}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Guardian Address</label><p className="text-gray-900 font-medium">{show(student.guardianAddress)}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-green-600" />Contact & Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Mail className="h-4 w-4" />Email</label><p className="text-gray-900 font-medium">{show(student.email)}</p></div>
            <div><label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Phone className="h-4 w-4" />Mobile</label><p className="text-gray-900 font-medium">{show(student.mobile)}</p></div>
            <div><label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Home className="h-4 w-4" />Street</label><p className="text-gray-900 font-medium">{show(student.street)}</p></div>
            <div><label className="text-sm font-medium text-gray-700 flex items-center gap-1"><MapPin className="h-4 w-4" />City</label><p className="text-gray-900 font-medium">{show(student.city)}</p></div>
            <div><label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Flag className="h-4 w-4" />Country</label><p className="text-gray-900 font-medium">{show(student.country)}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><School className="h-5 w-5 text-green-600" />Academic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-gray-700">Programme</label><p className="text-gray-900 font-medium">{show(student.programme)}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Year of Entry</label><p className="text-gray-900 font-medium">{show(student.yearOfEntry)}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-gray-700">Entry Qualification</label><p className="text-gray-900 font-medium">{show(student.entryQualification)}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Entry Level</label><p className="text-gray-900 font-medium">{show(student.entryLevel)}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-gray-700">Current Level</label><p className="text-gray-900 font-medium">{show(student.currentLevel)}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Entry Academic Year</label><p className="text-gray-900 font-medium">{show(student.entryAcademicYear)}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-gray-700">Current Period</label><p className="text-gray-900 font-medium">{show(student.currentPeriod)}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Hall of Residence</label><p className="text-gray-900 font-medium">{show(student.hallOfResidence)}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-gray-700">Schedule Type</label><p className="text-gray-900 font-medium">{show(student.scheduleType)}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Student Index Number</label><p className="text-gray-900 font-medium">{show(student.studentIndexNumber)}</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <CardDescription>
            If you need to update any of this information, please contact the Student Affairs Office.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Note:</strong> Some fields may appear empty if the information has not been provided yet. You can
              update your information by visiting the Student Affairs Office with the required documents.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
