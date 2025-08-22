"use client"

import { useState, useEffect } from 'react'
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { collection, onSnapshot, orderBy, query, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { FileText, Plus, Edit, Trash2, DollarSign, Clock, CheckCircle, XCircle, Send } from 'lucide-react'
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

interface Invoice {
  id: string
  invoiceNumber: string
  studentId: string
  studentName: string
  description: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  totalAmount: number
  dueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  academicYear: string
  semester: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export default function InvoicesPage() {
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [currentAcademicYear, setCurrentAcademicYear] = useState('')
  const [currentSemester, setCurrentSemester] = useState('')
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    description: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }] as InvoiceItem[],
    dueDate: '',
    academicYear: '',
    semester: ''
  })

  // Load current academic period
  useEffect(() => {
    const loadAcademicPeriod = async () => {
      try {
        const response = await fetch('/api/academic-period')
        const result = await response.json()
        
        if (result.success && result.data) {
          setCurrentAcademicYear(result.data.academicYear)
          setCurrentSemester(result.data.semester)
          setFormData(prev => ({
            ...prev,
            academicYear: result.data.academicYear,
            semester: result.data.semester
          }))
        }
      } catch (error) {
        console.warn('Failed to load academic period:', error)
        setCurrentAcademicYear('Not Set')
        setCurrentSemester('Not Set')
        setFormData(prev => ({
          ...prev,
          academicYear: 'Not Set',
          semester: 'Not Set'
        }))
      }
    }

    loadAcademicPeriod()
  }, [])

  // Load invoices
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'invoices'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const invoiceData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Invoice[]
        setInvoices(invoiceData)
        setLoading(false)
      },
      (error) => {
        console.error('Error loading invoices:', error)
        toast({
          title: "Error",
          description: "Failed to load invoices",
          variant: "destructive"
        })
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [toast])

  const generateInvoiceNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `INV-${year}${month}-${random}`
  }

  const calculateItemTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice
  }

  const calculateSubtotal = (items: InvoiceItem[]) => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const updateItemTotal = (index: number, quantity: number, unitPrice: number) => {
    const newItems = [...formData.items]
    newItems[index] = {
      ...newItems[index],
      quantity,
      unitPrice,
      total: calculateItemTotal(quantity, unitPrice)
    }
    setFormData(prev => ({ ...prev, items: newItems }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }))
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, items: newItems }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.studentId || !formData.studentName || formData.items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Student ID, name, and at least one item are required",
        variant: "destructive"
      })
      return
    }

    try {
      const subtotal = calculateSubtotal(formData.items)
      const tax = subtotal * 0.05 // 5% tax
      const totalAmount = subtotal + tax

      const invoiceData = {
        invoiceNumber: editingInvoice?.invoiceNumber || generateInvoiceNumber(),
        studentId: formData.studentId,
        studentName: formData.studentName,
        description: formData.description,
        items: formData.items,
        subtotal,
        tax,
        totalAmount,
        dueDate: formData.dueDate,
        status: 'draft' as const,
        academicYear: formData.academicYear || currentAcademicYear,
        semester: formData.semester || currentSemester,
        updatedAt: new Date().toISOString(),
        createdBy: 'Finance Officer'
      }

      if (editingInvoice) {
        await updateDoc(doc(db, 'invoices', editingInvoice.id), invoiceData)
        toast({
          title: "Invoice Updated",
          description: `Invoice ${invoiceData.invoiceNumber} has been updated successfully`
        })
      } else {
        await addDoc(collection(db, 'invoices'), {
          ...invoiceData,
          createdAt: new Date().toISOString()
        })
        toast({
          title: "Invoice Created",
          description: `Invoice ${invoiceData.invoiceNumber} has been created successfully`
        })
      }

      // Reset form
      setFormData({
        studentId: '',
        studentName: '',
        description: '',
        items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
        dueDate: '',
        academicYear: currentAcademicYear,
        semester: currentSemester
      })
      setShowAddDialog(false)
      setEditingInvoice(null)

    } catch (error) {
      console.error('Error saving invoice:', error)
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive"
      })
    }
  }

  const handleStatusChange = async (invoice: Invoice, newStatus: Invoice['status']) => {
    try {
      await updateDoc(doc(db, 'invoices', invoice.id), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      toast({
        title: "Status Updated",
        description: `Invoice ${invoice.invoiceNumber} marked as ${newStatus}`
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to update invoice status",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (invoice: Invoice) => {
    setFormData({
      studentId: invoice.studentId,
      studentName: invoice.studentName,
      description: invoice.description,
      items: invoice.items,
      dueDate: invoice.dueDate,
      academicYear: invoice.academicYear,
      semester: invoice.semester
    })
    setEditingInvoice(invoice)
    setShowAddDialog(true)
  }

  const handleDelete = async (invoice: Invoice) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) return

    try {
      await deleteDoc(doc(db, 'invoices', invoice.id))
      toast({
        title: "Invoice Deleted",
        description: `Invoice ${invoice.invoiceNumber} has been deleted successfully`
      })
    } catch (error) {
      console.error('Error deleting invoice:', error)
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive"
      })
    }
  }

  const formatAmount = (amount: number) => `¢${amount.toLocaleString()}`
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />
      case 'sent': return <Send className="h-4 w-4" />
      case 'paid': return <CheckCircle className="h-4 w-4" />
      case 'overdue': return <Clock className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, invoice) => sum + invoice.totalAmount, 0)
  const pendingAmount = invoices.filter(inv => inv.status === 'sent').reduce((sum, invoice) => sum + invoice.totalAmount, 0)
  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length

  return (
    <RouteGuard requiredRole="staff">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <FileText className="h-8 w-8" />
                Invoice Management
              </h1>
              <p className="text-gray-600 mt-2">
                Create, manage, and track student invoices and payments
              </p>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        value={formData.studentId}
                        onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                        placeholder="e.g., UCAES20200001"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentName">Student Name</Label>
                      <Input
                        id="studentName"
                        value={formData.studentName}
                        onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                        placeholder="Full name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Invoice description or notes"
                      rows={2}
                    />
                  </div>

                  {/* Invoice Items */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Invoice Items</Label>
                      <Button type="button" size="sm" onClick={addItem}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Item
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {formData.items.map((item, index) => (
                        <div key={index} className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Input
                              placeholder="Item description"
                              value={item.description}
                              onChange={(e) => {
                                const newItems = [...formData.items]
                                newItems[index].description = e.target.value
                                setFormData(prev => ({ ...prev, items: newItems }))
                              }}
                            />
                          </div>
                          <div className="w-20">
                            <Input
                              type="number"
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) => updateItemTotal(index, parseInt(e.target.value) || 0, item.unitPrice)}
                            />
                          </div>
                          <div className="w-24">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Price"
                              value={item.unitPrice}
                              onChange={(e) => updateItemTotal(index, item.quantity, parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div className="w-24">
                            <Input
                              value={formatAmount(item.total)}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeItem(index)}
                            disabled={formData.items.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-right mt-2 p-2 bg-gray-50 rounded">
                      <div className="text-sm">Subtotal: {formatAmount(calculateSubtotal(formData.items))}</div>
                      <div className="text-sm">Tax (5%): {formatAmount(calculateSubtotal(formData.items) * 0.05)}</div>
                      <div className="font-bold">Total: {formatAmount(calculateSubtotal(formData.items) * 1.05)}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="academicYear">Academic Year</Label>
                      <Input
                        id="academicYear"
                        value={formData.academicYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                        placeholder="e.g., 2025/2026"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowAddDialog(false)
                        setEditingInvoice(null)
                        setFormData({
                          studentId: '',
                          studentName: '',
                          description: '',
                          items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
                          dueDate: '',
                          academicYear: currentAcademicYear,
                          semester: currentSemester
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
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatAmount(totalAmount)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
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
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">
                    {overdueCount}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Invoices ({invoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading invoices...</div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No invoices created yet. Click "Create Invoice" to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.studentName}</div>
                          <div className="text-sm text-gray-500">{invoice.studentId}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatAmount(invoice.totalAmount)}
                      </TableCell>
                      <TableCell>
                        {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(invoice.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(invoice.status)}
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(invoice)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {invoice.status === 'sent' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(invoice, 'paid')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Mark Paid
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(invoice)}
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

