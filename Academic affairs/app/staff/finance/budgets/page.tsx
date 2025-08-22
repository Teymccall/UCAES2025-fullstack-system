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
import { Wallet, Plus, Edit, Trash2, DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
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

interface Budget {
  id: string
  name: string
  description: string
  category: string
  allocatedAmount: number
  spentAmount: number
  remainingAmount: number
  academicYear: string
  department: string
  status: 'active' | 'exhausted' | 'pending' | 'closed'
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface BudgetTransaction {
  id: string
  budgetId: string
  description: string
  amount: number
  type: 'allocation' | 'expense' | 'adjustment'
  date: string
  reference: string
  approvedBy: string
}

export default function BudgetsPage() {
  const { toast } = useToast()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<BudgetTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [currentAcademicYear, setCurrentAcademicYear] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    allocatedAmount: '',
    department: '',
    academicYear: ''
  })

  // Load current academic year
  useEffect(() => {
    const loadAcademicYear = async () => {
      try {
        const response = await fetch('/api/academic-period')
        const result = await response.json()
        
        if (result.success && result.data) {
          setCurrentAcademicYear(result.data.academicYear)
          setFormData(prev => ({
            ...prev,
            academicYear: result.data.academicYear
          }))
        }
      } catch (error) {
        console.warn('Failed to load academic year:', error)
        setCurrentAcademicYear('Not Set')
        setFormData(prev => ({
          ...prev,
          academicYear: 'Not Set'
        }))
      }
    }

    loadAcademicYear()
  }, [])

  // Load budgets and transactions
  useEffect(() => {
    const unsubscribeBudgets = onSnapshot(
      query(collection(db, 'budgets'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const budgetData = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            status: data.status || 'pending',
            remainingAmount: data.allocatedAmount - (data.spentAmount || 0)
          }
        }) as Budget[]
        setBudgets(budgetData)
        setLoading(false)
      },
      (error) => {
        console.error('Error loading budgets:', error)
        toast({
          title: "Error",
          description: "Failed to load budgets",
          variant: "destructive"
        })
        setLoading(false)
      }
    )

    const unsubscribeTransactions = onSnapshot(
      query(collection(db, 'budget-transactions'), orderBy('date', 'desc')),
      (snapshot) => {
        const transactionData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BudgetTransaction[]
        setTransactions(transactionData)
      }
    )

    return () => {
      unsubscribeBudgets()
      unsubscribeTransactions()
    }
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.allocatedAmount) {
      toast({
        title: "Validation Error",
        description: "Budget name and allocated amount are required",
        variant: "destructive"
      })
      return
    }

    try {
      const budgetData = {
        ...formData,
        allocatedAmount: parseFloat(formData.allocatedAmount),
        spentAmount: 0,
        remainingAmount: parseFloat(formData.allocatedAmount),
        status: 'active' as const,
        academicYear: formData.academicYear || currentAcademicYear,
        updatedAt: new Date().toISOString(),
        createdBy: 'Finance Officer'
      }

      if (editingBudget) {
        await updateDoc(doc(db, 'budgets', editingBudget.id), budgetData)
        toast({
          title: "Budget Updated",
          description: `${formData.name} has been updated successfully`
        })
      } else {
        const docRef = await addDoc(collection(db, 'budgets'), {
          ...budgetData,
          createdAt: new Date().toISOString()
        })

        // Create initial allocation transaction
        await addDoc(collection(db, 'budget-transactions'), {
          budgetId: docRef.id,
          description: `Initial budget allocation for ${formData.name}`,
          amount: parseFloat(formData.allocatedAmount),
          type: 'allocation',
          date: new Date().toISOString(),
          reference: `BUDGET-${docRef.id.slice(-6).toUpperCase()}`,
          approvedBy: 'Finance Officer'
        })

        toast({
          title: "Budget Created",
          description: `${formData.name} has been created successfully`
        })
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        allocatedAmount: '',
        department: '',
        academicYear: currentAcademicYear
      })
      setShowAddDialog(false)
      setEditingBudget(null)

    } catch (error) {
      console.error('Error saving budget:', error)
      toast({
        title: "Error",
        description: "Failed to save budget",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (budget: Budget) => {
    setFormData({
      name: budget.name,
      description: budget.description,
      category: budget.category,
      allocatedAmount: budget.allocatedAmount.toString(),
      department: budget.department,
      academicYear: budget.academicYear
    })
    setEditingBudget(budget)
    setShowAddDialog(true)
  }

  const handleDelete = async (budget: Budget) => {
    if (!confirm(`Are you sure you want to delete ${budget.name}?`)) return

    try {
      await deleteDoc(doc(db, 'budgets', budget.id))
      toast({
        title: "Budget Deleted",
        description: `${budget.name} has been deleted successfully`
      })
    } catch (error) {
      console.error('Error deleting budget:', error)
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive"
      })
    }
  }

  const formatAmount = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '¢0'
    }
    return `¢${amount.toLocaleString()}`
  }

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'exhausted': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getBudgetHealthIcon = (budget: Budget) => {
    if (!budget.allocatedAmount || budget.allocatedAmount === 0) {
      return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
    
    const utilizationRate = (budget.spentAmount || 0) / budget.allocatedAmount
    if (utilizationRate >= 0.9) return <AlertCircle className="h-4 w-4 text-red-500" />
    if (utilizationRate >= 0.7) return <TrendingUp className="h-4 w-4 text-yellow-500" />
    return <TrendingDown className="h-4 w-4 text-green-500" />
  }

  const totalAllocated = budgets.reduce((sum, budget) => sum + (budget.allocatedAmount || 0), 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spentAmount || 0), 0)
  const totalRemaining = budgets.reduce((sum, budget) => sum + (budget.remainingAmount || 0), 0)

  return (
    <RouteGuard requiredRole="staff">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Wallet className="h-8 w-8" />
                Budget Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage departmental budgets, allocations, and expenditure tracking
              </p>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Budget
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingBudget ? 'Edit Budget' : 'Create New Budget'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Budget Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., IT Equipment Budget"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of budget purpose"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="capital">Capital Expenditure</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="administrative">Administrative</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="research">Research & Development</SelectItem>
                      </SelectContent>
                    </Select>
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
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="allocatedAmount">Allocated Amount (¢)</Label>
                    <Input
                      id="allocatedAmount"
                      type="number"
                      step="0.01"
                      value={formData.allocatedAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, allocatedAmount: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Input
                      id="academicYear"
                      value={formData.academicYear}
                      onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                      placeholder="e.g., 2025/2026"
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingBudget ? 'Update Budget' : 'Create Budget'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowAddDialog(false)
                        setEditingBudget(null)
                        setFormData({
                          name: '',
                          description: '',
                          category: '',
                          allocatedAmount: '',
                          department: '',
                          academicYear: currentAcademicYear
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
                  <p className="text-sm text-gray-600">Total Allocated</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatAmount(totalAllocated)}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatAmount(totalSpent)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Remaining</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatAmount(totalRemaining)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Budgets</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {budgets.filter(b => (b.status || 'pending') === 'active').length}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budgets Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Overview ({budgets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading budgets...</div>
            ) : budgets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No budgets created yet. Click "Create Budget" to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Budget Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Allocated</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgets.map((budget) => (
                    <TableRow key={budget.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getBudgetHealthIcon(budget)}
                          <div>
                            <div className="font-medium">{budget.name}</div>
                            <div className="text-sm text-gray-500">{budget.academicYear}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{budget.category}</TableCell>
                      <TableCell className="capitalize">{budget.department?.replace('-', ' ')}</TableCell>
                      <TableCell className="font-medium text-blue-600">
                        {formatAmount(budget.allocatedAmount)}
                      </TableCell>
                      <TableCell className="font-medium text-red-600">
                        {formatAmount(budget.spentAmount)}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatAmount(budget.remainingAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(budget.status || 'pending')}>
                          {(budget.status || 'pending').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(budget)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(budget)}
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
