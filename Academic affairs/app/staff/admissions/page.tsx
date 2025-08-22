"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Calendar, Search, Eye, FileText, CheckCircle, Clock, MessageSquare, Users, GraduationCap, DollarSign, Download, Image, FileText as FileTextIcon, User, ArrowLeft, Printer, AlertCircle, ArrowUpCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RouteGuard } from "@/components/route-guard"

interface AdmissionApplication {
  id: string
  applicationId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  program: string
  level: string
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected'
  paymentStatus: 'pending' | 'paid' | 'failed'
  submittedAt: string
  reviewedBy?: string
  reviewedAt?: string
  feedback?: string
  
  // Personal Information
  dateOfBirth?: string
  gender?: string
  nationality?: string
  region?: string
  
  // Contact Information
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  
  // Academic Background
  schoolName?: string
  qualificationType?: string
  yearCompleted?: string
  subjects?: Array<{ subject: string; grade: string }>
  
  // Program Selection
  programType?: string
  studyLevel?: string // Add study level field
  studyMode?: string
  firstChoice?: string
  secondChoice?: string
  
  // Top-up specific fields
  previousQualification?: string
  previousProgram?: string
  previousInstitution?: string
  previousYearCompleted?: string
  creditTransfer?: number
  
  // Documents
  documents?: {
    idDocument?: string
    certificate?: string
    transcript?: string
    photo?: string
  }
  
  // Document URLs for viewing/downloading
  documentUrls?: {
    idDocument?: string
    certificate?: string
    transcript?: string
    photo?: string
  }
  
  // Mature Student Information
  isMatureStudent?: boolean
  matureStudentInfo?: {
    age: number
    eligibilityType: 'age' | 'work_experience' | 'professional_qualification' | 'life_experience'
    workExperience: Array<{
      employer: string
      position: string
      startDate: string
      endDate: string
      responsibilities: string
      isCurrentJob: boolean
    }>
    totalWorkYears: number
    professionalQualifications: Array<{
      qualification: string
      institution: string
      yearObtained: string
      relevantToProgram: boolean
    }>
    lifeExperience: string
    relevantSkills: string[]
    volunteerWork: string
    hasFormaleducation: boolean
    lastEducationLevel: string
    lastEducationYear: string
    motivationStatement: string
    careerGoals: string
    whyThisProgram: string
    needsSupport: boolean
    supportType: string[]
    hasDisability: boolean
    disabilityDetails: string
    employmentStatus: 'employed' | 'unemployed' | 'self_employed' | 'retired'
    familyResponsibilities: boolean
    familyDetails: string
    studyTimeAvailable: string
  }
}

