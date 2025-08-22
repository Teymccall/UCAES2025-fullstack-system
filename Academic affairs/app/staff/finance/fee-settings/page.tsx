"use client"

import { useState, useEffect } from 'react'
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { collection, onSnapshot, orderBy, query, addDoc, doc, updateDoc, deleteDoc, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Settings, Plus, Edit, Trash2, DollarSign, GraduationCap, Building, Users, AlertCircle, CheckCircle } from 'lucide-react'
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface ServiceFee {
  id: string
  name: string
  description: string
  amount: number
  type: 'Service' | 'Mandatory' | 'Optional'
  category: string
  forProgrammes: string[]
  forLevels: string[]
  createdAt: string
  updatedAt: string
}

interface CoreFeeStructure {
  id: string
  programme: string
  level: string
  studyMode: 'Regular' | 'Weekend'
  academicYear: string
  tuitionFee: number
  applicationFee: number
  registrationFee: number
  libraryFee: number
  labFee: number
  totalFee: number
  installments?: {
    first: number
    second: number
    third?: number
  }
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface FeeSystemSummary {
  totalCoreFees: number
  totalServiceFees: number
  totalMandatoryFees: number
  totalOptionalFees: number
  programmeCount: number
  serviceCount: number
  admissionFeeAmount: number
  lastUpdated: string
}

interface AdmissionFee {
  id: string
  name: string
  type: 'admission'
  amount: number
  description: string
  academicYear: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

export default function FeeSettingsPage() {
  const { toast } = useToast()
  
  // State for service fees
  const [services, setServices] = useState<ServiceFee[]>([])
  
  // State for core fee structures  
  const [coreFees, setCoreFees] = useState<CoreFeeStructure[]>([])
  
  // State for admission fees
  const [admissionFees, setAdmissionFees] = useState<AdmissionFee[]>([])
  
  // State for available programmes (loaded dynamically)
  const [availableProgrammes, setAvailableProgrammes] = useState<string[]>([])
  
  // State for system summary
  const [summary, setSummary] = useState<FeeSystemSummary>({
    totalCoreFees: 0,
    totalServiceFees: 0,
    totalMandatoryFees: 0,
    totalOptionalFees: 0,
    programmeCount: 0,
    serviceCount: 0,
    admissionFeeAmount: 0,
    lastUpdated: new Date().toISOString()
  })
  
  // Loading states
  const [loading, setLoading] = useState(true)
  const [coreFeesLoading, setCoreFeesLoading] = useState(true)
  const [admissionFeesLoading, setAdmissionFeesLoading] = useState(true)
  const [programmesLoading, setProgrammesLoading] = useState(true)
  
  // Dialog states
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false)
  const [showAddCoreFeeDialog, setShowAddCoreFeeDialog] = useState(false)
  const [showAddAdmissionFeeDialog, setShowAddAdmissionFeeDialog] = useState(false)
  const [editingService, setEditingService] = useState<ServiceFee | null>(null)
  const [editingCoreFee, setEditingCoreFee] = useState<CoreFeeStructure | null>(null)
  const [editingAdmissionFee, setEditingAdmissionFee] = useState<AdmissionFee | null>(null)
  
  // Current academic year
  const [currentAcademicYear, setCurrentAcademicYear] = useState('')
  
