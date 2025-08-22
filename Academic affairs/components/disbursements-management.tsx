"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Search, Calendar, DollarSign, User, CheckCircle, XCircle, Clock, AlertCircle, Play } from 'lucide-react'
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

interface DisbursementRecord {
  id: string
  scholarshipId: string
  studentId: string
  academicYear: string
  semester: string
  amount: number
  plannedDate: string
  disbursedDate?: string
  status: 'pending' | 'disbursed' | 'failed' | 'cancelled'
  feeReduction: number
  notes?: string
  createdAt: string
  updatedAt: string
}

interface StudentInfo {
  studentId: string
  fullName: string
  program: string
  level: string
}

export function DisbursementsManagement() {
  const { toast } = useToast()
  const [disbursements, setDisbursements] = useState<DisbursementRecord[]>([])
  const [studentInfo, setStudentInfo] = useState<Record<string, StudentInfo>>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterYear, setFilterYear] = useState<string>('all')
  const [processingAll, setProcessingAll] = useState(false)

  // Load disbursements and student info
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'scholarship-disbursements'), orderBy('createdAt', 'desc')),
      async (snapshot) => {
        const disbursementData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as DisbursementRecord[]

        setDisbursements(disbursementData)

        // Load student information
        const studentIds = [...new Set(disbursementData.map(d => d.studentId))]
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
                level: result.data.level
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
        console.error('Error loading disbursements:', error)
        toast({
          title: "Error",
          description: "Failed to load disbursements",
          variant: "destructive"
        })
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [toast])

  // Filter disbursements
  const filteredDisbursements = disbursements.filter(disbursement => {
    const student = studentInfo[disbursement.studentId]
    const matchesSearch = !searchTerm || 
      disbursement.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disbursement.academicYear.includes(searchTerm)
    
    const matchesStatus = filterStatus === 'all' || disbursement.status === filterStatus
    const matchesYear = filterYear === 'all' || disbursement.academicYear === filterYear
    
    return matchesSearch && matchesStatus && matchesYear
  })

  // Get unique academic years
  const academicYears = [...new Set(disbursements.map(d => d.academicYear))].sort()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'disbursed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'disbursed': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      case 'cancelled': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatAmount = (amount: number) => {
    return `¢${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const processPendingDisbursements = async () => {
    try {
      setProcessingAll(true)

      // Get current academic period from system config
      const academicPeriodResponse = await fetch('/api/academic-period')
      const academicPeriodData = await academicPeriodResponse.json()

      if (!academicPeriodData.success) {
        throw new Error('Failed to get current academic period')
      }

      const { academicYear, regularSemester } = academicPeriodData.data

      const response = await fetch('/api/scholarship-disbursement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process-pending',
          academicYear,
          semester: regularSemester.name
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Disbursements Processed!",
          description: `All pending disbursements for ${academicYear} - ${regularSemester.name} have been processed`,
        })
      } else {
        throw new Error(result.error || 'Failed to process disbursements')
      }

    } catch (error: any) {
      console.error('❌ Error processing disbursements:', error)
      toast({
        title: "Processing Failed",
        description: error?.message || "Failed to process disbursements. Please try again.",
        variant: "destructive"
      })
    } finally {
      setProcessingAll(false)
    }
  }

  const processSingleDisbursement = async (disbursementId: string) => {
    try {
      const disbursement = disbursements.find(d => d.id === disbursementId)
      if (!disbursement) return

      const response = await fetch('/api/scholarship-disbursement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process-single',
          disbursementId
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Disbursement Processed!",
          description: `${formatAmount(disbursement.amount)} applied to student fees`,
        })
      } else {
        throw new Error(result.error || 'Failed to process disbursement')
      }

    } catch (error: any) {
      console.error('❌ Error processing disbursement:', error)
      toast({
        title: "Processing Failed",
        description: error?.message || "Failed to process disbursement. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="h-6 w-6 animate-spin mr-2" />
            Loading disbursements...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Scholarship Disbursements
          </div>
          <Button 
            onClick={processPendingDisbursements}
            disabled={processingAll || !filteredDisbursements.some(d => d.status === 'pending')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {processingAll ? (
              <>
                <Clock className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Process All Pending
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student ID, name, or academic year..."
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="disbursed">Disbursed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
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

        {/* Disbursements Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Academic Period</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Planned Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDisbursements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm || filterStatus !== 'all' || filterYear !== 'all' 
                      ? 'No disbursements match your search criteria'
                      : 'No disbursements scheduled yet'
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredDisbursements.map((disbursement) => {
                  const student = studentInfo[disbursement.studentId]
                  return (
                    <TableRow key={disbursement.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">
                              {student?.fullName || 'Loading...'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            <span>{disbursement.studentId}</span>
                            {student && (
                              <>
                                <span> • {student.program} • Level {student.level}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{disbursement.academicYear}</span>
                          <span className="text-gray-400">•</span>
                          <span>{disbursement.semester}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-600">
                            {formatAmount(disbursement.amount)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatDate(disbursement.plannedDate)}</span>
                          {disbursement.disbursedDate && (
                            <span className="text-sm text-gray-500">
                              Disbursed: {formatDate(disbursement.disbursedDate)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(disbursement.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(disbursement.status)}
                          {disbursement.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {disbursement.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => processSingleDisbursement(disbursement.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Process
                          </Button>
                        )}
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
                  <p className="text-sm text-gray-600">Total Disbursements</p>
                  <p className="text-2xl font-bold">{filteredDisbursements.length}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {filteredDisbursements.filter(d => d.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Disbursed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredDisbursements.filter(d => d.status === 'disbursed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatAmount(filteredDisbursements.reduce((sum, d) => sum + d.amount, 0))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}



