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
import { GraduationCap, Plus, Edit, Trash2, DollarSign } from 'lucide-react'
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

interface FeeStructure {
  id: string
  programme: string
  level: string
  studyMode: string
  academicYear: string
  tuitionFee: number
  applicationFee: number
  registrationFee: number
  libraryFee: number
  labFee: number
  totalFee: number
  installments: {
    first: number
    second: number
    third?: number
  }
  createdAt: string
  updatedAt: string
}

export default function FeeStructuresPage() {
  const { toast } = useToast()
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null)
  const [currentAcademicYear, setCurrentAcademicYear] = useState('')
  const [formData, setFormData] = useState({
    programme: '',
    level: '',
    studyMode: '',
    academicYear: '',
    tuitionFee: '',
    applicationFee: '',
    registrationFee: '',
    libraryFee: '',
    labFee: '',
    firstInstallment: '',
    secondInstallment: '',
    thirdInstallment: ''
  })

  // Reset form with current academic year
  const resetForm = () => {
    setFormData({
      programme: '',
      level: '',
      studyMode: '',
      academicYear: currentAcademicYear || '',
      tuitionFee: '',
      applicationFee: '',
      registrationFee: '',
      libraryFee: '',
      labFee: '',
      firstInstallment: '',
      secondInstallment: '',
      thirdInstallment: ''
    })
  }

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

  // Load fee structures
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'program-fees'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const feeData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FeeStructure[]
        setFeeStructures(feeData)
        setLoading(false)
      },
      (error) => {
        console.error('Error loading fee structures:', error)
        toast({
          title: "Error",
          description: "Failed to load fee structures",
          variant: "destructive"
        })
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [toast])

  const calculateTotal = () => {
    const fees = [
      parseFloat(formData.tuitionFee) || 0,
      parseFloat(formData.applicationFee) || 0,
      parseFloat(formData.registrationFee) || 0,
      parseFloat(formData.libraryFee) || 0,
      parseFloat(formData.labFee) || 0
    ]
    return fees.reduce((sum, fee) => sum + fee, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.programme || !formData.level || !formData.tuitionFee) {
      toast({
        title: "Validation Error",
        description: "Programme, level, and tuition fee are required",
        variant: "destructive"
      })
      return
    }

    try {
      const totalFee = calculateTotal()
      const firstInstallment = parseFloat(formData.firstInstallment) || (totalFee * 0.6)
      const secondInstallment = parseFloat(formData.secondInstallment) || (totalFee * 0.4)
      const thirdInstallment = parseFloat(formData.thirdInstallment) || 0

      const feeStructureData = {
        programme: formData.programme,
        level: formData.level,
        studyMode: formData.studyMode,
        academicYear: formData.academicYear || currentAcademicYear,
        tuitionFee: parseFloat(formData.tuitionFee),
        applicationFee: parseFloat(formData.applicationFee) || 0,
        registrationFee: parseFloat(formData.registrationFee) || 0,
        libraryFee: parseFloat(formData.libraryFee) || 0,
        labFee: parseFloat(formData.labFee) || 0,
        totalFee,
        installments: {
          first: firstInstallment,
          second: secondInstallment,
          ...(thirdInstallment > 0 && { third: thirdInstallment })
        },
        updatedAt: new Date().toISOString()
      }

      if (editingStructure) {
        await updateDoc(doc(db, 'program-fees', editingStructure.id), feeStructureData)
        toast({
          title: "Fee Structure Updated",
          description: `Fee structure for ${formData.programme} - Level ${formData.level} has been updated`
        })
      } else {
        await addDoc(collection(db, 'program-fees'), {
          ...feeStructureData,
          createdAt: new Date().toISOString()
        })
        toast({
          title: "Fee Structure Created",
          description: `Fee structure for ${formData.programme} - Level ${formData.level} has been created`
        })
      }

      // Reset form
      setFormData({
        programme: '',
        level: '',
        studyMode: '',
        academicYear: currentAcademicYear,
        tuitionFee: '',
        applicationFee: '',
        registrationFee: '',
        libraryFee: '',
        labFee: '',
        firstInstallment: '',
        secondInstallment: '',
        thirdInstallment: ''
      })
      setShowAddDialog(false)
      setEditingStructure(null)

    } catch (error) {
      console.error('Error saving fee structure:', error)
      toast({
        title: "Error",
        description: "Failed to save fee structure",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (structure: FeeStructure) => {
    setFormData({
      programme: structure.programme,
      level: structure.level,
      studyMode: structure.studyMode,
      academicYear: structure.academicYear,
      tuitionFee: structure.tuitionFee.toString(),
      applicationFee: structure.applicationFee.toString(),
      registrationFee: structure.registrationFee.toString(),
      libraryFee: structure.libraryFee.toString(),
      labFee: structure.labFee.toString(),
      firstInstallment: structure.installments.first.toString(),
      secondInstallment: structure.installments.second.toString(),
      thirdInstallment: (structure.installments.third || 0).toString()
    })
    setEditingStructure(structure)
    setShowAddDialog(true)
  }

  const handleDelete = async (structure: FeeStructure) => {
    if (!confirm(`Are you sure you want to delete fee structure for ${structure.programme} - Level ${structure.level}?`)) return

    try {
      await deleteDoc(doc(db, 'program-fees', structure.id))
      toast({
        title: "Fee Structure Deleted",
        description: `Fee structure for ${structure.programme} - Level ${structure.level} has been deleted`
      })
    } catch (error) {
      console.error('Error deleting fee structure:', error)
      toast({
        title: "Error",
        description: "Failed to delete fee structure",
        variant: "destructive"
      })
    }
  }

  const formatAmount = (amount: number) => `¢${amount.toLocaleString()}`

  return (
    <RouteGuard requiredRole="staff">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <GraduationCap className="h-8 w-8" />
                Fee Structures
              </h1>
              <p className="text-gray-600 mt-2">
                Manage program fee structures and payment installments
              </p>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={(open) => {
              setShowAddDialog(open)
              if (open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Fee Structure
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingStructure ? 'Edit Fee Structure' : 'Add New Fee Structure'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="programme">Programme</Label>
                      <Select value={formData.programme} onValueChange={(value) => setFormData(prev => ({ ...prev, programme: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select programme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="B.Sc. Sustainable Agriculture">B.Sc. Sustainable Agriculture</SelectItem>
                          <SelectItem value="B.Sc. Forestry">B.Sc. Forestry</SelectItem>
                          <SelectItem value="B.Sc. Environmental Science and Management">B.Sc. Environmental Science and Management</SelectItem>
                          <SelectItem value="Certificate in Sustainable Agriculture">Certificate in Sustainable Agriculture</SelectItem>
                          <SelectItem value="Diploma in Agriculture">Diploma in Agriculture</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="level">Level</Label>
                      <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">Level 100</SelectItem>
                          <SelectItem value="200">Level 200</SelectItem>
                          <SelectItem value="300">Level 300</SelectItem>
                          <SelectItem value="400">Level 400</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="studyMode">Study Mode</Label>
                      <Select value={formData.studyMode} onValueChange={(value) => setFormData(prev => ({ ...prev, studyMode: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Regular">Regular</SelectItem>
                          <SelectItem value="Weekend">Weekend</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <div className="relative">
                      <Input
                        id="academicYear"
                        value={formData.academicYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                        placeholder={currentAcademicYear ? `Auto-filled: ${currentAcademicYear}` : "Set by director in centralized config"}
                        className={formData.academicYear ? "bg-green-50 border-green-200" : ""}
                      />
                      {formData.academicYear && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                            ✓ Auto-filled
                          </span>
                        </div>
                      )}
                    </div>
                    {formData.academicYear && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Academic year automatically set from director's centralized configuration
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tuitionFee">Tuition Fee (¢)</Label>
                      <Input
                        id="tuitionFee"
                        type="number"
                        step="0.01"
                        value={formData.tuitionFee}
                        onChange={(e) => setFormData(prev => ({ ...prev, tuitionFee: e.target.value }))}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="applicationFee">Application Fee (¢)</Label>
                      <Input
                        id="applicationFee"
                        type="number"
                        step="0.01"
                        value={formData.applicationFee}
                        onChange={(e) => setFormData(prev => ({ ...prev, applicationFee: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="registrationFee">Registration Fee (¢)</Label>
                      <Input
                        id="registrationFee"
                        type="number"
                        step="0.01"
                        value={formData.registrationFee}
                        onChange={(e) => setFormData(prev => ({ ...prev, registrationFee: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="libraryFee">Library Fee (¢)</Label>
                      <Input
                        id="libraryFee"
                        type="number"
                        step="0.01"
                        value={formData.libraryFee}
                        onChange={(e) => setFormData(prev => ({ ...prev, libraryFee: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="labFee">Lab Fee (¢)</Label>
                      <Input
                        id="labFee"
                        type="number"
                        step="0.01"
                        value={formData.labFee}
                        onChange={(e) => setFormData(prev => ({ ...prev, labFee: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Total Fee Display */}
                  <div className="p-3 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-800">
                      Total Fee: {formatAmount(calculateTotal())}
                    </div>
                  </div>

                  {/* Payment Installments */}
                  <div>
                    <Label className="text-base font-medium">Payment Installments</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div>
                        <Label htmlFor="firstInstallment">First Payment (¢)</Label>
                        <Input
                          id="firstInstallment"
                          type="number"
                          step="0.01"
                          value={formData.firstInstallment}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstInstallment: e.target.value }))}
                          placeholder={`${(calculateTotal() * 0.6).toFixed(2)} (60%)`}
                        />
                      </div>
                      <div>
                        <Label htmlFor="secondInstallment">Second Payment (¢)</Label>
                        <Input
                          id="secondInstallment"
                          type="number"
                          step="0.01"
                          value={formData.secondInstallment}
                          onChange={(e) => setFormData(prev => ({ ...prev, secondInstallment: e.target.value }))}
                          placeholder={`${(calculateTotal() * 0.4).toFixed(2)} (40%)`}
                        />
                      </div>
                      <div>
                        <Label htmlFor="thirdInstallment">Third Payment (¢) - Optional</Label>
                        <Input
                          id="thirdInstallment"
                          type="number"
                          step="0.01"
                          value={formData.thirdInstallment}
                          onChange={(e) => setFormData(prev => ({ ...prev, thirdInstallment: e.target.value }))}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingStructure ? 'Update Fee Structure' : 'Create Fee Structure'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowAddDialog(false)
                        setEditingStructure(null)
                        setFormData({
                          programme: '',
                          level: '',
                          studyMode: '',
                          academicYear: currentAcademicYear,
                          tuitionFee: '',
                          applicationFee: '',
                          registrationFee: '',
                          libraryFee: '',
                          labFee: '',
                          firstInstallment: '',
                          secondInstallment: '',
                          thirdInstallment: ''
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

        {/* Fee Structures Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Fee Structures ({feeStructures.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading fee structures...</div>
            ) : feeStructures.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No fee structures created yet. Click "Add Fee Structure" to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Programme</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Total Fee</TableHead>
                    <TableHead>Installments</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStructures.map((structure) => (
                    <TableRow key={structure.id}>
                      <TableCell className="font-medium">{structure.programme}</TableCell>
                      <TableCell>Level {structure.level}</TableCell>
                      <TableCell>{structure.studyMode}</TableCell>
                      <TableCell>{structure.academicYear}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatAmount(structure.totalFee)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>1st: {formatAmount(structure.installments.first)}</div>
                          <div>2nd: {formatAmount(structure.installments.second)}</div>
                          {structure.installments.third && (
                            <div>3rd: {formatAmount(structure.installments.third)}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(structure)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(structure)}
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

