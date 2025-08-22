'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Search, 
  User, 
  GraduationCap, 
  Award, 
  FileText, 
  Printer, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Book,
  Trophy
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface StudentData {
  studentId: string
  registrationNumber: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phoneNumber: string
  program: string
  programName: string
  level: string
  currentLevel: string
  scheduleType: 'Regular' | 'Weekend'
  academicYear: string
  semester: string
  gpa?: number
  dateOfBirth: string
  gender: 'Male' | 'Female'
  nationality: string
  region: string
  hometown: string
  residentialAddress: string
  admissionDate: string
  studentStatus: string
  entryQualification: string
  yearOfAdmission: number
  passportPhoto?: string
  profileImage?: string
  academicStanding: 'Good' | 'Probation' | 'Excellent'
  creditsEarned: number
  totalCreditsRequired: number
}

interface ScholarshipFormData {
  scholarshipName: string
  scholarshipType: 'merit' | 'need' | 'sports' | 'academic' | 'leadership' | 'community'
  amount: number
  academicYear: string
  semester: string
  description: string
  criteria: string[]
  renewable: boolean
  renewalCriteria: string[]
  specialConditions: string[]
}

export function EnhancedScholarshipForm() {
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [formData, setFormData] = useState<ScholarshipFormData>({
    scholarshipName: '',
    scholarshipType: 'merit',
    amount: 0,
    academicYear: '',
    semester: '',
    description: '',
    criteria: [],
    renewable: false,
    renewalCriteria: [],
    specialConditions: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLetterPreview, setShowLetterPreview] = useState(false)

  // Load current academic period from centralized settings
  useEffect(() => {
    const loadAcademicPeriod = async () => {
      try {
        const response = await fetch('/api/academic-period')
        const result = await response.json()
        
        if (result.success && result.data) {
          setFormData(prev => ({
            ...prev,
            academicYear: result.data.academicYear,
            semester: result.data.semester
          }))
        }
      } catch (error) {
        console.warn('Failed to load academic period, using defaults:', error)
        setFormData(prev => ({
          ...prev,
          academicYear: '2025/2026',
          semester: 'First Semester'
        }))
      }
    }

    loadAcademicPeriod()
  }, [])

  // Auto-lookup student when registration number changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (registrationNumber.length >= 6) {
        lookupStudent()
      }
    }, 500) // Debounce for 500ms

    return () => clearTimeout(timer)
  }, [registrationNumber])

  const lookupStudent = async () => {
    if (!registrationNumber.trim()) return

    try {
      setLoading(true)
      setSearchError('')
      
      console.log('🔍 Looking up student:', registrationNumber)
      
      // Call server-side API
      const response = await fetch(`/api/student-lookup?registrationNumber=${encodeURIComponent(registrationNumber.trim())}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        setStudentData(result.data)
        console.log('✅ Student found:', result.data.fullName)
        toast({
          title: "Student Found",
          description: `${result.data.fullName} - ${result.data.program} ${result.data.currentLevel}`,
        })
      } else {
        setSearchError(result.error || 'Student not found. Please check the registration number.')
        setStudentData(null)
        toast({
          title: "Student Not Found",
          description: result.error || "Please check the registration number and try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('❌ Error looking up student:', error)
      setSearchError('Error occurred while searching for student.')
      setStudentData(null)
      toast({
        title: "Search Error",
        description: "An error occurred while searching for the student.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleScholarshipSubmit = async () => {
    if (!studentData || !formData.scholarshipName || !formData.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      // Create scholarship award data
      const scholarshipAward = {
        studentId: studentData.studentId,
        scholarshipName: formData.scholarshipName,
        scholarshipType: formData.scholarshipType,
        amount: formData.amount,
        academicYear: formData.academicYear,
        semester: formData.semester,
        description: formData.description,
        criteria: formData.criteria,
        awardedBy: 'HANAMEL Finance Officer',
        awardDate: new Date().toISOString(),
        renewable: formData.renewable,
        renewalCriteria: formData.renewalCriteria,
        specialConditions: formData.specialConditions,
        status: 'awarded',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Remove any undefined values to prevent Firebase errors
      const cleanScholarshipData = Object.fromEntries(
        Object.entries(scholarshipAward).filter(([_, value]) => value !== undefined && value !== '')
      )

      // Save to Firebase
      const { addDoc, collection } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      const docRef = await addDoc(collection(db, 'scholarships'), cleanScholarshipData)

      console.log('✅ Scholarship created:', docRef.id)

      // Create disbursement schedule
      try {
        const response = await fetch('/api/scholarship-disbursement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scholarshipId: docRef.id,
            studentId: studentData.studentId,
            totalAmount: formData.amount,
            academicYear: formData.academicYear,
            semester: formData.semester,
            disbursementPlan: 'semester' // Default to semester-based
          })
        })

        const disbursementResult = await response.json()
        if (disbursementResult.success) {
          console.log('✅ Disbursement schedule created')
        }
      } catch (error) {
        console.warn('⚠️ Failed to create disbursement schedule:', error)
      }
      
      toast({
        title: "Scholarship Awarded Successfully!",
        description: `${formData.scholarshipName} (¢${formData.amount.toLocaleString()}) awarded to ${studentData.fullName}`,
      })

      // Show success and letter options
      setShowLetterPreview(true)
      
    } catch (error) {
      console.error('❌ Error creating scholarship:', error)
      toast({
        title: "Error",
        description: "Failed to create scholarship. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateScholarshipLetter = async () => {
    if (!studentData || !formData.scholarshipName) return

    try {
      const scholarshipData = {
        id: 'temp-id',
        studentId: studentData.studentId,
        scholarshipName: formData.scholarshipName,
        scholarshipType: formData.scholarshipType,
        amount: formData.amount,
        academicYear: formData.academicYear,
        semester: formData.semester,
        description: formData.description,
        criteria: formData.criteria,
        awardedBy: 'HANAMEL Finance Officer',
        awardDate: new Date().toISOString(),
        renewable: formData.renewable,
        renewalCriteria: formData.renewalCriteria,
        specialConditions: formData.specialConditions
      }

      // Remove any undefined values
      const cleanScholarshipData = Object.fromEntries(
        Object.entries(scholarshipData).filter(([_, value]) => value !== undefined && value !== '')
      )

      // Call server-side API to generate letter
      const response = await fetch('/api/generate-scholarship-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentData,
          scholarshipData: cleanScholarshipData,
          signatoryName: 'HANAMEL Finance Officer'
        })
      })
      
      const result = await response.json()
      
      if (result.success && result.data) {
        // Open letter in new window for printing
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(result.data.letterHtml)
          printWindow.document.close()
          printWindow.focus()
          
          toast({
            title: "Letter Generated",
            description: `Scholarship letter opened in new window. Reference: ${result.data.letterReference}`,
          })
        }
      } else {
        throw new Error(result.error || 'Failed to generate letter')
      }
    } catch (error) {
      console.error('❌ Error generating letter:', error)
      toast({
        title: "Error",
        description: "Failed to generate scholarship letter.",
        variant: "destructive"
      })
    }
  }

  const clearForm = () => {
    setRegistrationNumber('')
    setStudentData(null)
    setSearchError('')
    setFormData({
      scholarshipName: '',
      scholarshipType: 'merit',
      amount: 0,
      academicYear: '2025/2026',
      semester: 'First Semester',
      description: '',
      criteria: [],
      renewable: false,
      renewalCriteria: [],
      specialConditions: []
    })
    setShowLetterPreview(false)
  }

  return (
    <div className="space-y-6">
      {/* Student Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Student Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="registration">Student Registration Number</Label>
              <Input
                id="registration"
                placeholder="Enter student registration number (e.g., UCAES20250001)"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                className="mt-1"
              />
              {searchError && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {searchError}
                </p>
              )}
            </div>
            <Button onClick={lookupStudent} disabled={loading || !registrationNumber.trim()}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student Information Display */}
      {studentData && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <User className="h-5 w-5" />
              Student Information
              <Badge variant="outline" className="ml-auto text-green-700 border-green-300">
                {studentData.studentStatus}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Student Photo */}
              {studentData.passportPhoto && (
                <div className="md:col-span-1">
                  <div className="text-center">
                    <img 
                      src={studentData.passportPhoto} 
                      alt="Student Photo"
                      className="w-32 h-40 object-cover border-2 border-green-300 rounded-lg mx-auto mb-2"
                    />
                    <p className="text-sm text-green-700 font-medium">Passport Photo</p>
                  </div>
                </div>
              )}
              
              {/* Personal Information */}
              <div className={studentData.passportPhoto ? "md:col-span-1" : "md:col-span-2"}>
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Full Name:</strong> {studentData.fullName}</div>
                  <div><strong>Student ID:</strong> {studentData.studentId}</div>
                  <div><strong>Gender:</strong> {studentData.gender}</div>
                  <div><strong>Nationality:</strong> {studentData.nationality}</div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <strong>Email:</strong> {studentData.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <strong>Phone:</strong> {studentData.phoneNumber || 'Not provided'}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <strong>Address:</strong> {studentData.residentialAddress || 'Not provided'}
                  </div>
                </div>
              </div>
              
              {/* Academic Information */}
              <div className="md:col-span-1">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Academic Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Book className="h-3 w-3" />
                    <strong>Programme:</strong> {studentData.programName}
                  </div>
                  <div><strong>Level:</strong> {studentData.currentLevel}</div>
                  <div><strong>Schedule:</strong> {studentData.scheduleType}</div>
                  <div><strong>Academic Year:</strong> {studentData.academicYear}</div>
                  <div><strong>Semester:</strong> {studentData.semester}</div>
                  {studentData.gpa && (
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      <strong>CGPA:</strong> 
                      <Badge variant="outline" className="ml-1">
                        {studentData.gpa.toFixed(2)}
                      </Badge>
                    </div>
                  )}
                  <div>
                    <strong>Academic Standing:</strong>
                    <Badge 
                      variant="outline" 
                      className={`ml-1 ${
                        studentData.academicStanding === 'Excellent' ? 'text-green-700 border-green-300' :
                        studentData.academicStanding === 'Good' ? 'text-blue-700 border-blue-300' :
                        'text-orange-700 border-orange-300'
                      }`}
                    >
                      {studentData.academicStanding}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            

          </CardContent>
        </Card>
      )}

      {/* Scholarship Form */}
      {studentData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Scholarship Award Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scholarshipName">Scholarship Name *</Label>
                <Input
                  id="scholarshipName"
                  placeholder="e.g., Excellence in Agriculture Scholarship"
                  value={formData.scholarshipName}
                  onChange={(e) => setFormData(prev => ({ ...prev, scholarshipName: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="scholarshipType">Scholarship Type *</Label>
                <Select 
                  value={formData.scholarshipType} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, scholarshipType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="merit">Merit-Based</SelectItem>
                    <SelectItem value="need">Need-Based</SelectItem>
                    <SelectItem value="sports">Sports/Athletic</SelectItem>
                    <SelectItem value="academic">Academic Excellence</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="community">Community Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Scholarship Amount (GH₵) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div>
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  value={formData.academicYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the scholarship and its purpose..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="renewable"
                  checked={formData.renewable}
                  onChange={(e) => setFormData(prev => ({ ...prev, renewable: e.target.checked }))}
                />
                <Label htmlFor="renewable">Renewable Scholarship</Label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleScholarshipSubmit} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Awarding...' : 'Award Scholarship'}
              </Button>
              <Button variant="outline" onClick={clearForm}>
                Clear Form
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Actions */}
      {showLetterPreview && studentData && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <CheckCircle2 className="h-5 w-5" />
              Scholarship Awarded Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Award Summary</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Student:</strong> {studentData.fullName} ({studentData.studentId})</div>
                  <div><strong>Scholarship:</strong> {formData.scholarshipName}</div>
                  <div><strong>Amount:</strong> GH₵ {formData.amount.toLocaleString()}.00</div>
                  <div><strong>Type:</strong> {formData.scholarshipType}</div>
                  <div><strong>Academic Year:</strong> {formData.academicYear}</div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button onClick={generateScholarshipLetter} className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Generate Award Letter
                </Button>
                <Button variant="outline" onClick={generateScholarshipLetter} className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print Letter
                </Button>
                <Button variant="outline" onClick={clearForm}>
                  Award Another Scholarship
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
