"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  GraduationCap, 
  Users, 
  FileText, 
  CheckCircle,
  Clock,
  Search,
  Download,
  Eye,
  ArrowUpCircle,
  BookOpen,
  Award,
  TrendingUp
} from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { RouteGuard } from "@/components/route-guard"

interface TopUpApplication {
  id: string
  studentName: string
  email: string
  previousQualification: string
  targetProgram: string
  applicationDate: string
  status: 'pending' | 'under-review' | 'approved' | 'rejected'
  creditTransfer: number
  entryLevel: string
  suggestedEntryLevel?: string // For diplomas that can go to 200 or 300
  levelFixed: boolean // true for certificates, false for diplomas
  qualificationType: 'certificate' | 'diploma'
  documents: {
    transcript: boolean
    certificate: boolean
    additionalDocs: boolean
  }
  reviewNotes?: string
}

interface TopUpStats {
  totalApplications: number
  pendingReview: number
  approved: number
  averageCreditTransfer: number
}

function TopUpApplicationsContent() {
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<TopUpApplication[]>([])
  const [stats, setStats] = useState<TopUpStats>({
    totalApplications: 0,
    pendingReview: 0,
    approved: 0,
    averageCreditTransfer: 0
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedApplication, setSelectedApplication] = useState<TopUpApplication | null>(null)

  useEffect(() => {
    fetchTopUpApplications()
  }, [])

  const fetchTopUpApplications = async () => {
    try {
      setLoading(true)
      
      // Simulated data for demonstration
      const mockApplications: TopUpApplication[] = [
        {
          id: "1",
          studentName: "John Doe",
          email: "john.doe@email.com",
          previousQualification: "Certificate in Sustainable Agriculture",
          targetProgram: "B.Sc. Sustainable Agriculture",
          applicationDate: "2024-12-10",
          status: "pending",
          creditTransfer: 30,
          entryLevel: "200",
          levelFixed: true,
          qualificationType: "certificate",
          documents: {
            transcript: true,
            certificate: true,
            additionalDocs: false
          }
        },
        {
          id: "2",
          studentName: "Jane Smith",
          email: "jane.smith@email.com",
          previousQualification: "Diploma in Organic Agriculture",
          targetProgram: "Certificate in Agriculture",
          applicationDate: "2024-12-08",
          status: "under-review",
          creditTransfer: 60,
          entryLevel: "200",
          suggestedEntryLevel: "300",
          levelFixed: false,
          qualificationType: "diploma",
          documents: {
            transcript: true,
            certificate: true,
            additionalDocs: true
          },
          reviewNotes: "Advanced coursework completed. Considering Level 300 entry based on transcript review."
        },
        {
          id: "3",
          studentName: "Mike Johnson",
          email: "mike.johnson@email.com",
          previousQualification: "Certificate in Business Administration",
          targetProgram: "B.Sc. Environmental Science and Management",
          applicationDate: "2024-12-09",
          status: "approved",
          creditTransfer: 20,
          entryLevel: "200",
          levelFixed: true,
          qualificationType: "certificate",
          documents: {
            transcript: true,
            certificate: true,
            additionalDocs: false
          },
          reviewNotes: "Application approved. Standard certificate progression to Level 200."
        }
      ]

      setApplications(mockApplications)
      
      // Calculate stats
      const totalApplications = mockApplications.length
      const pendingReview = mockApplications.filter(app => app.status === 'pending' || app.status === 'under-review').length
      const approved = mockApplications.filter(app => app.status === 'approved').length
      const averageCreditTransfer = mockApplications.reduce((sum, app) => sum + app.creditTransfer, 0) / totalApplications

      setStats({
        totalApplications,
        pendingReview,
        approved,
        averageCreditTransfer: Math.round(averageCreditTransfer)
      })

    } catch (error) {
      console.error('Error fetching top-up applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'under-review': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.previousQualification.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || app.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      // Update application status
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus as any } : app
      ))
      
      // Recalculate stats
      fetchTopUpApplications()
    } catch (error) {
      console.error('Error updating application status:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Top-Up Applications Management</h1>
        <p className="text-gray-600">Manage certificate and diploma to degree progression applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
              <ArrowUpCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Credit Transfer</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageCreditTransfer}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="mappings">Credit Mappings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under-review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export Applications
            </Button>
          </div>

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top-Up Applications</CardTitle>
              <CardDescription>
                Review and manage certificate/diploma to degree progression applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Student</th>
                      <th className="text-left py-3 px-4 font-medium">Previous Qualification</th>
                      <th className="text-left py-3 px-4 font-medium">Target Program</th>
                      <th className="text-left py-3 px-4 font-medium">Credit Transfer</th>
                      <th className="text-left py-3 px-4 font-medium">Entry Level</th>
                      <th className="text-left py-3 px-4 font-medium">Documents</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((application) => (
                      <tr key={application.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{application.studentName}</div>
                            <div className="text-sm text-gray-500">{application.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{application.previousQualification}</td>
                        <td className="py-3 px-4 text-sm">{application.targetProgram}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{application.creditTransfer} credits</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">Level {application.entryLevel}</Badge>
                            {!application.levelFixed && application.suggestedEntryLevel && (
                              <Badge variant="outline" className="text-orange-600">
                                Alt: {application.suggestedEntryLevel}
                              </Badge>
                            )}
                            {application.qualificationType === 'diploma' && !application.levelFixed && (
                              <span className="text-xs text-blue-600">📝 Flexible</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-1">
                            {application.documents.transcript && (
                              <Badge variant="outline" className="text-green-600">T</Badge>
                            )}
                            {application.documents.certificate && (
                              <Badge variant="outline" className="text-blue-600">C</Badge>
                            )}
                            {application.documents.additionalDocs && (
                              <Badge variant="outline" className="text-purple-600">A</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(application.status)}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('-', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedApplication(application)}
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {application.status === 'pending' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleStatusUpdate(application.id, 'approved')}
                                  className="text-green-600 hover:text-green-700"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mappings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Credit Transfer Mappings</CardTitle>
              <CardDescription>
                Configure credit transfer rules for different qualification pathways
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-6">
                  {/* Level Progression Rules */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3">📋 Level Progression Rules</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-medium text-green-700 mb-2">Certificate Courses</h5>
                        <p className="text-gray-700 mb-2">✅ <strong>Always proceed to Level 200</strong></p>
                        <p className="text-xs text-gray-600">No flexibility - automatic placement</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-medium text-orange-700 mb-2">Diploma Courses</h5>
                        <p className="text-gray-700 mb-2">🔄 <strong>Level 200 OR 300</strong></p>
                        <p className="text-xs text-gray-600">Based on courses completed in diploma</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2 text-green-700">Certificate Pathways (Fixed)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span>Certificate in Sustainable Agriculture</span>
                          <Badge className="bg-green-100 text-green-800">30 credits → Level 200</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Certificate in Business Administration</span>
                          <Badge className="bg-green-100 text-green-800">20 credits → Level 200</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Certificate in Agribusiness</span>
                          <Badge className="bg-green-100 text-green-800">35 credits → Level 200</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Certificate in Bee Keeping</span>
                          <Badge className="bg-green-100 text-green-800">20 credits → Level 200</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2 text-orange-700">Diploma Programme (Flexible)</h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">Diploma in Organic Agriculture</span>
                            <Badge className="bg-orange-100 text-orange-800">60 credits</Badge>
                          </div>
                          <div className="pl-2 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">• Standard progression:</span>
                              <Badge variant="outline">Level 200</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">• Advanced coursework:</span>
                              <Badge variant="outline">Level 300</Badge>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Decision based on transcript evaluation
                          </p>
                          <p className="text-xs text-blue-600 mt-1 font-medium">
                            Note: Only diploma programme available
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assessment Criteria */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold mb-3">🎓 Diploma Level Assessment Criteria</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-white p-3 rounded">
                        <h5 className="font-medium text-blue-700 mb-2">Level 200 Entry</h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          <li>Basic foundational courses completed</li>
                          <li>GPA of 2.5 or above</li>
                          <li>45-60 credit hours</li>
                          <li>Basic understanding of core subjects</li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <h5 className="font-medium text-purple-700 mb-2">Level 300 Entry</h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          <li>Advanced specialized courses completed</li>
                          <li>GPA of 3.0 or above</li>
                          <li>60+ credit hours with advanced work</li>
                          <li>Practical experience or research component</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Success Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Success rate metrics coming soon...</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function TopUpApplicationsPage() {
  return (
    <RouteGuard allowedRoles={['director', 'admin']}>
      <TopUpApplicationsContent />
    </RouteGuard>
  )
}
