"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, MapPin, Flag, Heart, CreditCard, Shield, Users, Accessibility, Mail, Phone, Home, School, BookOpen, UserCheck, ChevronDown } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/components/auth-provider"
import { useState } from "react"
import { Loader } from "@/components/ui/loader"

// Accordion component for collapsible sections
const Accordion = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div 
        className="p-4 bg-gray-50 border-b flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          {icon}
          {title}
        </CardTitle>
        <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <CardContent className="p-6 space-y-4">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

export default function PersonalInfo() {
  const { student, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (!student) {
    return <div className="p-4 text-yellow-600">No student information found. Please log in.</div>;
  }

  // Helper to show dash for empty fields
  const show = (val: any, fallback = "-") => (val && val !== "") ? val : fallback;

  // Helper to capitalize text
  const capitalize = (text: string) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-blue-100 flex items-center justify-center">
          <User className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Personal Information</h1>
          <p className="text-sm md:text-base text-gray-600">Your personal details and identification information</p>
        </div>
      </div>

      {/* Profile Picture Section */}
      <Card className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="p-4 bg-gray-50 border-b">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <User className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            Profile Picture
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8">
            <div className="h-[300px] w-[250px] bg-white flex items-center justify-center overflow-hidden rounded-[25px] border-2 border-[#f9f9f9] p-[5px] shadow-md">
              <Image
                src={student.profilePictureUrl || "/placeholder-user.jpg"}
                alt="Profile Picture"
                width={240}
                height={290}
                className="object-cover w-full h-full rounded-[20px]"
              />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-lg md:text-xl text-gray-800 mb-2">{show(student.surname)} {show(student.otherNames)}</h3>
              <p className="text-gray-600 mb-3">Student ID: <span className="font-medium">{show(student.registrationNumber) || show(student.studentIndexNumber)}</span></p>
              <Badge className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">{show(student.status, "Active Student")}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information & Identification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Accordion 
          title="Basic Information" 
          icon={<User className="h-4 w-4 md:h-5 md:w-5 text-green-600" />}
          defaultOpen={true}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="text-xs font-medium text-gray-500 block mb-1">Surname</label>
              <p className="text-base font-medium text-gray-900">{show(student.surname)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="text-xs font-medium text-gray-500 block mb-1">Other Names</label>
              <p className="text-base font-medium text-gray-900">{show(student.otherNames)}</p>
            </div>
              </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                <User className="h-3 w-3" />Gender
              </label>
              <p className="text-base font-medium text-gray-900">{capitalize(show(student.gender))}</p>
              </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                <Calendar className="h-3 w-3" />Date of Birth
              </label>
              <p className="text-base font-medium text-gray-900">{show(student.dateOfBirth)}</p>
            </div>
              </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
              <MapPin className="h-3 w-3" />Place of Birth
            </label>
            <p className="text-base font-medium text-gray-900">{show(student.placeOfBirth)}</p>
              </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                <Flag className="h-3 w-3" />Nationality
              </label>
              <p className="text-base font-medium text-gray-900">{show(student.nationality)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                <Heart className="h-3 w-3" />Religion
              </label>
              <p className="text-base font-medium text-gray-900">{show(student.religion)}</p>
            </div>
          </div>
        </Accordion>

        <Accordion 
          title="Identification & Status" 
          icon={<CreditCard className="h-4 w-4 md:h-5 md:w-5 text-green-600" />}
        >
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
              <Heart className="h-3 w-3" />Marital Status
            </label>
            <p className="text-base font-medium text-gray-900">{capitalize(show(student.maritalStatus))}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
              <CreditCard className="h-3 w-3" />Passport Number
            </label>
            <p className="text-base font-medium text-gray-900">{show(student.passportNumber)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
              <Shield className="h-3 w-3" />National ID Number
            </label>
            <p className="text-base font-medium text-gray-900">{show(student.nationalId)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 mb-1">SSNIT Number</label>
            <p className="text-base text-gray-500 italic">{show(student.ssnitNumber, "Not provided")}</p>
              </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                <Users className="h-3 w-3" />Number of Children
              </label>
              <p className="text-base font-medium text-gray-900">{show(student.numberOfChildren)}</p>
              </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                <Accessibility className="h-3 w-3" />Physical Challenge
              </label>
              <p className="text-base font-medium text-gray-900">{show(student.physicalChallenge, "None")}</p>
            </div>
          </div>
        </Accordion>
      </div>

      {/* Guardian & Contact Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Accordion 
          title="Guardian Information" 
          icon={<UserCheck className="h-4 w-4 md:h-5 md:w-5 text-green-600" />}
        >
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 mb-1">Guardian Name</label>
            <p className="text-base font-medium text-gray-900">{show(student.guardianName)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 mb-1">Relationship</label>
            <p className="text-base font-medium text-gray-900">{capitalize(show(student.relationship))}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 mb-1">Guardian Contact</label>
            <p className="text-base font-medium text-gray-900">{show(student.guardianContact)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 mb-1">Guardian Email</label>
            <p className="text-base font-medium text-gray-900">{show(student.guardianEmail)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 mb-1">Guardian Address</label>
            <p className="text-base font-medium text-gray-900">{show(student.guardianAddress)}</p>
          </div>
        </Accordion>
        
        <Accordion 
          title="Contact & Address" 
          icon={<Mail className="h-4 w-4 md:h-5 md:w-5 text-green-600" />}
        >
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
              <Mail className="h-3 w-3" />Email
            </label>
            <p className="text-base font-medium text-gray-900">{show(student.email)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
              <Phone className="h-3 w-3" />Mobile
            </label>
            <p className="text-base font-medium text-gray-900">{show(student.mobile)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
              <Home className="h-3 w-3" />Street
            </label>
            <p className="text-base font-medium text-gray-900">{show(student.street)}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3" />City
              </label>
              <p className="text-base font-medium text-gray-900">{show(student.city)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                <Flag className="h-3 w-3" />Country
              </label>
              <p className="text-base font-medium text-gray-900">{show(student.country)}</p>
            </div>
          </div>
        </Accordion>
      </div>

      {/* Academic Information */}
      <Accordion 
        title="Academic Information" 
        icon={<School className="h-4 w-4 md:h-5 md:w-5 text-green-600" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 mb-1">Programme</label>
            <p className="text-base font-medium text-gray-900">{show(student.programme)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 mb-1">Current Level</label>
            <p className="text-base font-medium text-gray-900">{show(student.currentLevel)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 mb-1">Student Index Number</label>
            <p className="text-base font-medium text-gray-900">{show(student.studentIndexNumber)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 mb-1">Year of Entry</label>
            <p className="text-base font-medium text-gray-900">{show(student.yearOfEntry)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 mb-1">Entry Level</label>
            <p className="text-base font-medium text-gray-900">{show(student.entryLevel)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 mb-1">Entry Academic Year</label>
            <p className="text-base font-medium text-gray-900">{show(student.entryAcademicYear)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 mb-1">Entry Qualification</label>
            <p className="text-base font-medium text-gray-900">{show(student.entryQualification)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 mb-1">Current Period</label>
            <p className="text-base font-medium text-gray-900">{show(student.currentPeriod)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-xs font-medium text-gray-500 mb-1">Schedule Type</label>
            <p className="text-base font-medium text-gray-900">{show(student.scheduleType)}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <label className="text-xs font-medium text-gray-500 mb-1">Hall of Residence</label>
          <p className="text-base font-medium text-gray-900">{show(student.hallOfResidence)}</p>
        </div>
      </Accordion>

      {/* Additional Information */}
      <Accordion 
        title="Additional Notes" 
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>}
      >
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <div className="mt-1 text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-green-800">
              <strong>Note:</strong> Some fields may appear empty if the information has not been provided yet. You can
              update your information by visiting the Student Affairs Office with the required documents.
            </p>
          </div>
        </div>
      </Accordion>
    </div>
  )
}
