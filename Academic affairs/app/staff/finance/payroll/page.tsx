"use client"

import { useState, useEffect } from 'react'
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { collection, onSnapshot, orderBy, query, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Users, Plus, Edit, Trash2, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface PayrollEntry {
  id: string
  employeeId: string
  employeeName: string
  position: string
  department: string
  basicSalary: number
  allowances: number
  deductions: number
  netSalary: number
  payPeriod: string
  month: string
  year: number
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  approvedBy?: string
  paidDate?: string
  createdAt: string
  updatedAt: string
}

export default function PayrollPage() {
  const { toast } = useToast()
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingEntry, setEditingEntry] = useState<PayrollEntry | null>(null)
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    position: '',
    department: '',
    basicSalary: '',
    allowances: '',
    deductions: '',
    payPeriod: '',
    month: '',
    year: new Date().getFullYear().toString()
  })

  // Load payroll entries
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'payroll'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const payrollData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PayrollEntry[]
        setPayrollEntries(payrollData)
        setLoading(false)
      },
      (error) => {
        console.error('Error loading payroll:', error)
        toast({
          title: "Error",
          description: "Failed to load payroll entries",
          variant: "destructive"
        })
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [toast])

  const calculateNetSalary = (basic: number, allowances: number, deductions: number) => {
    return basic + allowances - deductions
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.employeeId || !formData.employeeName || !formData.basicSalary) {
      toast({
        title: "Validation Error",
        description: "Employee ID, name, and basic salary are required",
        variant: "destructive"
      })
      return
    }

    try {
      const basicSalary = parseFloat(formData.basicSalary)
      const allowances = parseFloat(formData.allowances) || 0
      const deductions = parseFloat(formData.deductions) || 0
      const netSalary = calculateNetSalary(basicSalary, allowances, deductions)

      const payrollData = {
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        position: formData.position,
        department: formData.department,
        basicSalary,
        allowances,
        deductions,
        netSalary,
        payPeriod: formData.payPeriod,
        month: formData.month,
        year: parseInt(formData.year),
        status: 'pending' as const,
        updatedAt: new Date().toISOString()
      }

      if (editingEntry) {
        await updateDoc(doc(db, 'payroll', editingEntry.id), payrollData)
        toast({
          title: "Payroll Updated",
          description: `Payroll for ${formData.employeeName} has been updated successfully`
        })
      } else {
        await addDoc(collection(db, 'payroll'), {
          ...payrollData,
          createdAt: new Date().toISOString()
        })
        toast({
          title: "Payroll Created",
          description: `Payroll for ${formData.employeeName} has been created successfully`
        })
      }

      // Reset form
      setFormData({
        employeeId: '',
        employeeName: '',
        position: '',
        department: '',
        basicSalary: '',
        allowances: '',
        deductions: '',
        payPeriod: '',
        month: '',
        year: new Date().getFullYear().toString()
      })
      setShowAddDialog(false)
      setEditingEntry(null)

    } catch (error) {
      console.error('Error saving payroll:', error)
      toast({
        title: "Error",
        description: "Failed to save payroll entry",
        variant: "destructive"
      })
    }
  }

  const handleStatusChange = async (entry: PayrollEntry, newStatus: PayrollEntry['status']) => {
    try {
      const updateData: any = {
        status: newStatus,
        updatedAt: new Date().toISOString()
      }

      if (newStatus === 'approved') {
        updateData.approvedBy = 'Finance Officer'
      } else if (newStatus === 'paid') {
        updateData.paidDate = new Date().toISOString()
      }

      await updateDoc(doc(db, 'payroll', entry.id), updateData)
      toast({
        title: "Status Updated",
        description: `Payroll for ${entry.employeeName} marked as ${newStatus}`
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to update payroll status",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (entry: PayrollEntry) => {
    setFormData({
      employeeId: entry.employeeId,
      employeeName: entry.employeeName,
      position: entry.position,
      department: entry.department,
      basicSalary: entry.basicSalary.toString(),
      allowances: entry.allowances.toString(),
      deductions: entry.deductions.toString(),
      payPeriod: entry.payPeriod,
      month: entry.month,
      year: entry.year.toString()
    })
    setEditingEntry(entry)
    setShowAddDialog(true)
  }

  const handleDelete = async (entry: PayrollEntry) => {
    if (!confirm(`Are you sure you want to delete payroll entry for ${entry.employeeName}?`)) return

    try {
      await deleteDoc(doc(db, 'payroll', entry.id))
      toast({
        title: "Payroll Deleted",
        description: `Payroll entry for ${entry.employeeName} has been deleted successfully`
      })
    } catch (error) {
      console.error('Error deleting payroll:', error)
      toast({
        title: "Error",
        description: "Failed to delete payroll entry",
        variant: "destructive"
      })
    }
  }

  const formatAmount = (amount: number) => `¢${amount.toLocaleString()}`

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'paid': return <DollarSign className="h-4 w-4" />
      case 'rejected': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const totalPayroll = payrollEntries.reduce((sum, entry) => sum + entry.netSalary, 0)
  const paidAmount = payrollEntries.filter(entry => entry.status === 'paid').reduce((sum, entry) => sum + entry.netSalary, 0)
  const pendingAmount = payrollEntries.filter(entry => entry.status === 'pending' || entry.status === 'approved').reduce((sum, entry) => sum + entry.netSalary, 0)
  const employeeCount = new Set(payrollEntries.map(entry => entry.employeeId)).size

  return (
    <RouteGuard requiredRole="staff">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="h-8 w-8" />
                Payroll Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage staff salaries, allowances, and payment processing
              </p>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payroll Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingEntry ? 'Edit Payroll Entry' : 'Add New Payroll Entry'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input
                        id="employeeId"
                        value={formData.employeeId}
                        onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                        placeholder="EMP001"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="employeeName">Employee Name</Label>
                      <Input
                        id="employeeName"
                        value={formData.employeeName}
                        onChange={(e) => setFormData(prev => ({ ...prev, employeeName: e.target.value }))}
                        placeholder="Full name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="e.g., Lecturer, Admin Officer"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic-affairs">Academic Affairs</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="admissions">Admissions</SelectItem>
                        <SelectItem value="it">Information Technology</SelectItem>
                        <SelectItem value="facilities">Facilities Management</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="library">Library</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="basicSalary">Basic Salary (¢)</Label>
                      <Input
                        id="basicSalary"
                        type="number"
                        step="0.01"
                        value={formData.basicSalary}
                        onChange={(e) => setFormData(prev => ({ ...prev, basicSalary: e.target.value }))}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="allowances">Allowances (¢)</Label>
                      <Input
                        id="allowances"
                        type="number"
                        step="0.01"
                        value={formData.allowances}
                        onChange={(e) => setFormData(prev => ({ ...prev, allowances: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deductions">Deductions (¢)</Label>
                      <Input
                        id="deductions"
                        type="number"
                        step="0.01"
                        value={formData.deductions}
                        onChange={(e) => setFormData(prev => ({ ...prev, deductions: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="month">Month</Label>
                      <Select value={formData.month} onValueChange={(value) => setFormData(prev => ({ ...prev, month: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="January">January</SelectItem>
                          <SelectItem value="February">February</SelectItem>
                          <SelectItem value="March">March</SelectItem>
                          <SelectItem value="April">April</SelectItem>
                          <SelectItem value="May">May</SelectItem>
                          <SelectItem value="June">June</SelectItem>
                          <SelectItem value="July">July</SelectItem>
                          <SelectItem value="August">August</SelectItem>
                          <SelectItem value="September">September</SelectItem>
                          <SelectItem value="October">October</SelectItem>
                          <SelectItem value="November">November</SelectItem>
                          <SelectItem value="December">December</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                        placeholder="2025"
                      />
                    </div>
                    <div>
                      <Label htmlFor="payPeriod">Pay Period</Label>
                      <Select value={formData.payPeriod} onValueChange={(value) => setFormData(prev => ({ ...prev, payPeriod: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Net Salary Display */}
                  {(formData.basicSalary || formData.allowances || formData.deductions) && (
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-sm font-medium">
                        Net Salary: {formatAmount(calculateNetSalary(
                          parseFloat(formData.basicSalary) || 0,
                          parseFloat(formData.allowances) || 0,
                          parseFloat(formData.deductions) || 0
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingEntry ? 'Update Entry' : 'Add Entry'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowAddDialog(false)
                        setEditingEntry(null)
                        setFormData({
                          employeeId: '',
                          employeeName: '',
                          position: '',
                          department: '',
                          basicSalary: '',
                          allowances: '',
                          deductions: '',
                          payPeriod: '',
                          month: '',
                          year: new Date().getFullYear().toString()
                        })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Payroll</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatAmount(totalPayroll)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Paid Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatAmount(paidAmount)}
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
                  <p className="text-sm text-gray-600">Pending Amount</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatAmount(pendingAmount)}
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
                  <p className="text-sm text-gray-600">Employees</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {employeeCount}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payroll Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Payroll Entries ({payrollEntries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading payroll entries...</div>
            ) : payrollEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No payroll entries created yet. Click "Add Payroll Entry" to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{entry.employeeName}</div>
                          <div className="text-sm text-gray-500">{entry.employeeId}</div>
                        </div>
                      </TableCell>
                      <TableCell>{entry.position}</TableCell>
                      <TableCell className="capitalize">{entry.department?.replace('-', ' ')}</TableCell>
                      <TableCell className="font-medium text-blue-600">
                        {formatAmount(entry.basicSalary)}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatAmount(entry.netSalary)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{entry.month} {entry.year}</div>
                          <div className="text-gray-500 capitalize">{entry.payPeriod}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(entry.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(entry.status)}
                          {entry.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(entry)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {entry.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(entry, 'approved')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Approve
                            </Button>
                          )}
                          {entry.status === 'approved' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(entry, 'paid')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Mark Paid
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(entry)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  )
}



