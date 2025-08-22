"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { collection, query, orderBy, onSnapshot, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Search, Award, Calendar, DollarSign, User, GraduationCap, Clock, AlertCircle } from 'lucide-react'
import { EnhancedScholarshipForm } from './enhanced-scholarship-form'
import { DisbursementsManagement } from './disbursements-management'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ScholarshipRecord {
  id: string
  studentId: string
  scholarshipName: string
  scholarshipType: string
  amount: number
  academicYear: string
  semester: string
  awardDate: string
  status: 'awarded' | 'disbursed' | 'completed' | 'suspended'
  renewable: boolean
  disbursements?: ScholarshipDisbursement[]
  createdAt: string
  updatedAt: string
}

interface ScholarshipDisbursement {
  id: string
  scholarshipId: string
  academicYear: string
  semester: string
  amount: number
  disbursedDate: string
  status: 'pending' | 'disbursed' | 'failed'
  notes?: string
}

interface StudentInfo {
  studentId: string
  fullName: string
  program: string
  level: string
  email: string
}

export function ScholarshipManagement() {
  const { toast } = useToast()
  const [scholarships, setScholarships] = useState<ScholarshipRecord[]>([])
  const [studentInfo, setStudentInfo] = useState<Record<string, StudentInfo>>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterYear, setFilterYear] = useState<string>('all')

  // Load scholarships and student info
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'scholarships'), orderBy('createdAt', 'desc')),
      async (snapshot) => {
        const scholarshipData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ScholarshipRecord[]

        setScholarships(scholarshipData)

        // Load student information for each scholarship
        const studentIds = [...new Set(scholarshipData.map(s => s.studentId))]
        const studentInfoMap: Record<string, StudentInfo> = {}

        for (const studentId of studentIds) {
          try {
            const response = await fetch(`/api/student-lookup?registrationNumber=${studentId}`)
            const result = await response.json()
            
            if (result.success && result.data) {
              studentInfoMap[studentId] = {
                studentId: result.data.studentId,
                fullName: result.data.fullName,
                program: result.data.program,
                level: result.data.level,
                email: result.data.email
              }
            }
          } catch (error) {
            console.warn(`Failed to load student info for ${studentId}:`, error)
          }
        }

        setStudentInfo(studentInfoMap)
        setLoading(false)
      },
      (error) => {
        console.error('Error loading scholarships:', error)
        toast({
          title: "Error",
          description: "Failed to load scholarships",
          variant: "destructive"
        })
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [toast])

  // Filter scholarships based on search and filters
  const filteredScholarships = scholarships.filter(scholarship => {
    const student = studentInfo[scholarship.studentId]
    const matchesSearch = !searchTerm || 
      scholarship.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholarship.scholarshipName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || scholarship.status === filterStatus
    const matchesYear = filterYear === 'all' || scholarship.academicYear === filterYear
    
    return matchesSearch && matchesStatus && matchesYear
  })

  // Get unique academic years for filter
  const academicYears = [...new Set(scholarships.map(s => s.academicYear))].sort()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'awarded': return 'bg-blue-100 text-blue-800'
      case 'disbursed': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatAmount = (amount: number) => {
    return `¢${amount.toLocaleString()}`
  }

  const handleDisbursement = async (scholarshipId: string) => {
    try {
      const scholarship = scholarships.find(s => s.id === scholarshipId)
      if (!scholarship) {
        toast({
          title: "Error",
          description: "Scholarship not found",
          variant: "destructive"
        })
        return
      }

      // Process disbursement for current academic period
      const response = await fetch('/api/scholarship-disbursement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process-pending',
          academicYear: scholarship.academicYear,
          semester: scholarship.semester
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Disbursement Processed!",
          description: `Scholarship amount applied to student fees for ${scholarship.academicYear} - ${scholarship.semester}`,
        })

        // Update scholarship status to disbursed
        const { doc, updateDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        
        await updateDoc(doc(db, 'scholarships', scholarshipId), {
          status: 'disbursed',
          disbursedDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })

      } else {
        throw new Error(result.error || 'Failed to process disbursement')
      }

    } catch (error: any) {
      console.error('❌ Error processing disbursement:', error)
      toast({
        title: "Disbursement Failed",
        description: error?.message || "Failed to process disbursement. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleRenewal = async (scholarshipId: string) => {
    // TODO: Implement scholarship renewal for new academic year
    toast({
      title: "Feature Coming Soon", 
      description: "Scholarship renewal for new academic year will be implemented next",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="h-6 w-6 animate-spin mr-2" />
            Loading scholarships...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="award" className="space-y-4">
      <TabsList>
        <TabsTrigger value="award">Award Scholarship</TabsTrigger>
        <TabsTrigger value="students">
          Scholarship Students ({filteredScholarships.length})
        </TabsTrigger>
        <TabsTrigger value="disbursements">Disbursements</TabsTrigger>
      </TabsList>

      {/* Award Scholarship Tab */}
      <TabsContent value="award">
        <EnhancedScholarshipForm />
      </TabsContent>

      {/* Scholarship Students Tab */}
      <TabsContent value="students" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Scholarship Students
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by student ID, name, or scholarship..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="awarded">Awarded</SelectItem>
                  <SelectItem value="disbursed">Disbursed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {academicYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scholarships Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Scholarship</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Academic Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Renewable</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScholarships.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        {searchTerm || filterStatus !== 'all' || filterYear !== 'all' 
                          ? 'No scholarships match your search criteria'
                          : 'No scholarships awarded yet'
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredScholarships.map((scholarship) => {
                      const student = studentInfo[scholarship.studentId]
                      return (
                        <TableRow key={scholarship.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">
                                  {student?.fullName || 'Loading...'}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <span>{scholarship.studentId}</span>
                                {student && (
                                  <>
                                    <span>•</span>
                                    <GraduationCap className="h-3 w-3" />
                                    <span>{student.program}</span>
                                    <span>•</span>
                                    <span>Level {student.level}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{scholarship.scholarshipName}</span>
                              <span className="text-sm text-gray-500 capitalize">
                                {scholarship.scholarshipType}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-600">
                                {formatAmount(scholarship.amount)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{scholarship.academicYear}</span>
                              <span className="text-gray-400">•</span>
                              <span>{scholarship.semester}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(scholarship.status)}>
                              {scholarship.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {scholarship.renewable ? (
                              <Badge className="bg-blue-100 text-blue-800">Renewable</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">One-time</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {scholarship.status === 'awarded' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleDisbursement(scholarship.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Disburse
                                </Button>
                              )}
                              {scholarship.renewable && scholarship.status === 'completed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRenewal(scholarship.id)}
                                >
                                  Renew
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Students</p>
                      <p className="text-2xl font-bold">{filteredScholarships.length}</p>
                    </div>
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatAmount(filteredScholarships.reduce((sum, s) => sum + s.amount, 0))}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Awards</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {filteredScholarships.filter(s => s.status === 'awarded' || s.status === 'disbursed').length}
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Renewable</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {filteredScholarships.filter(s => s.renewable).length}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Disbursements Tab */}
      <TabsContent value="disbursements">
        <DisbursementsManagement />
      </TabsContent>
    </Tabs>
  )
}