  // Form data for service fees
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    description: '',
    amount: '',
    type: 'Service' as 'Service' | 'Mandatory' | 'Optional',
    category: '',
    forProgrammes: [] as string[],
    forLevels: [] as string[]
  })
  
  // Form data for core fees
  const [coreFeeFormData, setCoreFeeFormData] = useState({
    programme: '',
    level: '',
    studyMode: 'Regular' as 'Regular' | 'Weekend',
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

  // Reset core fee form with current academic year
  const resetCoreFeeForm = () => {
    setCoreFeeFormData({
      programme: '',
      level: '',
      studyMode: 'Regular',
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

  // Reset admission fee form with current academic year
  const resetAdmissionFeeForm = () => {
    setAdmissionFeeFormData({
      name: '',
      amount: '',
      description: '',
      academicYear: currentAcademicYear || ''
    })
  }

  // Form data for admission fees
  const [admissionFeeFormData, setAdmissionFeeFormData] = useState({
    name: '',
    amount: '',
    description: '',
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
          setCoreFeeFormData(prev => ({
            ...prev,
            academicYear: result.data.academicYear
          }))
          setAdmissionFeeFormData(prev => ({
            ...prev,
            academicYear: result.data.academicYear
          }))
        }
      } catch (error) {
        console.warn('Failed to load academic year:', error)
        setCurrentAcademicYear('Not Set')
        setCoreFeeFormData(prev => ({
          ...prev,
          academicYear: 'Not Set'
        }))
        setAdmissionFeeFormData(prev => ({
          ...prev,
          academicYear: 'Not Set'
        }))
      }
    }

    loadAcademicYear()
  }, [])

  // Load available programmes dynamically
  useEffect(() => {
    const loadProgrammes = async () => {
      try {
        setProgrammesLoading(true)
        
        // Get programmes from multiple sources for comprehensive coverage
        const sources = [
          { collection: 'academic-programs', field: 'name' },
          { collection: 'programs', field: 'name' },
          { collection: 'student-registrations', field: 'programme' },
          { collection: 'program-fees', field: 'programme' }
        ]
        
        const allProgrammes = new Set<string>()
        
        // Also add the standard UCAES programmes
        const standardProgrammes = [
          'B.Sc. Sustainable Agriculture',
          'B.Sc. Sustainable Forestry', 
          'B.Sc. Environmental Science and Management',
          'Certificate in Sustainable Agriculture',
          'Certificate in Waste Management & Environmental Health',
          'Certificate in Bee Keeping',
          'Certificate in Agribusiness',
          'Certificate in Business Administration',
          'Diploma in Organic Agriculture',
          'Certificate in Agriculture',
          'Certificate in Environmental Science'
        ]
        
        standardProgrammes.forEach(prog => allProgrammes.add(prog))
        
        // Query Firebase for additional programmes
        for (const source of sources) {
          try {
            const snapshot = await getDocs(collection(db, source.collection))
            snapshot.forEach(doc => {
              const data = doc.data()
              const programmeName = data[source.field]
              if (programmeName && typeof programmeName === 'string') {
                allProgrammes.add(programmeName)
              }
            })
          } catch (error) {
            console.log(`Could not load from ${source.collection}:`, error)
          }
        }
        
        const sortedProgrammes = Array.from(allProgrammes).sort()
        setAvailableProgrammes(sortedProgrammes)
        
        console.log('📚 Loaded programmes:', sortedProgrammes)
        
      } catch (error) {
        console.error('Error loading programmes:', error)
        // Fallback to standard programmes
        setAvailableProgrammes([
          'B.Sc. Sustainable Agriculture',
          'B.Sc. Sustainable Forestry', 
          'B.Sc. Environmental Science and Management',
          'Certificate in Sustainable Agriculture',
          'Diploma in Organic Agriculture'
        ])
      } finally {
        setProgrammesLoading(false)
      }
    }

    loadProgrammes()
  }, [])

  // Load service fees
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'fee-services'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const serviceData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ServiceFee[]
        setServices(serviceData)
        setLoading(false)
        
        // Update summary
        updateSummary(serviceData, coreFees, admissionFees)
      },
      (error) => {
        console.error('Error loading service fees:', error)
        toast({
          title: "Error",
          description: "Failed to load service fees",
          variant: "destructive"
        })
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [toast, coreFees])

  // Load core fee structures
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'program-fees'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const coreFeeData = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            // Ensure installments exists, create default if missing
            installments: data.installments || {
              first: data.totalFee ? Math.round(data.totalFee * 0.6) : 0,
              second: data.totalFee ? Math.round(data.totalFee * 0.4) : 0
            }
          }
        }) as CoreFeeStructure[]
        setCoreFees(coreFeeData)
        setCoreFeesLoading(false)
        
        // Update summary
        updateSummary(services, coreFeeData, admissionFees)
      },
      (error) => {
        console.error('Error loading core fees:', error)
        toast({
          title: "Error",
          description: "Failed to load core fee structures",
          variant: "destructive"
        })
        setCoreFeesLoading(false)
      }
    )

    return () => unsubscribe()
  }, [toast, services])

  // Load admission fees
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'admission-fees'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const admissionFeeData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AdmissionFee[]
        setAdmissionFees(admissionFeeData)
        setAdmissionFeesLoading(false)
        
        // Update summary
        updateSummary(services, coreFees, admissionFeeData)
      },
      (error) => {
        console.error('Error loading admission fees:', error)
        toast({
          title: "Error",
          description: "Failed to load admission fees",
          variant: "destructive"
        })
        setAdmissionFeesLoading(false)
      }
    )

    return () => unsubscribe()
  }, [toast, services, coreFees])

  // Update system summary
  const updateSummary = (serviceData: ServiceFee[], coreFeeData: CoreFeeStructure[], admissionFeeData: AdmissionFee[] = []) => {
    const totalServiceFees = serviceData.reduce((sum, service) => {
      const amount = service?.amount || 0
      return sum + (typeof amount === 'number' ? amount : 0)
    }, 0)
    
    const totalMandatoryFees = serviceData
      .filter(service => service?.type === 'Mandatory')
      .reduce((sum, service) => {
        const amount = service?.amount || 0
        return sum + (typeof amount === 'number' ? amount : 0)
      }, 0)
      
    const totalOptionalFees = serviceData
      .filter(service => service?.type === 'Optional')
      .reduce((sum, service) => {
        const amount = service?.amount || 0
        return sum + (typeof amount === 'number' ? amount : 0)
      }, 0)
      
    const totalCoreFees = coreFeeData.reduce((sum, fee) => {
      const amount = fee?.totalFee || 0
      return sum + (typeof amount === 'number' ? amount : 0)
    }, 0)
    
    const admissionFeeAmount = admissionFeeData.reduce((sum, fee) => {
      const amount = fee?.amount || 0
      return sum + (typeof amount === 'number' ? amount : 0)
    }, 0)
    
    setSummary({
      totalCoreFees,
      totalServiceFees,
      totalMandatoryFees,
      totalOptionalFees,
      programmeCount: coreFeeData?.length || 0,
      serviceCount: serviceData?.length || 0,
      admissionFeeAmount,
      lastUpdated: new Date().toISOString()
    })
  }

  // Service fee form handlers
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!serviceFormData.name || !serviceFormData.amount) {
      toast({
        title: "Validation Error",
        description: "Service name and amount are required",
        variant: "destructive"
      })
      return
    }

    try {
      const serviceData = {
        ...serviceFormData,
        amount: parseFloat(serviceFormData.amount),
        updatedAt: new Date().toISOString(),
        createdBy: 'Finance Officer'
      }

      if (editingService) {
        await updateDoc(doc(db, 'fee-services', editingService.id), serviceData)
        toast({
          title: "Service Updated",
          description: `${serviceFormData.name} has been updated successfully`
        })
      } else {
        await addDoc(collection(db, 'fee-services'), {
          ...serviceData,
          createdAt: new Date().toISOString(),
          isActive: true
        })
        toast({
          title: "Service Added",
          description: `${serviceFormData.name} has been added successfully`
        })
      }

      // Reset form
      setServiceFormData({
        name: '',
        description: '',
        amount: '',
        type: 'Service',
        category: '',
        forProgrammes: [],
        forLevels: []
      })
      setShowAddServiceDialog(false)
      setEditingService(null)

    } catch (error) {
      console.error('Error saving service:', error)
      toast({
        title: "Error",
        description: "Failed to save service fee",
        variant: "destructive"
      })
    }
  }

  // Core fee form handlers
  const calculateCoreFeeTotal = () => {
    const fees = [
      parseFloat(coreFeeFormData.tuitionFee) || 0,
      parseFloat(coreFeeFormData.applicationFee) || 0,
      parseFloat(coreFeeFormData.registrationFee) || 0,
      parseFloat(coreFeeFormData.libraryFee) || 0,
      parseFloat(coreFeeFormData.labFee) || 0
    ]
    const total = fees.reduce((sum, fee) => {
      return sum + (typeof fee === 'number' && !isNaN(fee) ? fee : 0)
    }, 0)
    return total
  }

  const handleCoreFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Enhanced validation
    const requiredFields = [
      { field: coreFeeFormData.programme, name: 'Programme' },
      { field: coreFeeFormData.level, name: 'Level' },
      { field: coreFeeFormData.studyMode, name: 'Study Mode' },
      { field: coreFeeFormData.tuitionFee, name: 'Tuition Fee' }
    ]

    const missingFields = requiredFields.filter(field => !field.field || field.field.trim() === '')
    
    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in: ${missingFields.map(f => f.name).join(', ')}`,
        variant: "destructive"
      })
      return
    }

    // Validate numeric fields
    const numericFields = [
      { field: coreFeeFormData.tuitionFee, name: 'Tuition Fee' },
      { field: coreFeeFormData.applicationFee, name: 'Application Fee' },
      { field: coreFeeFormData.registrationFee, name: 'Registration Fee' },
      { field: coreFeeFormData.libraryFee, name: 'Library Fee' },
      { field: coreFeeFormData.labFee, name: 'Lab Fee' }
    ]

    for (const numField of numericFields) {
      const value = parseFloat(numField.field) || 0
      if (value < 0) {
        toast({
          title: "Validation Error",
          description: `${numField.name} cannot be negative`,
          variant: "destructive"
        })
        return
      }
    }

    // Check for duplicate fee structure
    const duplicate = coreFees.find(fee => 
      fee.programme === coreFeeFormData.programme &&
      fee.level === coreFeeFormData.level &&
      fee.studyMode === coreFeeFormData.studyMode &&
      fee.academicYear === coreFeeFormData.academicYear &&
      (!editingCoreFee || fee.id !== editingCoreFee.id)
    )

    if (duplicate) {
      toast({
        title: "Duplicate Fee Structure",
        description: `A fee structure for ${coreFeeFormData.programme} - Level ${coreFeeFormData.level} (${coreFeeFormData.studyMode}) already exists for ${coreFeeFormData.academicYear}`,
        variant: "destructive"
      })
      return
    }

    try {
      const totalFee = calculateCoreFeeTotal()
      const firstInstallment = parseFloat(coreFeeFormData.firstInstallment) || (totalFee * 0.6)
      const secondInstallment = parseFloat(coreFeeFormData.secondInstallment) || (totalFee * 0.4)
      const thirdInstallment = parseFloat(coreFeeFormData.thirdInstallment) || 0

      const coreFeeData = {
        programme: coreFeeFormData.programme,
        level: coreFeeFormData.level,
        studyMode: coreFeeFormData.studyMode,
        academicYear: coreFeeFormData.academicYear || currentAcademicYear,
        tuitionFee: parseFloat(coreFeeFormData.tuitionFee),
        applicationFee: parseFloat(coreFeeFormData.applicationFee) || 0,
        registrationFee: parseFloat(coreFeeFormData.registrationFee) || 0,
        libraryFee: parseFloat(coreFeeFormData.libraryFee) || 0,
        labFee: parseFloat(coreFeeFormData.labFee) || 0,
        totalFee,
        installments: {
          first: firstInstallment,
          second: secondInstallment,
          ...(thirdInstallment > 0 && { third: thirdInstallment })
        },
        updatedAt: new Date().toISOString(),
        createdBy: 'Finance Officer'
      }

      if (editingCoreFee) {
        await updateDoc(doc(db, 'program-fees', editingCoreFee.id), coreFeeData)
        toast({
          title: "Core Fee Updated",
          description: `Fee structure for ${coreFeeFormData.programme} - Level ${coreFeeFormData.level} has been updated`
        })
        refreshSystemData()
      } else {
        await addDoc(collection(db, 'program-fees'), {
          ...coreFeeData,
          createdAt: new Date().toISOString()
        })
        toast({
          title: "Core Fee Added",
          description: `Fee structure for ${coreFeeFormData.programme} - Level ${coreFeeFormData.level} has been created`
        })
        refreshSystemData()
      }

      // Reset form
      setCoreFeeFormData({
        programme: '',
        level: '',
        studyMode: 'Regular',
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
      setShowAddCoreFeeDialog(false)
      setEditingCoreFee(null)

    } catch (error) {
      console.error('Error saving core fee:', error)
      toast({
        title: "Error",
        description: "Failed to save core fee structure",
        variant: "destructive"
      })
    }
  }

  // Service fee edit and delete handlers
  const handleServiceEdit = (service: ServiceFee) => {
    setServiceFormData({
      name: service.name,
      description: service.description,
      amount: service.amount.toString(),
      type: service.type,
      category: service.category,
      forProgrammes: service.forProgrammes || [],
      forLevels: service.forLevels || []
    })
    setEditingService(service)
    setShowAddServiceDialog(true)
  }

  const handleServiceDelete = async (service: ServiceFee) => {
    if (!confirm(`Are you sure you want to delete ${service.name}? This will affect all student fee calculations.`)) return

    try {
      await deleteDoc(doc(db, 'fee-services', service.id))
      toast({
        title: "Service Fee Deleted",
        description: `${service.name} has been deleted successfully`,
        variant: "destructive"
      })
    } catch (error) {
      console.error('Error deleting service:', error)
      toast({
        title: "Error",
        description: "Failed to delete service fee",
        variant: "destructive"
      })
    }
  }

  // Core fee edit and delete handlers
  const handleCoreFeeEdit = (coreFee: CoreFeeStructure) => {
    // Handle legacy data without installments
    const installments = coreFee.installments || {
      first: Math.round(coreFee.totalFee * 0.6),
      second: Math.round(coreFee.totalFee * 0.4),
      third: 0
    }
    
    setCoreFeeFormData({
      programme: coreFee.programme,
      level: coreFee.level,
      studyMode: coreFee.studyMode,
      academicYear: coreFee.academicYear,
      tuitionFee: coreFee.tuitionFee.toString(),
      applicationFee: coreFee.applicationFee.toString(),
      registrationFee: coreFee.registrationFee.toString(),
      libraryFee: coreFee.libraryFee.toString(),
      labFee: coreFee.labFee.toString(),
      firstInstallment: installments.first.toString(),
      secondInstallment: installments.second.toString(),
      thirdInstallment: (installments.third || 0).toString()
    })
    setEditingCoreFee(coreFee)
    setShowAddCoreFeeDialog(true)
  }

  const handleCoreFeeDelete = async (coreFee: CoreFeeStructure) => {
    if (!confirm(`Are you sure you want to delete the fee structure for ${coreFee.programme} - Level ${coreFee.level}? This will affect all student calculations for this program.`)) return

    try {
      await deleteDoc(doc(db, 'program-fees', coreFee.id))
      toast({
        title: "Core Fee Deleted",
        description: `Fee structure for ${coreFee.programme} - Level ${coreFee.level} has been deleted`,
        variant: "destructive"
      })
      refreshSystemData()
    } catch (error) {
      console.error('Error deleting core fee:', error)
      toast({
        title: "Error",
        description: "Failed to delete core fee structure",
        variant: "destructive"
      })
    }
  }

  // Admission fee form handlers
  const handleAdmissionFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!admissionFeeFormData.name || !admissionFeeFormData.amount) {
      toast({
        title: "Validation Error",
        description: "Fee name and amount are required",
        variant: "destructive"
      })
      return
    }

    const amount = parseFloat(admissionFeeFormData.amount)
    if (amount < 0) {
      toast({
        title: "Validation Error",
        description: "Amount cannot be negative",
        variant: "destructive"
      })
      return
    }

    try {
      const admissionFeeData = {
        name: admissionFeeFormData.name,
        type: 'admission' as const,
        amount: amount,
        description: admissionFeeFormData.description || '',
        academicYear: admissionFeeFormData.academicYear || currentAcademicYear,
        isActive: true,
        updatedAt: new Date().toISOString(),
        createdBy: 'Finance Officer'
      }

      if (editingAdmissionFee) {
        await updateDoc(doc(db, 'admission-fees', editingAdmissionFee.id), admissionFeeData)
        toast({
          title: "Admission Fee Updated",
          description: `${admissionFeeFormData.name} has been updated`
        })
        refreshSystemData()
      } else {
        await addDoc(collection(db, 'admission-fees'), {
          ...admissionFeeData,
          createdAt: new Date().toISOString()
        })
        toast({
          title: "Admission Fee Added",
          description: `${admissionFeeFormData.name} has been created`
        })
        refreshSystemData()
      }

      // Reset form
      setAdmissionFeeFormData({
        name: '',
        amount: '',
        description: '',
        academicYear: ''
      })
      setEditingAdmissionFee(null)
      setShowAddAdmissionFeeDialog(false)

    } catch (error) {
      console.error('Error saving admission fee:', error)
      toast({
        title: "Error",
        description: "Failed to save admission fee",
        variant: "destructive"
      })
    }
  }

  const handleAdmissionFeeEdit = (admissionFee: AdmissionFee) => {
    setAdmissionFeeFormData({
      name: admissionFee.name,
      amount: admissionFee.amount.toString(),
      description: admissionFee.description,
      academicYear: admissionFee.academicYear
    })
    setEditingAdmissionFee(admissionFee)
    setShowAddAdmissionFeeDialog(true)
  }

  const handleAdmissionFeeDelete = async (admissionFee: AdmissionFee) => {
    if (!confirm(`Are you sure you want to delete ${admissionFee.name}? This will affect all admission processes.`)) return

    try {
      await deleteDoc(doc(db, 'admission-fees', admissionFee.id))
      toast({
        title: "Admission Fee Deleted",
        description: `${admissionFee.name} has been deleted`,
        variant: "destructive"
      })
      refreshSystemData()
    } catch (error) {
      console.error('Error deleting admission fee:', error)
      toast({
        title: "Error",
        description: "Failed to delete admission fee",
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

  // Function to refresh all data after changes
  const refreshSystemData = () => {
    console.log('🔄 Refreshing fee system data...')
    // This will trigger all the useEffect hooks to reload data
    setLoading(true)
    setCoreFeesLoading(true)
    setAdmissionFeesLoading(true)
    setProgrammesLoading(true)
  }

  return (
    <RouteGuard requiredRole="staff">
      <div className="container mx-auto py-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Settings className="h-8 w-8" />
                Centralized Fee Management
              </h1>
              <p className="text-gray-600 mt-2">
                Complete control center for all university fees - Core tuition, Service fees, and Additional charges
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="bg-green-50 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  System Controller
                </Badge>
                <Badge variant="outline">
                  Academic Year: {currentAcademicYear}
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-800">
                  {availableProgrammes.length} Programmes Available
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={refreshSystemData}
                variant="outline"
                size="sm"
                disabled={loading || coreFeesLoading || admissionFeesLoading || programmesLoading}
                className="flex items-center gap-2"
              >
                🔄 Refresh Data
              </Button>
            </div>
          </div>
        </div>

        {/* System Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Core Tuition Fees</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatAmount(summary.totalCoreFees)}
                  </p>
                  <p className="text-xs text-gray-500">{summary.programmeCount} programs</p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Service Fees</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatAmount(summary.totalServiceFees)}
                  </p>
                  <p className="text-xs text-gray-500">{summary.serviceCount} services</p>
                </div>
                <Building className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mandatory Fees</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatAmount(summary.totalMandatoryFees)}
                  </p>
                  <p className="text-xs text-gray-500">Required for all</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Optional Fees</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatAmount(summary.totalOptionalFees)}
                  </p>
                  <p className="text-xs text-gray-500">Student choice</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="core-fees" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="core-fees" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Core Tuition Fees
            </TabsTrigger>
            <TabsTrigger value="service-fees" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Service & Additional Fees
            </TabsTrigger>
            <TabsTrigger value="admission-fees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Admission Fees
            </TabsTrigger>
          </TabsList>

          {/* Core Fees Tab */}
          <TabsContent value="core-fees" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Core Tuition Fee Structures ({coreFees.length})
                  </CardTitle>
                  <Dialog open={showAddCoreFeeDialog} onOpenChange={(open) => {
                    setShowAddCoreFeeDialog(open)
                    if (open) resetCoreFeeForm()
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Core Fee Structure
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingCoreFee ? 'Edit Core Fee Structure' : 'Add New Core Fee Structure'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCoreFeeSubmit} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="programme">Programme</Label>
                            <Select value={coreFeeFormData.programme} onValueChange={(value) => setCoreFeeFormData(prev => ({ ...prev, programme: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select programme" />
                              </SelectTrigger>
                              <SelectContent>
                                {programmesLoading ? (
                                  <SelectItem value="" disabled>Loading programmes...</SelectItem>
                                ) : availableProgrammes.length > 0 ? (
                                  availableProgrammes.map(programme => (
                                    <SelectItem key={programme} value={programme}>
                                      {programme}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="" disabled>No programmes found</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="level">Level</Label>
                            <Select value={coreFeeFormData.level} onValueChange={(value) => setCoreFeeFormData(prev => ({ ...prev, level: value }))}>
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
                            <Select value={coreFeeFormData.studyMode} onValueChange={(value: 'Regular' | 'Weekend') => setCoreFeeFormData(prev => ({ ...prev, studyMode: value }))}>
                              <SelectTrigger>
                                <SelectValue />
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
                              value={coreFeeFormData.academicYear}
                              onChange={(e) => setCoreFeeFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                              placeholder={currentAcademicYear ? `Auto-filled: ${currentAcademicYear}` : "Set by director in centralized config"}
                              className={coreFeeFormData.academicYear ? "bg-green-50 border-green-200" : ""}
                            />
                            {coreFeeFormData.academicYear && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                  ✓ Auto-filled
                                </span>
                              </div>
                            )}
                          </div>
                          {coreFeeFormData.academicYear && (
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
                              value={coreFeeFormData.tuitionFee}
                              onChange={(e) => setCoreFeeFormData(prev => ({ ...prev, tuitionFee: e.target.value }))}
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
                              value={coreFeeFormData.applicationFee}
                              onChange={(e) => setCoreFeeFormData(prev => ({ ...prev, applicationFee: e.target.value }))}
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
                              value={coreFeeFormData.registrationFee}
                              onChange={(e) => setCoreFeeFormData(prev => ({ ...prev, registrationFee: e.target.value }))}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label htmlFor="libraryFee">Library Fee (¢)</Label>
                            <Input
                              id="libraryFee"
                              type="number"
                              step="0.01"
                              value={coreFeeFormData.libraryFee}
                              onChange={(e) => setCoreFeeFormData(prev => ({ ...prev, libraryFee: e.target.value }))}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label htmlFor="labFee">Lab Fee (¢)</Label>
                            <Input
                              id="labFee"
                              type="number"
                              step="0.01"
                              value={coreFeeFormData.labFee}
                              onChange={(e) => setCoreFeeFormData(prev => ({ ...prev, labFee: e.target.value }))}
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 rounded">
                          <div className="text-lg font-bold text-blue-800">
                            Total Fee: {formatAmount(calculateCoreFeeTotal())}
                          </div>
                        </div>

                        <div>
                          <Label className="text-base font-medium">Payment Installments</Label>
                          <div className="grid grid-cols-3 gap-4 mt-2">
                            <div>
                              <Label htmlFor="firstInstallment">First Payment (¢)</Label>
                              <Input
                                id="firstInstallment"
                                type="number"
                                step="0.01"
                                value={coreFeeFormData.firstInstallment}
                                onChange={(e) => setCoreFeeFormData(prev => ({ ...prev, firstInstallment: e.target.value }))}
                                placeholder={`${(calculateCoreFeeTotal() * 0.6).toFixed(2)} (60%)`}
                              />
                            </div>
                            <div>
                              <Label htmlFor="secondInstallment">Second Payment (¢)</Label>
                              <Input
                                id="secondInstallment"
                                type="number"
                                step="0.01"
                                value={coreFeeFormData.secondInstallment}
                                onChange={(e) => setCoreFeeFormData(prev => ({ ...prev, secondInstallment: e.target.value }))}
                                placeholder={`${(calculateCoreFeeTotal() * 0.4).toFixed(2)} (40%)`}
                              />
                            </div>
                            <div>
                              <Label htmlFor="thirdInstallment">Third Payment (¢) - Optional</Label>
                              <Input
                                id="thirdInstallment"
                                type="number"
                                step="0.01"
                                value={coreFeeFormData.thirdInstallment}
                                onChange={(e) => setCoreFeeFormData(prev => ({ ...prev, thirdInstallment: e.target.value }))}
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button type="submit" className="flex-1">
                            {editingCoreFee ? 'Update Core Fee Structure' : 'Create Core Fee Structure'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setShowAddCoreFeeDialog(false)
                              setEditingCoreFee(null)
                              setCoreFeeFormData({
                                programme: '',
                                level: '',
                                studyMode: 'Regular',
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
              </CardHeader>
              <CardContent>
                {coreFeesLoading ? (
                  <div className="text-center py-8">Loading core fee structures...</div>
                ) : coreFees.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No core fee structures configured yet. Click "Add Core Fee Structure" to get started.
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
                      {coreFees.map((coreFee) => (
                        <TableRow key={coreFee.id}>
                          <TableCell className="font-medium">{coreFee.programme}</TableCell>
                          <TableCell>Level {coreFee.level}</TableCell>
                          <TableCell>{coreFee.studyMode}</TableCell>
                          <TableCell>{coreFee.academicYear}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            {formatAmount(coreFee.totalFee)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {coreFee.installments ? (
                                <>
                                  <div>1st: {formatAmount(coreFee.installments.first)}</div>
                                  <div>2nd: {formatAmount(coreFee.installments.second)}</div>
                                  {coreFee.installments.third && (
                                    <div>3rd: {formatAmount(coreFee.installments.third)}</div>
                                  )}
                                </>
                              ) : (
                                <div className="text-gray-500 italic">Not configured</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCoreFeeEdit(coreFee)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCoreFeeDelete(coreFee)}
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
          </TabsContent>

          {/* Service Fees Tab */}
          <TabsContent value="service-fees" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Service & Additional Fees ({services.length})
                  </CardTitle>
                  <Dialog open={showAddServiceDialog} onOpenChange={setShowAddServiceDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service Fee
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {editingService ? 'Edit Service Fee' : 'Add New Service Fee'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleServiceSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="serviceName">Service Name</Label>
                          <Input
                            id="serviceName"
                            value={serviceFormData.name}
                            onChange={(e) => setServiceFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Library Fee, Lab Fee"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="serviceDescription">Description</Label>
                          <Input
                            id="serviceDescription"
                            value={serviceFormData.description}
                            onChange={(e) => setServiceFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description of the service"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="serviceAmount">Amount (¢)</Label>
                          <Input
                            id="serviceAmount"
                            type="number"
                            step="0.01"
                            value={serviceFormData.amount}
                            onChange={(e) => setServiceFormData(prev => ({ ...prev, amount: e.target.value }))}
                            placeholder="0.00"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="serviceType">Fee Type</Label>
                          <Select value={serviceFormData.type} onValueChange={(value: any) => setServiceFormData(prev => ({ ...prev, type: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Service">Service Fee</SelectItem>
                              <SelectItem value="Mandatory">Mandatory Fee</SelectItem>
                              <SelectItem value="Optional">Optional Fee</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="serviceCategory">Category</Label>
                          <Input
                            id="serviceCategory"
                            value={serviceFormData.category}
                            onChange={(e) => setServiceFormData(prev => ({ ...prev, category: e.target.value }))}
                            placeholder="e.g., Academic, Administrative"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button type="submit" className="flex-1">
                            {editingService ? 'Update Service' : 'Add Service'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setShowAddServiceDialog(false)
                              setEditingService(null)
                              setServiceFormData({
                                name: '',
                                description: '',
                                amount: '',
                                type: 'Service',
                                category: '',
                                forProgrammes: [],
                                forLevels: []
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
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading service fees...</div>
                ) : services.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No service fees configured yet. Click "Add Service Fee" to get started.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.name}</TableCell>
                          <TableCell className="text-gray-600">{service.description || '-'}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            {formatAmount(service.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${
                              service.type === 'Mandatory' ? 'bg-red-100 text-red-800' :
                              service.type === 'Optional' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {service.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{service.category || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleServiceEdit(service)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleServiceDelete(service)}
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
          </TabsContent>

          {/* Admission Fees Tab */}
          <TabsContent value="admission-fees" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Admission Fees Management
                  </CardTitle>
                  <Dialog open={showAddAdmissionFeeDialog} onOpenChange={(open) => {
                    setShowAddAdmissionFeeDialog(open)
                    if (open) resetAdmissionFeeForm()
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => {
                          setEditingAdmissionFee(null)
                          setAdmissionFeeFormData({
                            name: '',
                            amount: '',
                            description: '',
                            academicYear: currentAcademicYear
                          })
                        }}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Admission Fee
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingAdmissionFee ? 'Edit Admission Fee' : 'Add New Admission Fee'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAdmissionFeeSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Fee Name</Label>
                          <Input
                            id="name"
                            value={admissionFeeFormData.name}
                            onChange={(e) => setAdmissionFeeFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Application Fee, Registration Fee"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="amount">Amount (¢)</Label>
                          <Input
                            id="amount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={admissionFeeFormData.amount}
                            onChange={(e) => setAdmissionFeeFormData(prev => ({ ...prev, amount: e.target.value }))}
                            placeholder="200.00"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={admissionFeeFormData.description}
                            onChange={(e) => setAdmissionFeeFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description of this fee"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="academicYear">Academic Year</Label>
                          <div className="relative">
                            <Input
                              id="academicYear"
                              value={admissionFeeFormData.academicYear}
                              onChange={(e) => setAdmissionFeeFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                              placeholder={currentAcademicYear ? `Auto-filled: ${currentAcademicYear}` : "Set by director in centralized config"}
                              className={admissionFeeFormData.academicYear ? "bg-green-50 border-green-200" : ""}
                              required
                            />
                            {admissionFeeFormData.academicYear && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                  ✓ Auto-filled
                                </span>
                              </div>
                            )}
                          </div>
                          {admissionFeeFormData.academicYear && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Academic year automatically set from director's centralized configuration
                            </p>
                          )}
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button type="submit" className="flex-1">
                            {editingAdmissionFee ? 'Update Fee' : 'Create Fee'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowAddAdmissionFeeDialog(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-sm text-gray-600">
                  Manage admission fees that apply to new students during application process
                </p>
              </CardHeader>
              <CardContent>
                {admissionFeesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading admission fees...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fee Name</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admissionFees.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell className="font-medium">{fee.name}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            {formatAmount(fee.amount)}
                          </TableCell>
                          <TableCell>{fee.academicYear}</TableCell>
                          <TableCell>
                            <Badge variant={fee.isActive ? "default" : "secondary"}>
                              {fee.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {fee.description || 'No description'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAdmissionFeeEdit(fee)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAdmissionFeeDelete(fee)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {admissionFees.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No admission fees configured. Add one to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RouteGuard>
  )
}