function AdmissionsDashboard() {
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedApplicationType, setSelectedApplicationType] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null)
  const [feedback, setFeedback] = useState("")
  const [applications, setApplications] = useState<AdmissionApplication[]>([])
  const [viewMode, setViewMode] = useState<"list" | "details">("list")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mature Student Applications View
  const [activeTab, setActiveTab] = useState<"all" | "mature" | "traditional">("all")
  const [matureStudentApplications, setMatureStudentApplications] = useState<AdmissionApplication[]>([])
  const [traditionalApplications, setTraditionalApplications] = useState<AdmissionApplication[]>([])

  // Admission year management state
  const [admissionSettings, setAdmissionSettings] = useState<{
    currentYear: any;
    statistics: any;
  } | null>(null)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [availableYears, setAvailableYears] = useState<Array<{id: string; year: string; displayName: string}>>([])
  const [selectedYearToSet, setSelectedYearToSet] = useState<string | null>(null)
  const [generatingLetter, setGeneratingLetter] = useState<string | null>(null)

  // Director program selection for top-up applications
  const [directorApprovedProgram, setDirectorApprovedProgram] = useState<string>("")
  const [directorApprovedLevel, setDirectorApprovedLevel] = useState<string>("")

  // Available programs for director selection
  const availablePrograms = [
    "B.Sc. Sustainable Agriculture",
    "B.Sc. Environmental Science and Management", 
    "Certificate in Agriculture",
    "Certificate in Environmental Science",
    "Diploma in Organic Agriculture",
    "Certificate in Sustainable Agriculture",
    "Certificate in Waste Management & Environmental Health",
    "Certificate in Bee Keeping",
    "Certificate in Agribusiness",
    "Certificate in Business Administration"
  ]

  // Available levels based on application type
  const getAvailableLevels = (application: AdmissionApplication) => {
    if (application.programType === 'topup') {
      if (application.previousQualification?.includes('Certificate')) {
        return ['200']
      } else if (application.previousQualification?.includes('Diploma')) {
        return ['200', '300']
      }
      return ['200', '300', '400']
    }
    return ['100'] // Fresh applications start at Level 100
  }

  // Fetch real data from API
  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/admissions/applications')
        const data = await response.json()
        
        console.log('📡 API Response:', data)
        
        // Handle the API response structure
        if (data.success && Array.isArray(data.applications)) {
          console.log('✅ Setting applications:', data.applications.length, 'applications')
          
          // Debug: Log the first application to see its structure
          if (data.applications.length > 0) {
            console.log('🔍 First application data structure:', data.applications[0])
            console.log('🔍 Looking for jeffery achumboro:', data.applications.find(app => 
              app.firstName?.toLowerCase().includes('jeffery') || 
              app.lastName?.toLowerCase().includes('achumboro')
            ))
          }
          
          setApplications(data.applications)
        } else {
          console.log('❌ Invalid API response structure:', data)
          setError('Invalid response from server')
        }
      } catch (error) {
        console.error('❌ Error fetching applications:', error)
        setError('Failed to load applications')
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [])

  // Separate mature student and traditional applications
  useEffect(() => {
    if (applications.length > 0) {
      const mature = applications.filter(app => app.isMatureStudent === true)
      const traditional = applications.filter(app => app.isMatureStudent !== true)
      
      setMatureStudentApplications(mature)
      setTraditionalApplications(traditional)
      
      console.log(`📊 Separated applications: ${mature.length} mature, ${traditional.length} traditional`)
    }
  }, [applications])

  // Fetch admission settings
  useEffect(() => {
    const fetchAdmissionSettings = async () => {
      setIsLoadingSettings(true)
      
      try {
        const response = await fetch('/api/admissions/settings')
        const data = await response.json()
        
        if (data.success) {
          setAdmissionSettings(data)
          if (Array.isArray(data.availableYears)) {
            setAvailableYears(
              data.availableYears.map((y: any) => ({ 
                id: y.id || y.year, // Use id from API, fallback to year if missing
                year: String(y.year), 
                displayName: y.displayName || String(y.year) 
              }))
            )
          }
        } else {
          console.error('Failed to fetch admission settings:', data.error)
        }
      } catch (error) {
        console.error('Error fetching admission settings:', error)
      } finally {
        setIsLoadingSettings(false)
      }
    }

    fetchAdmissionSettings()
  }, [])

  // Handle admission status update
  const handleUpdateAdmissionStatus = async (status: 'open' | 'closed' | 'pending') => {
    if (!admissionSettings?.currentYear) return
    
    setIsUpdatingStatus(true)
    
    try {
      const response = await fetch('/api/admissions/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: admissionSettings.currentYear.year,
          status,
          userId: 'director' // You might want to get this from auth context
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: `Admissions ${status === 'open' ? 'opened' : status === 'closed' ? 'closed' : 'set to pending'} successfully`,
        })
        
        // Refresh admission settings
        const refreshResponse = await fetch('/api/admissions/settings')
        const refreshData = await refreshResponse.json()
        if (refreshData.success) {
          setAdmissionSettings(refreshData)
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update admission status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating admission status:', error)
      toast({
        title: "Error",
        description: "Failed to update admission status",
        variant: "destructive"
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Handle sync admission status to public portal
  const handleSyncAdmissionStatus = async () => {
    setIsUpdatingStatus(true)
    
    try {
      const response = await fetch('/api/admissions/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Admission status synced to public portal successfully",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to sync admission status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error syncing admission status:', error)
      toast({
        title: "Error",
        description: "Failed to sync admission status",
        variant: "destructive"
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Simple admission toggle that updates the current academic year
  const handleSimpleAdmissionToggle = async (status: 'open' | 'closed') => {
    if (!admissionSettings?.currentYear?.id) {
      toast({
        title: "Error",
        description: "No current academic year configured. Please set an academic year first.",
        variant: "destructive"
      })
      return
    }
    
    setIsUpdatingStatus(true)
    
    try {
      // Update the current academic year's admission status
      const response = await fetch('/api/admissions/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: admissionSettings.currentYear.id,
          status,
          userId: 'director'
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: `Admissions ${status === 'open' ? 'opened' : 'closed'} successfully`,
        })
        
        // Update the local state to reflect the change
        setAdmissionSettings(prev => ({
          ...prev,
          currentYear: {
            ...prev?.currentYear,
            admissionStatus: status
          }
        }))
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update admission status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating admission status:', error)
      toast({
        title: "Error",
        description: "Failed to update admission status",
        variant: "destructive"
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Handle setting the current academic/admission year
  const handleSetCurrentYear = async () => {
    if (!selectedYearToSet) return
    try {
      const resp = await fetch('/api/admissions/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: selectedYearToSet, userId: 'director' })
      })
      const result = await resp.json()
      if (result.success) {
        toast({ title: 'Admission Year Updated', description: `Set ${selectedYearToSet} as current admission year` })
        // refresh settings
        const refresh = await fetch('/api/admissions/settings')
        const refreshData = await refresh.json()
        if (refreshData.success) {
          setAdmissionSettings(refreshData)
        }
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to set current year', variant: 'destructive' })
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to set current year', variant: 'destructive' })
    }
  }

  const filteredApplications = (Array.isArray(applications) ? applications : []).filter((app) => {
    const matchesSearch =
      app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationId.toLowerCase().includes(searchTerm.toLowerCase())

    // Fix date filtering - use createdAt and handle both string and timestamp formats
    let matchesDate = true; // Default to show all if no date filter
    if (selectedDate) {
      let appDate = null;
      
      if (app.createdAt) {
        if (typeof app.createdAt === 'string') {
          // String format: "2025-08-07T14:18:51.516Z"
          appDate = app.createdAt.split("T")[0];
        } else if (app.createdAt._seconds) {
          // Firestore timestamp format: { _seconds: 1754932114, _nanoseconds: 607000000 }
          appDate = new Date(app.createdAt._seconds * 1000).toISOString().split("T")[0];
        }
      }
      
      matchesDate = appDate === selectedDate;
    }

    // Application type filtering
    const matchesType = selectedApplicationType === "all" || 
      (selectedApplicationType === "topup" && app.programType === "topup") ||
      (selectedApplicationType === "fresh" && (!app.programType || app.programType === "fresh" || app.programType === "degree" || app.programType === "certificate"));

    return matchesSearch && matchesDate && matchesType
  })

  const handleReviewApplication = async (applicationId: string, status: "accepted" | "rejected") => {
    try {
      console.log('🔄 Updating application status:', applicationId, status);
      
      // Update via API using applicationId (not document ID)
      const response = await fetch(`/api/admissions/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationStatus: status,
          reviewNotes: feedback,
          directorApprovedProgram: status === 'accepted' ? directorApprovedProgram : undefined,
          directorApprovedLevel: status === 'accepted' ? directorApprovedLevel : undefined
        }),
      })

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Application status updated successfully:', result);
        
        // Update local state using applicationId for comparison
        setApplications(prev => Array.isArray(prev) ? prev.map(app => 
          app.applicationId === applicationId 
            ? {
                ...app,
                status,
                applicationStatus: status,
                lastReviewedBy: "director",
                lastReviewedAt: new Date().toISOString(),
                reviewNotes: feedback,
              }
            : app
        ) : [])

        setFeedback("")
        setDirectorApprovedProgram("")
        setDirectorApprovedLevel("")
        setSelectedApplication(null)
        setViewMode("list")

        // Enhanced toast message for accepted students
        if (status === 'accepted' && result.transfer) {
          if (result.transfer.success) {
            toast({
              title: "✅ Application Accepted & Student Portal Access Created",
              description: `Student has been accepted and automatically added to the student portal. Registration Number: ${result.transfer.registrationNumber}. They can now login with this number and their date of birth.`,
              duration: 8000,
            })
          } else {
            toast({
              title: "⚠️ Application Accepted (Transfer Issue)",
              description: `Application accepted but there was an issue transferring to student portal: ${result.transfer.error}. Please contact IT support.`,
              variant: "destructive",
              duration: 8000,
            })
          }
        } else {
          toast({
            title: "Application Reviewed",
            description: `Application has been ${status}`,
          })
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        toast({
          title: "Error",
          description: `Failed to review application: ${response.status}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('❌ Network Error:', error);
      toast({
        title: "Error",
        description: "Failed to review application",
        variant: "destructive",
      })
    }
  }

  const handleGenerateAdmissionLetter = async (applicationId: string) => {
    try {
      setGeneratingLetter(applicationId);
      console.log('📄 Generating admission letter for:', applicationId);
      
      const response = await fetch('/api/admissions/generate-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId }),
      });

      if (response.ok) {
        // Download the PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Get filename from response headers if available
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `UCAES_Admission_Letter_${applicationId}.pdf`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: "Admission letter generated and downloaded successfully!",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate admission letter');
      }
    } catch (error) {
      console.error('❌ Error generating admission letter:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate admission letter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingLetter(null);
    }
  }

  const handleDownloadDocument = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      toast({
        title: "Document Downloaded",
        description: `${filename} has been downloaded`,
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download document",
        variant: "destructive",
      })
    }
  }

  const handleViewDocument = (url: string, filename: string) => {
    window.open(url, '_blank')
    
    toast({
      title: "Document Opened",
      description: `${filename} is now open in a new tab`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "default"
      case "under_review":
        return "secondary"
      case "accepted":
        return "default"
      case "rejected":
        return "destructive"
      case "draft":
        return "outline"
      default:
        return "outline"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const todaysApplications = applications.filter(app => 
    app.submittedAt && typeof app.submittedAt === 'string' && 
    app.submittedAt.split("T")[0] === new Date().toISOString().split("T")[0]
  )
  const pendingApplications = applications.filter(app => app.status === "submitted")
  const acceptedApplications = applications.filter(app => app.status === "accepted")
  const paidApplications = applications.filter(app => app.paymentStatus === "paid")

  // Handle application selection
  const handleApplicationSelect = (application: AdmissionApplication) => {
    console.log('🔍 Selected application for details:', application)
    console.log('🔍 Application data structure:', {
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      phone: application.phone,
      address: application.address,
      schoolName: application.schoolName,
      qualificationType: application.qualificationType,
      yearCompleted: application.yearCompleted,
      firstChoice: application.firstChoice,
      secondChoice: application.secondChoice,
      studyMode: application.studyMode,
      studyLevel: application.studyLevel
    })
    setSelectedApplication(application)
    setViewMode("details")
  }

  // Full-page application details view
  if (viewMode === "details" && selectedApplication) {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setViewMode("list")
                setSelectedApplication(null)
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Application Details</h1>
              <p className="text-muted-foreground">
                {selectedApplication.firstName} {selectedApplication.lastName} - {selectedApplication.applicationId}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print Application
            </Button>
          </div>
        </div>

        {/* Application Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Application ID</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold font-mono">{selectedApplication.applicationId}</div>
              <p className="text-xs text-muted-foreground">Unique identifier</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={getStatusColor(selectedApplication.status)} className="text-sm">
                {selectedApplication.status}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Application status</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={getPaymentStatusColor(selectedApplication.paymentStatus)} className="text-sm">
                {selectedApplication.paymentStatus}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Payment status</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Application Type</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {selectedApplication.programType === 'topup' ? 'Top-Up' : 'Fresh'}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedApplication.programType === 'topup' ? 'Continuing student' : 'New student'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top-Up Application Alert Banner */}
        {selectedApplication.programType === 'topup' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <ArrowUpCircle className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Top-Up Application</h3>
              <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700">
                Level {selectedApplication.studyLevel || 'N/A'} Entry
              </Badge>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              This student is applying to continue from their previous qualification. 
              Please review the transcript and certificate documents carefully before approval.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Previous Qualification:</span>
                <p className="text-blue-900 font-semibold">{selectedApplication.previousQualification || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Previous Institution:</span>
                <p className="text-blue-900 font-semibold">{selectedApplication.previousInstitution || selectedApplication.schoolName || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Year Completed:</span>
                <p className="text-blue-900 font-semibold">{selectedApplication.previousYearCompleted || selectedApplication.yearCompleted || 'Not specified'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Application Summary for Directors */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Application Summary for Director Review
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-700 font-medium">Student Name:</span>
              <p className="text-gray-900 font-semibold">{selectedApplication.firstName} {selectedApplication.lastName}</p>
            </div>
            <div>
              <span className="text-gray-700 font-medium">Application Type:</span>
              <p className="text-gray-900 font-semibold">
                {selectedApplication.programType === 'topup' ? 'Top-Up (Continuing Student)' : 'Fresh Application (New Student)'}
              </p>
            </div>
            <div>
              <span className="text-gray-700 font-medium">Target Program:</span>
              <p className="text-gray-900 font-semibold">{selectedApplication.firstChoice || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-700 font-medium">Entry Level:</span>
              <p className="text-gray-900 font-semibold">
                {selectedApplication.studyLevel ? `Level ${selectedApplication.studyLevel}` : 'To be determined'}
              </p>
            </div>
            {selectedApplication.programType === 'topup' && (
              <>
                <div>
                  <span className="text-gray-700 font-medium">Previous Qualification:</span>
                  <p className="text-gray-900 font-semibold">{selectedApplication.previousQualification || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-gray-700 font-medium">Transcript Status:</span>
                  <p className={`font-semibold ${selectedApplication.documentUrls?.transcript ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedApplication.documentUrls?.transcript ? 'Uploaded ✓' : 'Missing ✗'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Detailed Information Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                  <p className="text-lg font-semibold">{selectedApplication.firstName} {selectedApplication.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
                  <p className="text-lg">{selectedApplication.dateOfBirth || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Gender</Label>
                  <p className="text-lg capitalize">{selectedApplication.gender || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Nationality</Label>
                  <p className="text-lg capitalize">{selectedApplication.nationality || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-600">Region</Label>
                  <p className="text-lg capitalize">
                    {selectedApplication.region?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-lg">{selectedApplication.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <p className="text-lg">{selectedApplication.phone}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-600">Address</Label>
                  <p className="text-lg">{selectedApplication.address || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Emergency Contact</Label>
                  <p className="text-lg">{selectedApplication.emergencyContact || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Emergency Phone</Label>
                  <p className="text-lg">{selectedApplication.emergencyPhone || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Background */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Academic Background</span>
                {selectedApplication.programType === 'topup' && (
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                    Previous Qualification
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">School/Institution</Label>
                  <p className="text-lg">{selectedApplication.schoolName || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Qualification</Label>
                  <p className="text-lg uppercase">{selectedApplication.qualificationType || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Year Completed</Label>
                  <p className="text-lg">{selectedApplication.yearCompleted || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Application Submitted</Label>
                  <p className="text-lg">
                    {selectedApplication.submittedAt ? new Date(selectedApplication.submittedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              {/* Top-up specific academic information */}
              {selectedApplication.programType === 'topup' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Top-Up Academic Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-blue-700 font-medium">Previous Program:</Label>
                      <p className="text-blue-900 font-semibold">{selectedApplication.previousProgram || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-blue-700 font-medium">Credit Transfer:</Label>
                      <p className="text-blue-900 font-semibold">
                        {selectedApplication.creditTransfer ? `${selectedApplication.creditTransfer} credits` : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedApplication.subjects && selectedApplication.subjects.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Subject Results</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {selectedApplication.subjects.map((subject, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium text-sm">{subject.subject}</div>
                        <div className="text-lg font-bold text-blue-600">{subject.grade}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mature Student Information */}
              {selectedApplication.isMatureStudent && selectedApplication.matureStudentInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Mature Student Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-blue-700 font-medium">Age:</Label>
                      <p className="text-blue-900 font-semibold">{selectedApplication.matureStudentInfo.age} years</p>
                    </div>
                    <div>
                      <Label className="text-blue-700 font-medium">Eligibility Type:</Label>
                      <p className="text-blue-900 font-semibold capitalize">
                        {selectedApplication.matureStudentInfo.eligibilityType.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <Label className="text-blue-700 font-medium">Total Work Experience:</Label>
                      <p className="text-blue-900 font-semibold">{selectedApplication.matureStudentInfo.totalWorkYears} years</p>
                    </div>
                    <div>
                      <Label className="text-blue-700 font-medium">Employment Status:</Label>
                      <p className="text-blue-900 font-semibold capitalize">
                        {selectedApplication.matureStudentInfo.employmentStatus}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-blue-700 font-medium">Work Experience:</Label>
                      <div className="space-y-2 mt-2">
                        {selectedApplication.matureStudentInfo.workExperience.map((job, index) => (
                          <div key={index} className="bg-blue-100 p-3 rounded">
                            <div className="font-medium text-blue-900">
                              {job.position} at {job.employer}
                            </div>
                            <div className="text-xs text-blue-700">
                              {job.startDate} - {job.isCurrentJob ? 'Present' : job.endDate}
                            </div>
                            <div className="text-sm text-blue-800 mt-1">{job.responsibilities}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {selectedApplication.matureStudentInfo.professionalQualifications.length > 0 && (
                      <div className="md:col-span-2">
                        <Label className="text-blue-700 font-medium">Professional Qualifications:</Label>
                        <div className="space-y-2 mt-2">
                          {selectedApplication.matureStudentInfo.professionalQualifications.map((qual, index) => (
                            <div key={index} className="bg-blue-100 p-3 rounded">
                              <div className="font-medium text-blue-900">{qual.qualification}</div>
                              <div className="text-xs text-blue-700">
                                {qual.institution} ({qual.yearObtained})
                              </div>
                              <div className="text-sm text-blue-800 mt-1">
                                {qual.relevantToProgram ? '✅ Relevant to program' : '⚠️ Not directly relevant'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedApplication.matureStudentInfo.needsSupport && (
                      <div className="md:col-span-2">
                        <Label className="text-blue-700 font-medium">Support Services Needed:</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedApplication.matureStudentInfo.supportType.map((service, index) => (
                            <Badge key={index} variant="outline" className="bg-yellow-100 text-yellow-800 text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <Label className="text-blue-700 font-medium">Motivation Statement:</Label>
                      <p className="text-blue-900 mt-1">{selectedApplication.matureStudentInfo.motivationStatement}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-blue-700 font-medium">Career Goals:</Label>
                      <p className="text-blue-900 mt-1">{selectedApplication.matureStudentInfo.careerGoals}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Program Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Program Selection</span>
                {selectedApplication.programType === 'topup' && (
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                    Top-Up Application
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Top-up specific information */}
              {selectedApplication.programType === 'topup' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Top-Up Application Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-blue-700 font-medium">Previous Qualification</Label>
                      <p className="text-blue-900 font-semibold">{selectedApplication.previousQualification || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-blue-700 font-medium">Previous Program</Label>
                      <p className="text-blue-900 font-semibold">{selectedApplication.previousProgram || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-blue-700 font-medium">Previous Institution</Label>
                      <p className="text-blue-900 font-semibold">{selectedApplication.previousInstitution || selectedApplication.schoolName || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-blue-700 font-medium">Previous Year Completed</Label>
                      <p className="text-blue-900 font-semibold">{selectedApplication.previousYearCompleted || selectedApplication.yearCompleted || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-blue-700 font-medium">Target Entry Level</Label>
                      <p className="text-blue-900 font-semibold">
                        Level {selectedApplication.studyLevel || 'N/A'}
                        {selectedApplication.studyLevel === '200' && ' (Certificate holders)'}
                        {selectedApplication.studyLevel === '300' && ' (Diploma holders)'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-blue-700 font-medium">Credit Transfer</Label>
                      <p className="text-blue-900 font-semibold">
                        {selectedApplication.creditTransfer ? `${selectedApplication.creditTransfer} credits` : 'To be evaluated'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                    <strong>Note:</strong> This student is applying to continue from their previous qualification. 
                    Verify transcript and certificate documents before approval. Credit transfer will be evaluated based on transcript analysis.
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Application Type</Label>
                  <p className="text-lg capitalize">{selectedApplication.programType === 'topup' ? 'Top-Up Application' : selectedApplication.programType || 'Fresh Application'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Study Mode</Label>
                  <p className="text-lg capitalize">{selectedApplication.studyMode || 'N/A'}</p>
                </div>
                {selectedApplication.studyLevel && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Entry Level</Label>
                    <p className="text-lg font-semibold text-green-600">Level {selectedApplication.studyLevel}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Academic Year</Label>
                  <p className="text-lg">2025/2026</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">First Choice Program</Label>
                  <p className="text-lg">{selectedApplication.firstChoice || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Second Choice Program</Label>
                  <p className="text-lg">{selectedApplication.secondChoice || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Section */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileTextIcon className="h-5 w-5" />
                  <span>Documents</span>
                </div>
                {selectedApplication.documentUrls && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      Object.entries(selectedApplication.documentUrls || {}).forEach(([key, url]) => {
                        if (url && url.trim() !== '') {
                          const filename = `${selectedApplication.firstName}_${selectedApplication.lastName}_${key}.pdf`
                          handleDownloadDocument(url, filename)
                        }
                      })
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download All Documents
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Profile Photo */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Image className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Profile Photo</span>
                    </div>
                    <Badge variant={selectedApplication.documentUrls?.photo ? "default" : "secondary"}>
                      {selectedApplication.documentUrls?.photo ? 'Uploaded' : 'Not uploaded'}
                    </Badge>
                  </div>
                  {selectedApplication.documentUrls?.photo && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocument(selectedApplication.documentUrls!.photo!, 'profile_photo.jpg')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadDocument(selectedApplication.documentUrls!.photo!, 'profile_photo.jpg')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>

                {/* ID Document */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <FileTextIcon className="h-5 w-5 text-green-600" />
                      <span className="font-medium">National ID/Passport</span>
                    </div>
                    <Badge variant={selectedApplication.documentUrls?.idDocument ? "default" : "secondary"}>
                      {selectedApplication.documentUrls?.idDocument ? 'Uploaded' : 'Not uploaded'}
                    </Badge>
                  </div>
                  {selectedApplication.documentUrls?.idDocument && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocument(selectedApplication.documentUrls!.idDocument!, 'national_id.pdf')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadDocument(selectedApplication.documentUrls!.idDocument!, 'national_id.pdf')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>

                {/* Academic Certificate */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Academic Certificate</span>
                    </div>
                    <Badge variant={selectedApplication.documentUrls?.certificate ? "default" : "secondary"}>
                      {selectedApplication.documentUrls?.certificate ? 'Uploaded' : 'Not uploaded'}
                    </Badge>
                  </div>
                  {selectedApplication.documentUrls?.certificate && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocument(selectedApplication.documentUrls!.certificate!, 'academic_certificate.pdf')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadDocument(selectedApplication.documentUrls!.certificate!, 'academic_certificate.pdf')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>

                {/* Academic Transcript */}
                <div className={`border rounded-lg p-4 ${selectedApplication.programType === 'topup' ? 'bg-blue-50 border-blue-200' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <FileText className={`h-5 w-5 ${selectedApplication.programType === 'topup' ? 'text-blue-600' : 'text-orange-600'}`} />
                      <span className="font-medium">
                        Academic Transcript
                        {selectedApplication.programType === 'topup' && (
                          <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700 text-xs">
                            CRITICAL FOR TOP-UP
                          </Badge>
                        )}
                      </span>
                    </div>
                    <Badge variant={selectedApplication.documentUrls?.transcript ? "default" : "secondary"}>
                      {selectedApplication.documentUrls?.transcript ? 'Uploaded' : 'Not uploaded'}
                    </Badge>
                  </div>
                  
                  {selectedApplication.programType === 'topup' && (
                    <div className="mb-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                      <strong>Note:</strong> This transcript is essential for evaluating credit transfer and entry level placement.
                    </div>
                  )}
                  
                  {selectedApplication.documentUrls?.transcript && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocument(selectedApplication.documentUrls!.transcript!, 'academic_transcript.pdf')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadDocument(selectedApplication.documentUrls!.transcript!, 'academic_transcript.pdf')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Director Decision Section */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Director Decision</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(selectedApplication.status === "submitted" || 
                selectedApplication.status === "under_review" || 
                selectedApplication.applicationStatus === "submitted" ||
                selectedApplication.applicationStatus === "under_review" ||
                selectedApplication.status === "draft" || // Allow draft applications to be reviewed
                selectedApplication.applicationStatus === "draft") && (
                <div className="space-y-6">
                  {/* Student's Original Application Details */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Student's Application Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-blue-700 font-medium">Applied Program:</Label>
                        <p className="text-blue-900 font-semibold">{selectedApplication.firstChoice || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-blue-700 font-medium">Requested Entry Level:</Label>
                        <p className="text-blue-900 font-semibold">
                          {selectedApplication.studyLevel ? `Level ${selectedApplication.studyLevel}` : 'N/A'}
                        </p>
                      </div>
                      {selectedApplication.secondChoice && (
                        <div>
                          <Label className="text-blue-700 font-medium">Second Choice:</Label>
                          <p className="text-blue-900 font-semibold">{selectedApplication.secondChoice}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-blue-700 font-medium">Study Mode:</Label>
                        <p className="text-blue-900 font-semibold">{selectedApplication.studyMode || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Director's Decision Options */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Director's Decision
                    </h4>
                    
                    {/* Quick Approval Option */}
                    <div className="mb-4">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="approvalType"
                          value="accept_as_is"
                          checked={!directorApprovedProgram && !directorApprovedLevel}
                          onChange={() => {
                            setDirectorApprovedProgram("")
                            setDirectorApprovedLevel("")
                          }}
                          className="h-4 w-4 text-green-600"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            Approve as Applied
                          </span>
                          <p className="text-xs text-gray-600">
                            Accept the student's chosen program and entry level without changes
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Custom Assignment Option */}
                    <div className="mb-4">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="approvalType"
                          value="custom_assignment"
                          checked={directorApprovedProgram || directorApprovedLevel}
                          onChange={() => {
                            setDirectorApprovedProgram(selectedApplication.firstChoice || "")
                            setDirectorApprovedLevel(selectedApplication.studyLevel || "")
                          }}
                          className="h-4 w-4 text-orange-600"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            Assign Different Program/Level
                          </span>
                          <p className="text-xs text-gray-600">
                            Change the student's program or entry level (recommended for certificate programs)
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Custom Program Assignment (only show when needed) */}
                    {(directorApprovedProgram || directorApprovedLevel) && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
                        <h5 className="font-semibold text-orange-900 mb-3">
                          Director's Program Assignment
                        </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                            <Label htmlFor="directorProgram" className="text-sm font-medium text-orange-700">
                          Approved Program *
                        </Label>
                        <select
                          id="directorProgram"
                          value={directorApprovedProgram || selectedApplication.firstChoice || ""}
                          onChange={(e) => setDirectorApprovedProgram(e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="">Select Program</option>
                          {availablePrograms.map(program => (
                            <option key={program} value={program}>{program}</option>
                          ))}
                        </select>
                            <p className="text-xs text-orange-600 mt-1">
                          Student applied for: {selectedApplication.firstChoice}
                        </p>
                      </div>
                      <div>
                            <Label htmlFor="directorLevel" className="text-sm font-medium text-orange-700">
                          Approved Entry Level *
                        </Label>
                        <select
                          id="directorLevel"
                          value={directorApprovedLevel || selectedApplication.studyLevel || ""}
                          onChange={(e) => setDirectorApprovedLevel(e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="">Select Level</option>
                          {getAvailableLevels(selectedApplication).map(level => (
                            <option key={level} value={level}>
                              Level {level} 
                              {level === '100' && ' (First Year)'}
                              {level === '200' && ' (Second Year)'}
                              {level === '300' && ' (Third Year)'}
                              {level === '400' && ' (Fourth Year)'}
                            </option>
                          ))}
                        </select>
                            <p className="text-xs text-orange-600 mt-1">
                          {selectedApplication.programType === 'topup' 
                                ? `Student requested: Level ${selectedApplication.studyLevel} based on ${selectedApplication.previousQualification}`
                                : 'Fresh applications typically start at Level 100'
                          }
                        </p>
                      </div>
                    </div>
                      </div>
                    )}
                    
                    {/* Fee Information */}
                    {directorApprovedLevel && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <h5 className="font-medium text-blue-900 mb-2">Fee Information for Level {directorApprovedLevel}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-blue-700 font-medium">Regular Program:</span>
                            <p className="text-blue-900">
                              {directorApprovedLevel === '100' && 'GH¢6,950 (GH¢3,475 per semester)'}
                              {directorApprovedLevel === '200' && 'GH¢6,100 (GH¢3,050 per semester)'}
                              {directorApprovedLevel === '300' && 'GH¢6,400 (GH¢3,200 per semester)'}
                              {directorApprovedLevel === '400' && 'GH¢6,100 (GH¢3,050 per semester)'}
                            </p>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">Weekend Program:</span>
                            <p className="text-blue-900">
                              {directorApprovedLevel === '100' && 'GH¢8,250 (GH¢3,300/GH¢2,475/GH¢2,475 per trimester)'}
                              {directorApprovedLevel === '200' && 'GH¢7,400 (GH¢2,960/GH¢2,220/GH¢2,220 per trimester)'}
                              {directorApprovedLevel === '300' && 'GH¢7,700 (GH¢3,080/GH¢2,310/GH¢2,310 per trimester)'}
                              {directorApprovedLevel === '400' && 'GH¢7,400 (GH¢2,960/GH¢2,220/GH¢2,220 per trimester)'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Top-up specific guidance */}
                    {selectedApplication.programType === 'topup' && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
                        <h5 className="font-medium text-amber-900 mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Top-Up Application Review Guidelines
                        </h5>
                        <div className="text-sm text-amber-800 space-y-2">
                          <p><strong>Before approving this top-up application, ensure:</strong></p>
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Transcript has been reviewed and credit transfer evaluated</li>
                            <li>Previous qualification is relevant to the target program</li>
                            <li>Entry level placement is appropriate for the student's background</li>
                            <li>All required documents (transcript, certificate) are uploaded</li>
                          </ul>
                          <p className="mt-2 text-xs">
                            <strong>Note:</strong> Top-up students may have different fee structures and academic requirements.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Decision & Feedback */}
                  <div>
                    <Label htmlFor="feedback" className="text-sm font-medium">Decision & Feedback</Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide detailed feedback and decision on this application..."
                      className="mt-2"
                      rows={4}
                    />
                    <div className="flex gap-3 mt-4">
                      <Button 
                        onClick={() => handleReviewApplication(selectedApplication.applicationId, "accepted")} 
                        className="bg-green-600 hover:bg-green-700"
                        size="lg"
                        disabled={
                          // If custom assignment is selected, both program and level must be selected
                          (directorApprovedProgram || directorApprovedLevel) && 
                          (!directorApprovedProgram || !directorApprovedLevel)
                        }
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Accept Application
                      </Button>
                      <Button 
                        onClick={() => handleReviewApplication(selectedApplication.applicationId, "rejected")} 
                        variant="destructive"
                        size="lg"
                      >
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Reject Application
                      </Button>
                    </div>
                    
                    {/* Show validation message only when custom assignment is incomplete */}
                    {(directorApprovedProgram || directorApprovedLevel) && (!directorApprovedProgram || !directorApprovedLevel) && (
                      <p className="text-sm text-amber-600 mt-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Please complete both program and entry level selection for custom assignment.
                      </p>
                    )}
                    
                    {/* Show approval type for clarity */}
                    {!directorApprovedProgram && !directorApprovedLevel && (
                      <p className="text-sm text-green-600 mt-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Ready to approve as applied: {selectedApplication.firstChoice} at Level {selectedApplication.studyLevel}
                      </p>
                    )}
                    
                    {directorApprovedProgram && directorApprovedLevel && (
                      <p className="text-sm text-orange-600 mt-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Ready to approve with custom assignment: {directorApprovedProgram} at Level {directorApprovedLevel}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedApplication.feedback && (
                <div className="border-l-4 border-blue-500 pl-4">
                  <Label className="text-sm font-medium">Previous Decision</Label>
                  <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm">{selectedApplication.feedback}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Reviewed by {selectedApplication.reviewedBy} on{" "}
                      {selectedApplication.reviewedAt && new Date(selectedApplication.reviewedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admissions Dashboard</h1>
          <p className="text-muted-foreground">Review and manage student applications</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admissions Dashboard</h1>
          <p className="text-muted-foreground">Review and manage student applications</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main applications list view
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admissions Dashboard</h1>
        <p className="text-muted-foreground">Review and manage student applications</p>
      </div>

      {/* Simple Admission Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Switch className="h-5 w-5" />
            <span>Admission Portal Control</span>
          </CardTitle>
          <CardDescription>
            Quickly open or close the admission portal for students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={admissionSettings?.currentYear?.admissionStatus === 'open' ? 'default' : 'destructive'}
                  className="text-sm"
                >
                  {admissionSettings?.currentYear?.admissionStatus === 'open' ? 'OPEN' : 'CLOSED'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {admissionSettings?.currentYear?.admissionStatus === 'open' 
                    ? 'Students can submit applications' 
                    : 'Students cannot submit applications'
                  }
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleSimpleAdmissionToggle('open')}
                disabled={isUpdatingStatus || admissionSettings?.currentYear?.admissionStatus === 'open'}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                {isUpdatingStatus ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Open Portal
              </Button>
              
              <Button
                onClick={() => handleSimpleAdmissionToggle('closed')}
                disabled={isUpdatingStatus || admissionSettings?.currentYear?.admissionStatus === 'closed'}
                size="sm"
                variant="destructive"
              >
                {isUpdatingStatus ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2" />
                )}
                Close Portal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admission Year Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Admission Year Management</span>
          </CardTitle>
          <CardDescription>
            Manage admission periods and control when applications are accepted
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSettings ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading admission settings...</span>
            </div>
          ) : admissionSettings?.currentYear ? (
            <div className="space-y-6">
              {/* Set/Change Current Admission Year */}
              <div className="border rounded-lg p-4">
                <h3 className="text-base font-medium mb-2">Set Admission Year</h3>
                <div className="flex flex-col md:flex-row gap-3 md:items-center">
                  <div className="w-full md:w-64">
                    <Select onValueChange={(v) => setSelectedYearToSet(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={admissionSettings.currentYear?.displayName || 'Select year'} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears
                          .filter(y => y.year && y.year.trim() !== "")
                          .map((y) => (
                          <SelectItem key={y.id} value={y.id}>{y.displayName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSetCurrentYear} disabled={!selectedYearToSet}>Set as Current Year</Button>
                </div>
              </div>

              {/* Current Year Info */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900">Current Academic Year</h3>
                  <p className="text-2xl font-bold text-blue-700">{admissionSettings.currentYear.displayName}</p>
                  <p className="text-sm text-blue-600">Year: {admissionSettings.currentYear.year}</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900">Admission Status</h3>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={admissionSettings.currentYear.admissionStatus === 'open' ? 'default' : 
                              admissionSettings.currentYear.admissionStatus === 'closed' ? 'destructive' : 'secondary'}
                      className="text-sm"
                    >
                      {admissionSettings.currentYear.admissionStatus.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    {admissionSettings.currentYear.admissionStatus === 'open' ? 'Applications are being accepted' :
                     admissionSettings.currentYear.admissionStatus === 'closed' ? 'Applications are not being accepted' :
                     'Admissions are pending'}
                  </p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-medium text-purple-900">Total Applications</h3>
                  <p className="text-2xl font-bold text-purple-700">
                    {admissionSettings.statistics?.totalApplications || 0}
                  </p>
                  {admissionSettings.currentYear.maxApplications && (
                    <p className="text-sm text-purple-600">
                      Max: {admissionSettings.currentYear.maxApplications}
                    </p>
                  )}
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-medium text-orange-900">Admission Period</h3>
                  <p className="text-sm text-orange-700">
                    {admissionSettings.currentYear.admissionStartDate ? 
                      `From: ${new Date(admissionSettings.currentYear.admissionStartDate).toLocaleDateString()}` : 
                      'Start date not set'
                    }
                  </p>
                  <p className="text-sm text-orange-700">
                    {admissionSettings.currentYear.admissionEndDate ? 
                      `To: ${new Date(admissionSettings.currentYear.admissionEndDate).toLocaleDateString()}` : 
                      'End date not set'
                    }
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => handleUpdateAdmissionStatus('open')}
                    disabled={isUpdatingStatus || admissionSettings.currentYear.admissionStatus === 'open'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isUpdatingStatus ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Open Admissions
                  </Button>
                  
                  <Button
                    onClick={() => handleUpdateAdmissionStatus('closed')}
                    disabled={isUpdatingStatus || admissionSettings.currentYear.admissionStatus === 'closed'}
                    variant="destructive"
                  >
                    {isUpdatingStatus ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <AlertCircle className="h-4 w-4 mr-2" />
                    )}
                    Close Admissions
                  </Button>
                  
                  <Button
                    onClick={() => handleUpdateAdmissionStatus('pending')}
                    disabled={isUpdatingStatus || admissionSettings.currentYear.admissionStatus === 'pending'}
                    variant="outline"
                  >
                    {isUpdatingStatus ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    ) : (
                      <Clock className="h-4 w-4 mr-2" />
                    )}
                    Set to Pending
                  </Button>
                  
                  <Button
                    onClick={handleSyncAdmissionStatus}
                    disabled={isUpdatingStatus}
                    variant="secondary"
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                  >
                    {isUpdatingStatus ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Sync to Portal
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Admission Year Configured</h3>
                <p className="text-gray-600">Select an existing academic year below to set it as the current admission year.</p>
              </div>
              <div className="flex flex-col md:flex-row gap-3 md:items-center justify-center">
                <div className="w-full md:w-64">
                  <Select onValueChange={(v) => setSelectedYearToSet(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears
                        .filter(y => y.year && y.year.trim() !== "")
                        .map((y) => (
                        <SelectItem key={y.id} value={y.year}>{y.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSetCurrentYear} disabled={!selectedYearToSet}>Set as Current Year</Button>
              </div>
              {availableYears.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">No academic years found. Please add one in Academic Management.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysApplications.length}</div>
            <p className="text-xs text-muted-foreground">Applications submitted today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApplications.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedApplications.length}</div>
            <p className="text-xs text-muted-foreground">Applications accepted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Applications</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidApplications.length}</div>
            <p className="text-xs text-muted-foreground">Payment completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 border-b">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === "all"
                  ? "bg-blue-600 text-white border-b-2 border-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab("mature")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === "mature"
                  ? "bg-blue-600 text-white border-b-2 border-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🎓 Mature Students ({matureStudentApplications.length})
            </button>
            <button
              onClick={() => setActiveTab("traditional")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === "traditional"
                  ? "bg-blue-600 text-white border-b-2 border-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              👥 Traditional Students ({traditionalApplications.length})
            </button>
          </div>

          {/* Mature Student Applications Section */}
          {activeTab === "mature" && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">🎓 Mature Student Applications</h3>
                <p className="text-blue-700 text-sm">
                  These applications are from students age 21+ who qualify through work experience, 
                  professional qualifications, or life experience pathways.
                </p>
              </div>
              
              {matureStudentApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No mature student applications found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matureStudentApplications.map((app) => (
                    <div key={app.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                              🎓 Mature Student
                            </Badge>
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              {app.matureStudentInfo?.eligibilityType?.replace('_', ' ').toUpperCase() || 'AGE-BASED'}
                            </Badge>
                            {app.matureStudentInfo?.needsSupport && (
                              <Badge variant="outline" className="bg-red-100 text-red-800">
                                ❤️ Needs Support
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Applicant</Label>
                              <p className="font-semibold">{app.firstName} {app.lastName}</p>
                              <p className="text-sm text-gray-600">Age: {app.matureStudentInfo?.age || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Program</Label>
                              <p className="font-semibold">{app.firstChoice || app.program}</p>
                              <p className="text-sm text-gray-600 capitalize">{app.studyMode || 'Regular'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Experience</Label>
                              <p className="font-semibold">{app.matureStudentInfo?.totalWorkYears || 'N/A'} years</p>
                              <p className="text-sm text-gray-600 capitalize">{app.matureStudentInfo?.employmentStatus || 'N/A'}</p>
                            </div>
                          </div>
                          
                          {app.matureStudentInfo?.needsSupport && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                              <Label className="text-sm font-medium text-yellow-800">Support Services Needed:</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {app.matureStudentInfo.supportType.map((service, index) => (
                                  <Badge key={index} variant="outline" className="bg-yellow-100 text-yellow-800 text-xs">
                                    {service}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApplicationSelect(app)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApplicationSelect(app)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Traditional Student Applications Section */}
          {activeTab === "traditional" && (
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-green-900 mb-2">👥 Traditional Student Applications</h3>
                <p className="text-green-700 text-sm">
                  These applications are from students with standard academic qualifications (WAEC/WASSCE).
                </p>
              </div>
              
              {traditionalApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No traditional student applications found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {traditionalApplications.map((app) => (
                    <div key={app.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              👥 Traditional Student
                            </Badge>
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              {app.programType === 'topup' ? 'Top-Up' : 'Fresh'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Applicant</Label>
                              <p className="font-semibold">{app.firstName} {app.lastName}</p>
                              <p className="text-sm text-gray-600">{app.email}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Program</Label>
                              <p className="font-semibold">{app.firstChoice || app.program}</p>
                              <p className="text-sm text-gray-600 capitalize">{app.studyMode || 'Regular'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Qualification</Label>
                              <p className="font-semibold">{app.qualificationType || 'N/A'}</p>
                              <p className="text-sm text-gray-600">{app.yearCompleted || 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApplicationSelect(app)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApplicationSelect(app)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Applications Section (Original Table) */}
          {activeTab === "all" && (
            <>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full md:w-48"
                  />
                </div>
                <div>
                  <select
                    value={selectedApplicationType}
                    onChange={(e) => setSelectedApplicationType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Applications</option>
                    <option value="topup">Top-Up Applications</option>
                    <option value="fresh">Fresh Applications</option>
                  </select>
                </div>
              </div>
              
              {/* Application Statistics */}
              <div className="flex items-center space-x-2 mb-4">
                {applications.filter(app => app.programType === 'topup').length > 0 && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {applications.filter(app => app.programType === 'topup').length} Top-Up
                  </Badge>
                )}
                <Badge variant="outline">
                  {applications.length} Total
                </Badge>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Applicant Name</TableHead>
                    <TableHead>Program Type</TableHead>
                    <TableHead>Previous Qualification</TableHead>
                    <TableHead>Target Level</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Application Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id} className={app.programType === 'topup' ? 'bg-blue-50' : ''}>
                      <TableCell className="font-mono text-sm">{app.applicationId}</TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div>{app.firstName} {app.lastName}</div>
                          {app.programType === 'topup' && (
                            <Badge variant="outline" className="mt-1 text-xs bg-blue-100 text-blue-700">
                              Top-Up
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="capitalize">
                          {app.programType === 'topup' ? (
                            <div className="flex items-center space-x-2">
                              <ArrowUpCircle className="h-4 w-4 text-blue-600" />
                              <span>Top-Up</span>
                            </div>
                          ) : (
                            app.programType || 'Fresh'
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {app.programType === 'topup' ? (
                          <div className="text-sm">
                            <div className="font-medium">{app.previousQualification || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{app.previousInstitution || app.schoolName || 'N/A'}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {app.studyLevel ? `Level ${app.studyLevel}` : 'N/A'}
                        </div>
                        {app.programType === 'topup' && app.creditTransfer && (
                          <div className="text-xs text-blue-600">
                            {app.creditTransfer} credits
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {app.documentUrls?.transcript && (
                            <Badge variant="outline" className="text-xs text-green-600" title="Transcript uploaded">
                              T
                            </Badge>
                          )}
                          {app.documentUrls?.certificate && (
                            <Badge variant="outline" className="text-xs text-blue-600" title="Certificate uploaded">
                              C
                            </Badge>
                          )}
                          {app.documentUrls?.photo && (
                            <Badge variant="outline" className="text-xs text-purple-600" title="Photo uploaded">
                              P
                            </Badge>
                          )}
                          {app.documentUrls?.idDocument && (
                            <Badge variant="outline" className="text-xs text-orange-600" title="ID uploaded">
                              ID
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPaymentStatusColor(app.paymentStatus)}>{app.paymentStatus}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(app.status)}>{app.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleApplicationSelect(app)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          {app.status === 'accepted' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleGenerateAdmissionLetter(app.applicationId)}
                              disabled={generatingLetter === app.applicationId}
                            >
                              {generatingLetter === app.applicationId ? (
                                <>
                                  <Clock className="h-4 w-4 mr-1 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-1" />
                                  Admission Letter
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredApplications.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No applications found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedDate
                      ? "Try adjusting your search criteria"
                      : "No applications have been submitted yet"}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function StaffAdmissionsPage() {
  return (
    <RouteGuard requiredPermissions={["admission_review"]}>
      <AdmissionsDashboard />
    </RouteGuard>
  )
} 