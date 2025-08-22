"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Search,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  CreditCard,
  FileText,
  Calendar,
  Settings,
  X,
  Save,
  Wallet,
  Receipt,
  GraduationCap,
  Banknote,
  CheckCircle,
  MoreHorizontal
} from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { RouteGuard } from "@/components/route-guard"
import { Loader } from "@/components/ui/loader"
import { useToast } from "@/hooks/use-toast"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, orderBy, query, where, limit } from "firebase/firestore"
import { EnhancedScholarshipForm } from "@/components/enhanced-scholarship-form"
import { ScholarshipManagement } from "@/components/scholarship-management"

interface FeesSummary {
  totalOutstanding: number
  totalPaid: number
  totalStudents: number
  overduePayments: number
}

interface StudentFeeRecord {
  id: string
  studentId: string
  studentName: string
  programme: string
  level: string
  totalFees: number
  paidAmount: number
  outstandingBalance: number
  status: "paid" | "partial" | "overdue" | "pending"
  lastPaymentDate?: string
}

interface ServiceFee {
  id?: string
  name: string
  description?: string
  amount: number
  type: 'Service' | 'Mandatory' | 'Optional'
  category: string
  isActive: boolean
  forProgrammes?: string[]
  forLevels?: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface RecentPayment {
  id: string
  studentId: string
  studentName?: string
  amount: number
  method?: string
  reference?: string
  invoiceId?: string
  createdAt?: any
}

// Manual Verifications Content Component
function ManualVerificationsContent() {
  const [verifications, setVerifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    totalRecords: 0,
    totalAmount: 0,
    uniqueStudents: 0,
    verificationsByVerifier: {} as Record<string, number>
  })
  const [filterVerifier, setFilterVerifier] = useState("")
  const [filterAcademicYear, setFilterAcademicYear] = useState("")

  useEffect(() => {
    fetchManualVerifications()
  }, [])

  const fetchManualVerifications = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching manual verification records...')
      
      const params = new URLSearchParams()
      if (filterVerifier) params.append('verifiedBy', filterVerifier)
      if (filterAcademicYear) params.append('academicYear', filterAcademicYear)
      
      const response = await fetch(`/api/finance/manual-verifications?${params.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        setVerifications(result.data.verifications)
        setSummary(result.data.summary)
        console.log('✅ Manual verifications loaded:', result.data.verifications.length)
      } else {
        console.error('❌ Failed to fetch manual verifications:', result.error)
      }
    } catch (error) {
      console.error('❌ Error fetching manual verifications:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <SpinnerContainer>Loading manual verification records...</SpinnerContainer>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalRecords}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¢{summary.totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unique Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.uniqueStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Verifier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {Object.keys(summary.verificationsByVerifier).length > 0 
                ? Object.entries(summary.verificationsByVerifier)
                    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
                : 'None'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Manual Payment Verifications
          </CardTitle>
          <CardDescription>
            All manually verified payments by the Director. These are offline payments that were verified and entered into the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Filter by verifier..."
                value={filterVerifier}
                onChange={(e) => setFilterVerifier(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Filter by academic year..."
                value={filterAcademicYear}
                onChange={(e) => setFilterAcademicYear(e.target.value)}
              />
            </div>
            <Button onClick={fetchManualVerifications}>
              <Search className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Verifications Table */}
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">Student</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Amount</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Payment Method</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Verified By</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Reference</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Academic Year</th>
                </tr>
              </thead>
              <tbody>
                {verifications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <CheckCircle className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No manual verifications found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  verifications.map((verification) => (
                    <tr key={verification.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">
                            {verification.paymentDetails?.studentName || 'Unknown Student'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {verification.studentId}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">¢{verification.amount?.toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">
                          {verification.paymentMethod || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {new Date(verification.verificationDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium">
                          {verification.verifiedBy || 'Unknown'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-muted-foreground">
                          {verification.referenceNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">
                          {verification.paymentDetails?.academicYear || 'Unknown'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function FinanceContent() {
  const [loading, setLoading] = useState(true)
  const [feesSummary, setFeesSummary] = useState<FeesSummary | null>(null)
  const [dashboard, setDashboard] = useState<any>(null)
  const [studentRecords, setStudentRecords] = useState<StudentFeeRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("students")
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  
  // Service management state
  const [services, setServices] = useState<ServiceFee[]>([])
  const [showAddService, setShowAddService] = useState(false)
  const [showEditService, setShowEditService] = useState(false)
  const [showDeleteService, setShowDeleteService] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceFee | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    amount: '',
    type: 'Service' as 'Service' | 'Mandatory' | 'Optional',
    category: '',
    forProgrammes: [] as string[],
    forLevels: [] as string[]
  })
  const [editService, setEditService] = useState({
    name: '',
    description: '',
    amount: '',
    type: 'Service' as 'Service' | 'Mandatory' | 'Optional',
    category: '',
    forProgrammes: [] as string[],
    forLevels: [] as string[]
  })

  // Payment verification state
  const [selectedStudent, setSelectedStudent] = useState<StudentFeeRecord | null>(null)
  const [showPaymentVerification, setShowPaymentVerification] = useState(false)
  const [currentAcademicInfo, setCurrentAcademicInfo] = useState({ year: '', semester: '' })
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [paymentForm, setPaymentForm] = useState({
    ghanaCardNumber: '',
    amount: '',
    paymentMethod: 'Bank Transfer',
    bankName: '',
    accountNumber: '',
    referenceNumber: '',
    paymentDate: new Date().toISOString().split('T')[0], // Today's date
    paymentTime: new Date().toTimeString().slice(0, 5), // Current time
    bankReceiptNumber: '',
    tellerName: '',
    branch: '',
    notes: '',
    paymentFor: [] as string[],
    manualEntry: true
  })

  // Ensure payment date and time are always set
  useEffect(() => {
    if (!paymentForm.paymentDate) {
      setPaymentForm(prev => ({
        ...prev,
        paymentDate: new Date().toISOString().split('T')[0]
      }));
    }
    if (!paymentForm.paymentTime) {
      setPaymentForm(prev => ({
        ...prev,
        paymentTime: new Date().toTimeString().slice(0, 5)
      }));
    }
  }, [paymentForm.paymentDate, paymentForm.paymentTime]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()

  // Budgets state
  const [budgets, setBudgets] = useState<any[]>([])
  const [budgetForm, setBudgetForm] = useState({ departmentId: "", year: "", amount: "" })
  const [savingBudget, setSavingBudget] = useState(false)

  // Invoices state
  const [invoices, setInvoices] = useState<any[]>([])
  const [invoiceForm, setInvoiceForm] = useState({
    studentId: "",
    studentName: "",
    academicYear: "",
    semester: "First Semester",
    items: [{ name: "Tuition", amount: "" }] as Array<{ name: string; amount: string }>,
  })
  const [creatingInvoice, setCreatingInvoice] = useState(false)

  // Payroll state
  const [payroll, setPayroll] = useState<any[]>([])
  const [payrollMonth, setPayrollMonth] = useState<string>(new Date().toISOString().slice(0, 7))
  const [selectedPayrollIds, setSelectedPayrollIds] = useState<string[]>([])
  const [approvingPayroll, setApprovingPayroll] = useState(false)
  const [payingPayroll, setPayingPayroll] = useState(false)

  // Vendors & Procurement state
  const [vendors, setVendors] = useState<any[]>([])
  const [procurements, setProcurements] = useState<any[]>([])
  const [newVendor, setNewVendor] = useState({ name: '', email: '', phone: '', category: '', address: '' })
  const [creatingVendor, setCreatingVendor] = useState(false)
  const [newProc, setNewProc] = useState({ vendorId: '', description: '', amount: '' })
  const [creatingProc, setCreatingProc] = useState(false)

  // Fees / Scholarships / Transfers state
  const [feeStructures, setFeeStructures] = useState<any[]>([])
  const [newFee, setNewFee] = useState({ programme: '', departmentId: '', level: '', year: '', amount: '', items: '', studyMode: '', total: '', firstPayment: '', secondPayment: '', thirdPayment: '' })
  const [creatingFee, setCreatingFee] = useState(false)
  const [scholarships, setScholarships] = useState<any[]>([])
  const [newScholar, setNewScholar] = useState({ studentId: '', name: '', type: 'scholarship', amount: '', year: '' })
  const [creatingScholar, setCreatingScholar] = useState(false)
  const [transfers, setTransfers] = useState<any[]>([])
  const [newTransfer, setNewTransfer] = useState({ fromDepartmentId: '', toDepartmentId: '', amount: '', reason: '' })
  const [creatingTransfer, setCreatingTransfer] = useState(false)
  const [feeSettings, setFeeSettings] = useState<any>({ year: '', regular: { split: [50,50] }, weekend: { split: [40,30,30] }, publishToPortal: true })
  const [savingSettings, setSavingSettings] = useState(false)

  // Realtime listeners: budgets, invoices, payroll
  useEffect(() => {
    const unsubs: Array<() => void> = []
    try {
      // Budgets
      unsubs.push(
        onSnapshot(query(collection(db, "budgets"), orderBy("createdAt", "desc")), (snap) => {
          setBudgets(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        })
      )
      // Invoices
      unsubs.push(
        onSnapshot(query(collection(db, "tuition-invoices"), orderBy("createdAt", "desc")), (snap) => {
          setInvoices(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        })
      )
    } catch (e) {}
    return () => unsubs.forEach((u) => u())
  }, [])

  // Realtime payroll per selected month
  useEffect(() => {
    let unsub: undefined | (() => void)
    try {
      unsub = onSnapshot(
        query(collection(db, "payroll"), where("month", "==", payrollMonth)),
        (snap) => setPayroll(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      )
    } catch (e) {}
    return () => {
      if (unsub) unsub()
    }
  }, [payrollMonth])

  // Read default tab from the URL (?tab=...)
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      const tab = url.searchParams.get('tab') || undefined
      const allowed = ["students","services","payments","analytics","settings","budgets","invoices","payroll"]
      if (tab && allowed.includes(tab)) setActiveTab(tab)
    } catch (e) {}
  }, [])

  // Realtime vendors and procurements
  useEffect(() => {
    const unsubs: Array<() => void> = []
    try {
      unsubs.push(
        onSnapshot(query(collection(db, 'vendors'), orderBy('createdAt', 'desc')), (snap) => {
          setVendors(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        })
      )
      unsubs.push(
        onSnapshot(query(collection(db, 'procurements'), orderBy('createdAt', 'desc')), (snap) => {
          setProcurements(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        })
      )
      unsubs.push(
        onSnapshot(query(collection(db, 'fee-structures'), orderBy('createdAt', 'desc')), (snap) => {
          setFeeStructures(snap.docs.map((d)=>({ id: d.id, ...d.data() })))
        })
      )
      unsubs.push(
        onSnapshot(query(collection(db, 'scholarships'), orderBy('createdAt', 'desc')), (snap) => {
          setScholarships(snap.docs.map((d)=>({ id: d.id, ...d.data() })))
        })
      )
      unsubs.push(
        onSnapshot(query(collection(db, 'internal-transfers'), orderBy('createdAt', 'desc')), (snap) => {
          setTransfers(snap.docs.map((d)=>({ id: d.id, ...d.data() })))
        })
      )
    } catch (e) {}
    return () => unsubs.forEach((u)=>u())
  }, [])

  // Load fee settings
  useEffect(() => {
    (async () => {
      try {
        const y = new Date().getFullYear().toString()
        const res = await fetch(`/api/finance/fee-settings?year=${encodeURIComponent(y)}`)
        const json = await res.json()
        if (json.success) setFeeSettings(json.data)
      } catch {}
    })()
  }, [])

  // Realtime recent payments feed from student ledger
  useEffect(() => {
    let unsub: undefined | (() => void)
    try {
      unsub = onSnapshot(
        query(collection(db, 'student-ledger'), orderBy('createdAt', 'desc'), limit(25)),
        (snap) => {
          setRecentPayments(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as RecentPayment[]
          )
        }
      )
    } catch (e) {}
    return () => {
      if (unsub) unsub()
    }
  }, [])

  const createBudget = async () => {
    if (!budgetForm.departmentId || !budgetForm.year || !budgetForm.amount) {
      toast({ title: "Missing fields", description: "Department, Year and Amount are required", variant: "destructive" })
      return
    }
    setSavingBudget(true)
    try {
      const resp = await fetch('/api/finance/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: budgetForm.departmentId,
          year: budgetForm.year,
          amount: parseFloat(budgetForm.amount),
          createdBy: user?.name || 'finance_officer'
        })
      })
      const data = await resp.json()
      if (!data.success) throw new Error(data.error || 'Failed to create budget')
      setBudgetForm({ departmentId: "", year: "", amount: "" })
      toast({ title: "Budget Created", description: "Department budget has been added" })
    } catch (e: any) {
      toast({ title: "Create Failed", description: e.message || 'Failed to create budget', variant: 'destructive' })
    } finally {
      setSavingBudget(false)
    }
  }

  const saveFeeSettings = async () => {
    setSavingSettings(true)
    try {
      const res = await fetch('/api/finance/fee-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...feeSettings, updatedBy: user?.name || 'finance_officer' }) })
      const json = await res.json(); if (!json.success) throw new Error(json.error)
      setFeeSettings(json.data)
      toast({ title: 'Settings saved' })
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' })
    } finally { setSavingSettings(false) }
  }

  const createVendor = async () => {
    if (!newVendor.name) { toast({ title: 'Name required', variant: 'destructive' }); return }
    setCreatingVendor(true)
    try {
      const resp = await fetch('/api/finance/vendors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newVendor, createdBy: user?.name || 'finance_officer' }) })
      const data = await resp.json(); if (!data.success) throw new Error(data.error)
      setNewVendor({ name: '', email: '', phone: '', category: '', address: '' })
      toast({ title: 'Vendor created' })
    } catch (e: any) {
      toast({ title: 'Create failed', description: e.message, variant: 'destructive' })
    } finally { setCreatingVendor(false) }
  }

  const createProcurement = async () => {
    if (!newProc.vendorId || !newProc.description || !newProc.amount) { toast({ title: 'All fields required', variant: 'destructive' }); return }
    setCreatingProc(true)
    try {
      const resp = await fetch('/api/finance/procurements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendorId: newProc.vendorId, description: newProc.description, amount: parseFloat(newProc.amount), requestedBy: user?.name || 'finance_officer' }) })
      const data = await resp.json(); if (!data.success) throw new Error(data.error)
      setNewProc({ vendorId: '', description: '', amount: '' } as any)
      toast({ title: 'Request submitted' })
    } catch (e: any) {
      toast({ title: 'Submit failed', description: e.message, variant: 'destructive' })
    } finally { setCreatingProc(false) }
  }

  const createFeeStructure = async () => {
    if (!newFee.programme || !newFee.departmentId || !newFee.level || !newFee.year || !newFee.amount) {
      // Allow official (mode-based) structure when studyMode path is used
      if (!newFee.studyMode || !newFee.level || !newFee.year || !newFee.total || !newFee.firstPayment || !newFee.secondPayment) {
        toast({ title: 'All fields required', description: 'Provide programme-based fields or study mode with split amounts', variant: 'destructive' }); return
      }
    }
    setCreatingFee(true)
    try {
      const items = newFee.items ? newFee.items.split(',').map(s=>s.trim()).filter(Boolean) : []
      const payload: any = { year: newFee.year, createdBy: user?.name || 'finance_officer' }
      if (newFee.programme || newFee.departmentId || newFee.amount) {
        Object.assign(payload, { programme: newFee.programme, departmentId: newFee.departmentId, level: newFee.level, amount: parseFloat(newFee.amount || '0'), items })
      }
      if (newFee.studyMode || newFee.total || newFee.firstPayment || newFee.secondPayment) {
        Object.assign(payload, { studyMode: newFee.studyMode, level: newFee.level, total: parseFloat(newFee.total || '0'), firstPayment: parseFloat(newFee.firstPayment || '0'), secondPayment: parseFloat(newFee.secondPayment || '0'), thirdPayment: newFee.thirdPayment ? parseFloat(newFee.thirdPayment) : undefined })
      }
      const resp = await fetch('/api/finance/fee-structures', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await resp.json(); if (!data.success) throw new Error(data.error)
      setNewFee({ programme: '', departmentId: '', level: '', year: '', amount: '', items: '', studyMode: '', total: '', firstPayment: '', secondPayment: '', thirdPayment: '' })
      toast({ title: 'Fee structure created' })
    } catch (e: any) {
      toast({ title: 'Create failed', description: e.message, variant: 'destructive' })
    } finally { setCreatingFee(false) }
  }

  const createScholarship = async () => {
    if (!newScholar.studentId || !newScholar.name || !newScholar.amount) { toast({ title: 'All fields required', variant: 'destructive' }); return }
    setCreatingScholar(true)
    try {
      const resp = await fetch('/api/finance/scholarships', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: newScholar.studentId, name: newScholar.name, type: newScholar.type, amount: parseFloat(newScholar.amount), year: newScholar.year || undefined, createdBy: user?.name || 'finance_officer' }) })
      const data = await resp.json(); if (!data.success) throw new Error(data.error)
      setNewScholar({ studentId: '', name: '', type: 'scholarship', amount: '', year: '' })
      toast({ title: 'Application recorded' })
    } catch (e: any) {
      toast({ title: 'Create failed', description: e.message, variant: 'destructive' })
    } finally { setCreatingScholar(false) }
  }

  const awardScholarship = async (id: string) => {
    try {
      const resp = await fetch('/api/finance/scholarships/award', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, approver: user?.name || 'finance_officer' }) })
      const data = await resp.json(); if (!data.success) throw new Error(data.error)
      toast({ title: 'Scholarship awarded' })
    } catch (e: any) {
      toast({ title: 'Award failed', description: e.message, variant: 'destructive' })
    }
  }

  const createTransfer = async () => {
    if (!newTransfer.fromDepartmentId || !newTransfer.toDepartmentId || !newTransfer.amount) { toast({ title: 'All fields required', variant: 'destructive' }); return }
    setCreatingTransfer(true)
    try {
      const resp = await fetch('/api/finance/transfers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fromDepartmentId: newTransfer.fromDepartmentId, toDepartmentId: newTransfer.toDepartmentId, amount: parseFloat(newTransfer.amount), reason: newTransfer.reason, requestedBy: user?.name || 'finance_officer' }) })
      const data = await resp.json(); if (!data.success) throw new Error(data.error)
      setNewTransfer({ fromDepartmentId: '', toDepartmentId: '', amount: '', reason: '' })
      toast({ title: 'Transfer requested' })
    } catch (e: any) {
      toast({ title: 'Request failed', description: e.message, variant: 'destructive' })
    } finally { setCreatingTransfer(false) }
  }

  const addInvoiceItem = () => setInvoiceForm((p) => ({ ...p, items: [...p.items, { name: "", amount: "" }] }))
  const updateInvoiceItem = (idx: number, field: 'name' | 'amount', val: string) => {
    setInvoiceForm((p) => ({
      ...p,
      items: p.items.map((it, i) => (i === idx ? { ...it, [field]: val } : it))
    }))
  }
  const removeInvoiceItem = (idx: number) => setInvoiceForm((p) => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))

  const createInvoice = async () => {
    if (!invoiceForm.studentId || !invoiceForm.academicYear || invoiceForm.items.length === 0) {
      toast({ title: "Missing fields", description: "Student, Academic Year and at least one item are required", variant: "destructive" })
      return
    }
    setCreatingInvoice(true)
    try {
      const resp = await fetch('/api/finance/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...invoiceForm,
          items: invoiceForm.items.map(i => ({ name: i.name, amount: parseFloat(i.amount || '0') })),
          createdBy: user?.name || 'finance_officer'
        })
      })
      const data = await resp.json()
      if (!data.success) throw new Error(data.error || 'Failed to create invoice')
      toast({ title: "Invoice Created", description: `Invoice total ¢${data.data.total?.toLocaleString?.() || ''}` })
      setInvoiceForm({ studentId: "", studentName: "", academicYear: "", semester: "First Semester", items: [{ name: "Tuition", amount: "" }] })
    } catch (e: any) {
      toast({ title: "Create Failed", description: e.message || 'Failed to create invoice', variant: 'destructive' })
    } finally {
      setCreatingInvoice(false)
    }
  }

  const applyPayment = async (invoiceId: string, studentId: string, amount: number) => {
    try {
      const resp = await fetch('/api/finance/ledger/apply-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, studentId, amount, createdBy: user?.name || 'finance_officer' })
      })
      const data = await resp.json()
      if (!data.success) throw new Error(data.error || 'Failed to apply payment')
      toast({ title: "Payment Applied", description: `New balance ¢${(data.data.newBalance || 0).toLocaleString()}` })
    } catch (e: any) {
      toast({ title: "Payment Failed", description: e.message || 'Failed to apply payment', variant: 'destructive' })
    }
  }

  const togglePayrollSelect = (id: string) => setSelectedPayrollIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const approveSelected = async () => {
    if (selectedPayrollIds.length === 0) return
    setApprovingPayroll(true)
    try {
      const resp = await fetch('/api/finance/payroll/approve', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedPayrollIds, approver: user?.name || 'finance_officer' })
      })
      const data = await resp.json(); if (!data.success) throw new Error(data.error)
      toast({ title: "Approved", description: `${selectedPayrollIds.length} item(s) approved` })
      setSelectedPayrollIds([])
    } catch (e: any) {
      toast({ title: "Approve Failed", description: e.message || 'Failed to approve', variant: 'destructive' })
    } finally { setApprovingPayroll(false) }
  }
  const paySelected = async () => {
    if (selectedPayrollIds.length === 0) return
    setPayingPayroll(true)
    try {
      const resp = await fetch('/api/finance/payroll/pay', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedPayrollIds, payer: user?.name || 'finance_officer' })
      })
      const data = await resp.json(); if (!data.success) throw new Error(data.error)
      toast({ title: "Paid", description: `${selectedPayrollIds.length} item(s) marked paid` })
      setSelectedPayrollIds([])
    } catch (e: any) {
      toast({ title: "Payment Failed", description: e.message || 'Failed to mark paid', variant: 'destructive' })
    } finally { setPayingPayroll(false) }
  }

  // Fetch current academic year and semester
  const fetchCurrentAcademicInfo = async () => {
    try {
      const response = await fetch('/api/academic-period')
      const result = await response.json()
      
      if (result.success && result.data.academicYear) {
        setCurrentAcademicInfo({
          year: result.data.academicYear,
          semester: result.data.semester || 'First Semester'
        })
      } else {
        setCurrentAcademicInfo({
          year: 'Not Set',
          semester: 'Not Set'
        })
      }
    } catch (error) {
      console.error('Error fetching academic info:', error)
      // Show configuration error instead of fallback
      setCurrentAcademicInfo({
        year: 'Configuration Error',
        semester: 'Configuration Error'
      })
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/finance/services')
      const result = await response.json()
      
      if (result.success) {
        setServices(result.data)
        console.log('✅ Services loaded successfully:', result.data.length, 'services')
        console.log('📋 Service IDs loaded:', result.data.map((s: ServiceFee) => ({ id: s.id, name: s.name })))
      } else {
        console.error('❌ Failed to fetch services:', result.error)
      }
    } catch (error) {
      console.error('❌ Error fetching services:', error)
    }
  }

  // Reusable function to fetch student records
  const fetchStudentRecords = async () => {
    try {
      console.log('🔄 Refreshing student finance data...')
      
      const response = await fetch('/api/finance/students')
      const result = await response.json()
      
      if (result.success) {
        setFeesSummary(result.data.summary)
        setStudentRecords(result.data.studentRecords)
        console.log('✅ Student records updated successfully after payment verification')
      } else {
        console.error('❌ Failed to refresh finance data:', result.error)
      }
    } catch (error) {
      console.error("Error refreshing finance data:", error)
    }
  }

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        console.log('🏦 Fetching finance data with parallel optimization...')
        setLoading(true)
        
        // Parallel API calls for faster loading
        const [studentsRes, dashboardRes, servicesRes, academicRes] = await Promise.allSettled([
          fetch('/api/finance/students'),
          fetch('/api/finance/dashboard'),
          fetch('/api/finance/services'),
          fetch('/api/academic-period')
        ])
        
        // Process students data
        if (studentsRes.status === 'fulfilled') {
          try {
            const result = await studentsRes.value.json()
            if (result.success) {
              setFeesSummary(result.data.summary)
              setStudentRecords(result.data.studentRecords)
            }
          } catch (jsonError) {
            console.warn('Failed to parse students response:', jsonError)
            setFeesSummary({
              totalOutstanding: 0,
              totalPaid: 0,
              totalStudents: 0,
              overduePayments: 0
            })
            setStudentRecords([])
          }
        }
        
        // Process dashboard data
        if (dashboardRes.status === 'fulfilled') {
          try {
            const dashJson = await dashboardRes.value.json()
            if (dashJson.success) setDashboard(dashJson.data)
          } catch (jsonError) {
            console.warn('Failed to parse dashboard response:', jsonError)
          }
        }
        
        // Process services data
        if (servicesRes.status === 'fulfilled') {
          try {
            const servicesJson = await servicesRes.value.json()
            if (servicesJson.success) setServices(servicesJson.data || [])
          } catch (jsonError) {
            console.warn('Failed to parse services response:', jsonError)
            setServices([])
          }
        } else {
          console.warn('Services API failed:', servicesRes.reason)
          setServices([])
        }
        
        // Process academic info
        if (academicRes.status === 'fulfilled') {
          try {
            const academicJson = await academicRes.value.json()
            if (academicJson.success && academicJson.data?.academicYear) {
              setCurrentAcademicInfo({
                year: academicJson.data.academicYear,
                semester: academicJson.data.semester || 'First Semester'
              })
            } else {
              setCurrentAcademicInfo({
                year: '2027/2028', // Fallback to current academic year
                semester: 'First Semester'
              })
            }
          } catch (jsonError) {
            console.warn('Failed to parse academic response:', jsonError)
            setCurrentAcademicInfo({
              year: '2027/2028',
              semester: 'First Semester'
            })
          }
        } else {
          setCurrentAcademicInfo({
            year: '2027/2028',
            semester: 'First Semester'
          })
        }
        
        console.log('✅ All finance data loaded successfully with parallel fetching')
      } catch (error) {
        console.error("Error fetching finance data:", error)
        // Set fallback data
        setFeesSummary({
          totalOutstanding: 0,
          totalPaid: 0,
          totalStudents: 0,
          overduePayments: 0
        })
        setStudentRecords([])
        setCurrentAcademicInfo({
          year: '2027/2028',
          semester: 'First Semester'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFinanceData()
  }, [])

  // Field validation functions
  const validateField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case 'ghanaCardNumber':
        if (!value) return 'Ghana Card number is required'
        if (!/^GHA-\d{9}-\d$/.test(value)) return 'Invalid Ghana Card format (GHA-XXXXXXXXX-X)'
        return ''
      case 'amount':
        if (!value) return 'Amount is required'
        if (isNaN(Number(value)) || Number(value) <= 0) return 'Amount must be a positive number'
        return ''
      case 'paymentMethod':
        if (!value) return 'Payment method is required'
        return ''
      case 'paymentDate':
        if (!value) return 'Payment date is required'
        return ''
      case 'bankName':
        if (paymentForm.paymentMethod === 'Bank Transfer' && !value) return 'Bank name is required for bank transfers'
        return ''
      case 'referenceNumber':
        if (!value) return 'Reference number is required'
        return ''
      default:
        return ''
    }
  }

  const validateCurrentField = (fieldName: string, value: string) => {
    const error = validateField(fieldName, value)
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error
    }))
    return error === ''
  }

  const filteredRecords = studentRecords.filter(record => {
    const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || record.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleCreateService = async () => {
    try {
      if (!newService.name || !newService.amount || !newService.category) {
        alert('Please fill in all required fields: Service Name, Amount, and Category')
        return
      }

      const response = await fetch('/api/finance/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newService,
          amount: parseFloat(newService.amount) * 100, // Convert cedis to pesewas
          createdBy: user?.id || 'system',
          isActive: true
        }),
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Service created successfully:', result.data)
        
        toast({
          title: "Success",
          description: `Service "${newService.name}" has been created successfully`,
          variant: "default"
        })
        
        setServices([...services, result.data])
        setShowAddService(false)
        setNewService({
          name: '',
          description: '',
          amount: '',
          type: 'Service',
          category: '',
          forProgrammes: [],
          forLevels: []
        })
        // Refresh services list
        fetchServices()
      } else {
        console.error('❌ Create failed:', result.error)
        toast({
          title: "Create Failed",
          description: result.error || 'Failed to create service',
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('❌ Error creating service:', error)
      toast({
        title: "Create Failed",
        description: 'Network error occurred while creating service',
        variant: "destructive"
      })
    }
  }

  // Handle opening edit modal
  const handleEditService = (service: ServiceFee) => {
    setSelectedService(service)
    setEditService({
      name: service.name,
      description: service.description || '',
      amount: (service.amount / 100).toString(), // Convert pesewas to cedis for display
      type: service.type,
      category: service.category,
      forProgrammes: service.forProgrammes || [],
      forLevels: service.forLevels || []
    })
    setShowEditService(true)
  }

  // Handle saving edited service
  const handleSaveEditService = async () => {
    if (!editService.name || !editService.amount || !editService.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: Service Name, Amount, and Category",
        variant: "destructive"
      })
      return
    }

    if (!selectedService?.id) {
      toast({
        title: "Error",
        description: "No service selected for editing",
        variant: "destructive"
      })
      return
    }

    setIsUpdating(true)

    try {
      console.log('📝 Attempting to update service:', selectedService.id)
      
      const response = await fetch(`/api/finance/services/${selectedService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editService,
          amount: parseFloat(editService.amount) * 100, // Convert cedis to pesewas
          updatedBy: user?.id || 'system'
        }),
      })

      const result = await response.json()
      
      console.log('🔍 Update response:', result)

      if (result.success) {
        console.log('✅ Service updated successfully')
        
        toast({
          title: "Success",
          description: `Service "${editService.name}" has been updated successfully`,
          variant: "default"
        })
        
        // Update the service in the list
        setServices(services.map(s => 
          s.id === selectedService.id ? { ...s, ...result.data } : s
        ))
        setShowEditService(false)
        setSelectedService(null)
        
        // Refresh services list to ensure sync
        fetchServices()
      } else {
        console.error('❌ Update failed:', result.error)
        toast({
          title: "Update Failed",
          description: result.error || 'Failed to update service',
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('❌ Error updating service:', error)
      toast({
        title: "Update Failed",
        description: 'Network error occurred while updating service',
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle opening delete confirmation
  const handleDeleteService = (service: ServiceFee) => {
    setSelectedService(service)
    setShowDeleteService(true)
  }

  // Handle confirming service deletion
  const handleConfirmDeleteService = async () => {
    if (!selectedService?.id) {
      toast({
        title: "Error",
        description: "No service selected for deletion",
        variant: "destructive"
      })
      return
    }

    setIsDeleting(true)

    try {
      console.log('🗑️ Attempting to delete service:', selectedService.id)
      
      const response = await fetch(`/api/finance/services/${selectedService.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      
      console.log('🔍 Delete response:', result)

      if (result.success) {
        console.log('✅ Service deleted successfully')
        
        toast({
          title: "Success",
          description: `Service "${selectedService.name}" has been deleted successfully`,
          variant: "default"
        })
        
        // Remove the service from the list immediately
        setServices(services.filter(s => s.id !== selectedService.id))
        setShowDeleteService(false)
        setSelectedService(null)
        
        // Refresh services list to ensure sync
        fetchServices()
      } else {
        console.error('❌ Delete failed:', result.error)
        toast({
          title: "Delete Failed",
          description: result.error || 'Failed to delete service',
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('❌ Error deleting service:', error)
      toast({
        title: "Delete Failed", 
        description: 'Network error occurred while deleting service',
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage student fees and payments</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => window.open('/FEES%20PORTAL', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Fees Portal
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Current Academic Period */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <GraduationCap className="h-5 w-5" />
            Current Academic Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-blue-700">Academic Year</p>
              <p className="text-lg font-bold text-blue-900">
                {currentAcademicInfo.year || '2027/2028'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-700">Semester</p>
              <p className="text-lg font-bold text-blue-900">
                {currentAcademicInfo.semester || 'First Semester'}
              </p>
            </div>
          </div>
          {(!currentAcademicInfo.year || currentAcademicInfo.year === 'Not Set' || currentAcademicInfo.year === 'Configuration Error') && (
            <div className="mt-3 flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Using manually configured period: 2027/2028 - First Semester</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¢{feesSummary?.totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {feesSummary?.overduePayments} overdue payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¢{feesSummary?.totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This academic year
            </p>
          </CardContent>
        </Card>

        {dashboard && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¢{(dashboard.totals.netCashFlow || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Revenue − Expenses</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feesSummary?.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              With fee records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feesSummary ? Math.round((feesSummary.totalPaid / (feesSummary.totalPaid + feesSummary.totalOutstanding)) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Payment completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={(val)=>{ setActiveTab(val); try { router.replace(`${pathname}?tab=${val}`) } catch (e) {} }} className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Student Fees</TabsTrigger>
          <TabsTrigger value="services">Service</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="manual-verifications">Manual Verifications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-2">
                <MoreHorizontal className="h-4 w-4 mr-1" /> More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[220px]">
              <DropdownMenuItem onClick={()=>setActiveTab('settings')}>Fee Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>setActiveTab('budgets')}>Budgets</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>setActiveTab('invoices')}>Invoices</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>setActiveTab('payroll')}>Payroll</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>setActiveTab('fees')}>Fee Structures</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>setActiveTab('scholarships')}>Scholarships</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>setActiveTab('transfers')}>Internal Transfers</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>setActiveTab('vendors')}>Vendors</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>setActiveTab('procurement')}>Procurement</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
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
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Fee Record
            </Button>
          </div>

          {/* Student Fees Table */}
          <Card>
            <CardHeader>
              <CardTitle>Student Fee Records</CardTitle>
              <CardDescription>
                Manage individual student fee accounts and payment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Student</th>
                      <th className="text-left py-3 px-4 font-medium">Programme</th>
                      <th className="text-left py-3 px-4 font-medium">Level</th>
                      <th className="text-left py-3 px-4 font-medium">Total Fees</th>
                      <th className="text-left py-3 px-4 font-medium">Paid</th>
                      <th className="text-left py-3 px-4 font-medium">Outstanding</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{record.studentName}</div>
                            <div className="text-sm text-gray-500">{record.studentId}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{record.programme}</td>
                        <td className="py-3 px-4 text-sm">{record.level}</td>
                        <td className="py-3 px-4 font-medium">¢{record.totalFees.toLocaleString()}</td>
                        <td className="py-3 px-4 text-green-600 font-medium">¢{record.paidAmount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-red-600 font-medium">¢{record.outstandingBalance.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(record.status)}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedStudent(record)}
                              title="View student details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(record)
                                setShowPaymentVerification(true)
                              }}
                              className="text-green-600 hover:text-green-700"
                              title="Verify manual payment"
                            >
                              <CreditCard className="w-4 h-4" />
                            </Button>
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

        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fee Structures</CardTitle>
              <CardDescription>Programme/department level fees and items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <Input placeholder="Programme" value={newFee.programme} onChange={(e)=>setNewFee({...newFee, programme: e.target.value})} />
                <Input placeholder="Department ID" value={newFee.departmentId} onChange={(e)=>setNewFee({...newFee, departmentId: e.target.value})} />
                <Input placeholder="Level" value={newFee.level} onChange={(e)=>setNewFee({...newFee, level: e.target.value})} />
                <Input placeholder="Year (2025/2026)" value={newFee.year} onChange={(e)=>setNewFee({...newFee, year: e.target.value})} />
                <Input placeholder="Amount" value={newFee.amount} onChange={(e)=>setNewFee({...newFee, amount: e.target.value})} />
                <Input placeholder="Items (comma separated)" value={newFee.items} onChange={(e)=>setNewFee({...newFee, items: e.target.value})} />
                <select className="px-3 py-2 border rounded" value={newFee.studyMode} onChange={(e)=>setNewFee({...newFee, studyMode: e.target.value})}>
                  <option value="">Study Mode (optional)</option>
                  <option value="Regular">Regular</option>
                  <option value="Weekend">Weekend</option>
                </select>
                <Input placeholder="Total (optional)" value={newFee.total} onChange={(e)=>setNewFee({...newFee, total: e.target.value})} />
                <Input placeholder="1st Payment (optional)" value={newFee.firstPayment} onChange={(e)=>setNewFee({...newFee, firstPayment: e.target.value})} />
                <Input placeholder="2nd Payment (optional)" value={newFee.secondPayment} onChange={(e)=>setNewFee({...newFee, secondPayment: e.target.value})} />
                <Input placeholder="3rd Payment (optional)" value={newFee.thirdPayment} onChange={(e)=>setNewFee({...newFee, thirdPayment: e.target.value})} />
                <Button onClick={createFeeStructure} disabled={creatingFee}>{creatingFee ? 'Saving...' : 'Create'}</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Programme</th>
                      <th className="text-left py-2 px-3">Dept</th>
                      <th className="text-left py-2 px-3">Level</th>
                      <th className="text-left py-2 px-3">Mode</th>
                      <th className="text-left py-2 px-3">Year</th>
                      <th className="text-left py-2 px-3">Amount/Total</th>
                      <th className="text-left py-2 px-3">Split</th>
                      <th className="text-left py-2 px-3">Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeStructures.map(f => (
                      <tr key={f.id} className="border-b">
                        <td className="py-2 px-3">{f.programme || '-'}</td>
                        <td className="py-2 px-3">{f.departmentId || '-'}</td>
                        <td className="py-2 px-3">{f.level}</td>
                        <td className="py-2 px-3">{f.studyMode || '-'}</td>
                        <td className="py-2 px-3">{f.year}</td>
                        <td className="py-2 px-3">¢{(f.amount ?? f.total ?? 0).toLocaleString()}</td>
                        <td className="py-2 px-3 text-sm">{[f.firstPayment, f.secondPayment, f.thirdPayment].filter(Boolean).map((v:any)=>`¢${Number(v).toLocaleString()}`).join(' / ')}</td>
                        <td className="py-2 px-3 text-sm">{Array.isArray(f.items) ? f.items.join(', ') : ''}</td>
                      </tr>
                    ))}
                    {feeStructures.length === 0 && (<tr><td colSpan={8} className="py-6 text-center text-gray-500">No fee structures</td></tr>)}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scholarships" className="space-y-4">
          <ScholarshipManagement />
        </TabsContent>


        <TabsContent value="transfers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Internal Fund Transfers</CardTitle>
              <CardDescription>Department-to-department transfer requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <Input placeholder="From Dept ID" value={newTransfer.fromDepartmentId} onChange={(e)=>setNewTransfer({...newTransfer, fromDepartmentId: e.target.value})} />
                <Input placeholder="To Dept ID" value={newTransfer.toDepartmentId} onChange={(e)=>setNewTransfer({...newTransfer, toDepartmentId: e.target.value})} />
                <Input placeholder="Amount" value={newTransfer.amount} onChange={(e)=>setNewTransfer({...newTransfer, amount: e.target.value})} />
                <Input placeholder="Reason (optional)" value={newTransfer.reason} onChange={(e)=>setNewTransfer({...newTransfer, reason: e.target.value})} />
                <Button onClick={createTransfer} disabled={creatingTransfer}>{creatingTransfer ? 'Submitting...' : 'Request Transfer'}</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">From</th>
                      <th className="text-left py-2 px-3">To</th>
                      <th className="text-left py-2 px-3">Amount</th>
                      <th className="text-left py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map(t => (
                      <tr key={t.id} className="border-b">
                        <td className="py-2 px-3">{t.fromDepartmentId}</td>
                        <td className="py-2 px-3">{t.toDepartmentId}</td>
                        <td className="py-2 px-3">¢{(t.amount||0).toLocaleString()}</td>
                        <td className="py-2 px-3">{t.status}</td>
                      </tr>
                    ))}
                    {transfers.length === 0 && (<tr><td colSpan={4} className="py-6 text-center text-gray-500">No transfers</td></tr>)}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendors</CardTitle>
              <CardDescription>Registered suppliers and service providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <Input placeholder="Name" value={newVendor.name} onChange={(e)=>setNewVendor({...newVendor, name: e.target.value})} />
                <Input placeholder="Email" value={newVendor.email} onChange={(e)=>setNewVendor({...newVendor, email: e.target.value})} />
                <Input placeholder="Phone" value={newVendor.phone} onChange={(e)=>setNewVendor({...newVendor, phone: e.target.value})} />
                <Input placeholder="Category" value={newVendor.category} onChange={(e)=>setNewVendor({...newVendor, category: e.target.value})} />
                <Input placeholder="Address" value={newVendor.address} onChange={(e)=>setNewVendor({...newVendor, address: e.target.value})} />
                <Button onClick={createVendor} disabled={creatingVendor}>{creatingVendor ? 'Saving...' : 'Add Vendor'}</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Name</th>
                      <th className="text-left py-2 px-3">Category</th>
                      <th className="text-left py-2 px-3">Phone</th>
                      <th className="text-left py-2 px-3">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map(v => (
                      <tr key={v.id} className="border-b">
                        <td className="py-2 px-3">{v.name}</td>
                        <td className="py-2 px-3">{v.category || '-'}</td>
                        <td className="py-2 px-3">{v.phone || '-'}</td>
                        <td className="py-2 px-3">{v.email || '-'}</td>
                      </tr>
                    ))}
                    {vendors.length === 0 && (
                      <tr><td colSpan={4} className="py-6 text-center text-gray-500">No vendors yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procurement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Procurement Requests</CardTitle>
              <CardDescription>Track purchase requests and approvals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <select className="px-3 py-2 border rounded" value={newProc.vendorId} onChange={(e)=>setNewProc({...newProc, vendorId: e.target.value})}>
                  <option value="">Select Vendor</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
                <Input placeholder="Description" value={newProc.description} onChange={(e)=>setNewProc({...newProc, description: e.target.value})} />
                <div className="flex gap-2">
                  <Input placeholder="Amount" value={newProc.amount} onChange={(e)=>setNewProc({...newProc, amount: e.target.value})} />
                  <Button onClick={createProcurement} disabled={creatingProc}>{creatingProc ? 'Submitting...' : 'Request'}</Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Vendor</th>
                      <th className="text-left py-2 px-3">Description</th>
                      <th className="text-left py-2 px-3">Amount</th>
                      <th className="text-left py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {procurements.map(p => (
                      <tr key={p.id} className="border-b">
                        <td className="py-2 px-3">{vendors.find(v=>v.id===p.vendorId)?.name || p.vendorId}</td>
                        <td className="py-2 px-3">{p.description}</td>
                        <td className="py-2 px-3">¢{(p.amount||0).toLocaleString()}</td>
                        <td className="py-2 px-3">{p.status}</td>
                      </tr>
                    ))}
                    {procurements.length === 0 && (
                      <tr><td colSpan={4} className="py-6 text-center text-gray-500">No procurement requests</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" /> Department Budgets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <Input placeholder="Department ID" value={budgetForm.departmentId} onChange={(e)=>setBudgetForm({...budgetForm, departmentId: e.target.value})} />
                <Input placeholder="Year (e.g., 2025/2026)" value={budgetForm.year} onChange={(e)=>setBudgetForm({...budgetForm, year: e.target.value})} />
                <div className="flex gap-2">
                  <Input placeholder="Amount" value={budgetForm.amount} onChange={(e)=>setBudgetForm({...budgetForm, amount: e.target.value})} />
                  <Button onClick={createBudget} disabled={savingBudget}>{savingBudget ? 'Saving...' : 'Create'}</Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Department</th>
                      <th className="text-left py-2 px-3">Year</th>
                      <th className="text-left py-2 px-3">Amount</th>
                      <th className="text-left py-2 px-3">Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgets.map((b)=> (
                      <tr key={b.id} className="border-b">
                        <td className="py-2 px-3">{b.departmentId}</td>
                        <td className="py-2 px-3">{b.year}</td>
                        <td className="py-2 px-3">¢{(b.amount||0).toLocaleString()}</td>
                        <td className="py-2 px-3">¢{(b.usedAmount||0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" /> Create Invoice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Input placeholder="Student ID (master user)" value={invoiceForm.studentId} onChange={(e)=>setInvoiceForm({...invoiceForm, studentId: e.target.value})} />
                <Input placeholder="Student Name (optional)" value={invoiceForm.studentName} onChange={(e)=>setInvoiceForm({...invoiceForm, studentName: e.target.value})} />
                <Input placeholder="Academic Year" value={invoiceForm.academicYear} onChange={(e)=>setInvoiceForm({...invoiceForm, academicYear: e.target.value})} />
                <Input placeholder="Semester" value={invoiceForm.semester} onChange={(e)=>setInvoiceForm({...invoiceForm, semester: e.target.value})} />
              </div>
              <div className="space-y-2 mb-3">
                {invoiceForm.items.map((it, i)=> (
                  <div key={i} className="grid grid-cols-3 gap-2">
                    <Input placeholder="Item name" value={it.name} onChange={(e)=>updateInvoiceItem(i, 'name', e.target.value)} />
                    <Input placeholder="Amount" value={it.amount} onChange={(e)=>updateInvoiceItem(i, 'amount', e.target.value)} />
                    <Button variant="outline" onClick={()=>removeInvoiceItem(i)}>Remove</Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addInvoiceItem}>Add Item</Button>
              </div>
              <Button onClick={createInvoice} disabled={creatingInvoice}>{creatingInvoice ? 'Creating...' : 'Create Invoice'}</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Student</th>
                      <th className="text-left py-2 px-3">Year/Sem</th>
                      <th className="text-left py-2 px-3">Total</th>
                      <th className="text-left py-2 px-3">Balance</th>
                      <th className="text-left py-2 px-3">Status</th>
                      <th className="text-left py-2 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b">
                        <td className="py-2 px-3">{inv.studentName || inv.studentId}</td>
                        <td className="py-2 px-3">{inv.academicYear} / {inv.semester}</td>
                        <td className="py-2 px-3">¢{(inv.total||0).toLocaleString()}</td>
                        <td className="py-2 px-3">¢{(inv.balance||0).toLocaleString()}</td>
                        <td className="py-2 px-3">{inv.status}</td>
                        <td className="py-2 px-3">
                          <div className="flex gap-2">
                            {inv.balance > 0 && (
                              <Button size="sm" variant="outline" onClick={()=>applyPayment(inv.id, inv.studentId, Math.min(1000, inv.balance || 0))}>
                                <Banknote className="w-4 h-4 mr-1" /> Apply ¢1,000
                              </Button>
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

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" /> Payroll ({payrollMonth})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <Input type="month" value={payrollMonth} onChange={(e)=>setPayrollMonth(e.target.value)} className="w-48" />
                <Button variant="outline" disabled={approvingPayroll || selectedPayrollIds.length===0} onClick={approveSelected}>
                  {approvingPayroll ? 'Approving...' : 'Approve Selected'}
                </Button>
                <Button disabled={payingPayroll || selectedPayrollIds.length===0} onClick={paySelected}>
                  {payingPayroll ? 'Paying...' : 'Mark Paid'}
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Sel</th>
                      <th className="text-left py-2 px-3">Staff</th>
                      <th className="text-left py-2 px-3">Base</th>
                      <th className="text-left py-2 px-3">Allowances</th>
                      <th className="text-left py-2 px-3">Deductions</th>
                      <th className="text-left py-2 px-3">Net</th>
                      <th className="text-left py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payroll.map((p)=> (
                      <tr key={p.id} className="border-b">
                        <td className="py-2 px-3">
                          <input type="checkbox" checked={selectedPayrollIds.includes(p.id)} onChange={()=>togglePayrollSelect(p.id)} />
                        </td>
                        <td className="py-2 px-3">{p.staffName}</td>
                        <td className="py-2 px-3">¢{(p.baseSalary||0).toLocaleString()}</td>
                        <td className="py-2 px-3">¢{(p.allowances||0).toLocaleString()}</td>
                        <td className="py-2 px-3">¢{(p.deductions||0).toLocaleString()}</td>
                        <td className="py-2 px-3 font-semibold">¢{(p.netPay||0).toLocaleString()}</td>
                        <td className="py-2 px-3">
                          <Badge variant={p.status==='paid' ? 'default' : p.status==='approved' ? 'secondary' : 'outline'}>
                            {p.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          {/* Service Management Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Service Management</h3>
              <p className="text-sm text-gray-600">
                Manage services that students can request and pay for. Mandatory services are automatically displayed in student portals based on current academic year and semester.
              </p>
            </div>
            <Button onClick={() => setShowAddService(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>

          {/* Add Service Modal */}
          {showAddService && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Add New Service</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddService(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Service Name*</label>
                    <Input
                      value={newService.name}
                      onChange={(e) => setNewService({...newService, name: e.target.value})}
                      placeholder="e.g., Field Work Fee"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount (¢)*</label>
                    <Input
                      type="number"
                      value={newService.amount}
                      onChange={(e) => setNewService({...newService, amount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type*</label>
                    <select
                      value={newService.type}
                      onChange={(e) => setNewService({...newService, type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="Service">Service</option>
                      <option value="Mandatory">Mandatory</option>
                      <option value="Optional">Optional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category*</label>
                    <Input
                      value={newService.category}
                      onChange={(e) => setNewService({...newService, category: e.target.value})}
                      placeholder="e.g., Academic, Administrative"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input
                      value={newService.description}
                      onChange={(e) => setNewService({...newService, description: e.target.value})}
                      placeholder="Brief description of the service"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setShowAddService(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateService}>
                    <Save className="w-4 h-4 mr-2" />
                    Create Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Edit Service Modal */}
          {showEditService && selectedService && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Edit Service</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowEditService(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Service Name*</label>
                    <Input
                      value={editService.name}
                      onChange={(e) => setEditService({...editService, name: e.target.value})}
                      placeholder="Enter service name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount (¢)*</label>
                    <Input
                      type="number"
                      value={editService.amount}
                      onChange={(e) => setEditService({...editService, amount: e.target.value})}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type*</label>
                    <select 
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={editService.type}
                      onChange={(e) => setEditService({...editService, type: e.target.value as 'Service' | 'Mandatory' | 'Optional'})}
                    >
                      <option value="Service">Service</option>
                      <option value="Mandatory">Mandatory</option>
                      <option value="Optional">Optional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category*</label>
                    <Input
                      value={editService.category}
                      onChange={(e) => setEditService({...editService, category: e.target.value})}
                      placeholder="e.g. academic, accommodation, health"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input
                      value={editService.description}
                      onChange={(e) => setEditService({...editService, description: e.target.value})}
                      placeholder="Enter service description"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEditService(false)}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveEditService} 
                    className="bg-orange-600 hover:bg-orange-700"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Service
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delete Service Confirmation Modal */}
          {showDeleteService && selectedService && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-red-800">Delete Service</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowDeleteService(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Trash2 className="w-12 h-12 text-red-500" />
                    <div>
                      <h3 className="font-medium text-red-800">Are you sure you want to delete this service?</h3>
                      <p className="text-sm text-red-600 mt-1">
                        You are about to delete <strong>"{selectedService.name}"</strong>. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                  <div className="bg-red-100 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-700">
                      <strong>Warning:</strong> Deleting this service will remove it from all student fee calculations and payment options. 
                      Students will no longer be able to request or pay for this service.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteService(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConfirmDeleteService} 
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Service
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Services List */}
          <Card>
            <CardHeader>
              <CardTitle>Available Services</CardTitle>
              <CardDescription>
                Services that students can request through the fees portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Service Name</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-left py-3 px-4 font-medium">Category</th>
                      <th className="text-left py-3 px-4 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => (
                      <tr key={service.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{service.name}</div>
                            {service.description && (
                              <div className="text-sm text-gray-500">{service.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={
                            service.type === 'Mandatory' ? 'bg-red-100 text-red-800' :
                            service.type === 'Service' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {service.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{service.category}</td>
                        <td className="py-3 px-4 font-medium">¢{(service.amount / 100).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <Badge className={service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditService(service)}
                              title="Edit service"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteService(service)}
                              title="Delete service"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {services.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No services created yet</p>
                          <p className="text-sm">Click "Add Service" to create your first service</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>
                Latest payment transactions and confirmations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Date</th>
                      <th className="text-left py-2 px-3">Student</th>
                      <th className="text-left py-2 px-3">Amount</th>
                      <th className="text-left py-2 px-3">Method</th>
                      <th className="text-left py-2 px-3">Reference</th>
                      <th className="text-left py-2 px-3">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((p)=>{
                      const created = (p as any)?.createdAt
                      const date = created?.toDate ? created.toDate() : (created ? new Date(created) : null)
                      return (
                        <tr key={p.id} className="border-b">
                          <td className="py-2 px-3 text-sm">{date ? date.toLocaleString() : '-'}</td>
                          <td className="py-2 px-3 text-sm">{p.studentName || p.studentId}</td>
                          <td className="py-2 px-3 font-medium">¢{(p.amount||0).toLocaleString()}</td>
                          <td className="py-2 px-3 text-sm">{p.method || '-'}</td>
                          <td className="py-2 px-3 text-sm">{p.reference || '-'}</td>
                          <td className="py-2 px-3 text-sm">{p.invoiceId || '-'}</td>
                        </tr>
                      )
                    })}
                    {recentPayments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No recent payments to display</p>
                          <p className="text-sm">Payment records will appear here once students start making payments</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual-verifications" className="space-y-4">
          <ManualVerificationsContent />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Payment analytics coming soon</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Outstanding Fees by Programme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Programme breakdown coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fee Structure Settings</CardTitle>
              <CardDescription>
                Configure fee structures and payment policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <Input placeholder="Year" value={feeSettings.year || ''} onChange={(e)=>setFeeSettings({ ...feeSettings, year: e.target.value })} />
                <Input placeholder="Regular split (e.g., 50,50)" value={(feeSettings.regular?.split||[]).join(',')} onChange={(e)=>setFeeSettings({ ...feeSettings, regular: { split: e.target.value.split(',').map((v)=>Number(v.trim()||0)) } })} />
                <Input placeholder="Weekend split (e.g., 40,30,30)" value={(feeSettings.weekend?.split||[]).join(',')} onChange={(e)=>setFeeSettings({ ...feeSettings, weekend: { split: e.target.value.split(',').map((v)=>Number(v.trim()||0)) } })} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!feeSettings.publishToPortal} onChange={(e)=>setFeeSettings({ ...feeSettings, publishToPortal: e.target.checked })} />
                  Publish to student portal
                </label>
                <Button onClick={saveFeeSettings} disabled={savingSettings}>{savingSettings ? 'Saving...' : 'Save Settings'}</Button>
              </div>
              <p className="text-xs text-gray-500">These splits are used as defaults when Directors save mode-based fee structures and by the portal if per-level entries are missing.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Verification Modal */}
      {showPaymentVerification && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            <Card className="border-0">
              <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-green-800 flex items-center gap-2">
                      <CreditCard className="w-6 h-6" />
                      Manual Payment Verification
                    </CardTitle>
                    <CardDescription className="text-green-700 mt-1">
                      Verify offline payment for <span className="font-semibold">{selectedStudent.studentName}</span>
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowPaymentVerification(false)
                      setSelectedStudent(null)
                      setSelectedServices([])
                      setFieldErrors({})
                      setPaymentForm({
                        ghanaCardNumber: '',
                        amount: '',
                        paymentMethod: 'Bank Transfer',
                        bankName: '',
                        accountNumber: '',
                        referenceNumber: '',
                        paymentDate: new Date().toISOString().split('T')[0],
                        paymentTime: new Date().toTimeString().slice(0, 5),
                        bankReceiptNumber: '',
                        tellerName: '',
                        branch: '',
                        notes: '',
                        paymentFor: [],
                        manualEntry: true
                      })
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 p-6">
                {/* Progress Indicator */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Payment Verification Progress</span>
                    <span>
                      {
                        (paymentForm.ghanaCardNumber ? 1 : 0) +
                        (paymentForm.amount ? 1 : 0) +
                        (paymentForm.paymentMethod ? 1 : 0) +
                        (paymentForm.paymentDate ? 1 : 0) +
                        (paymentForm.bankName ? 1 : 0) +
                        (paymentForm.referenceNumber ? 1 : 0) +
                        (paymentForm.tellerName || paymentForm.branch ? 1 : 0) +
                        (paymentForm.paymentFor.length > 0 ? 1 : 0)
                      }/8 steps completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(
                          (paymentForm.ghanaCardNumber ? 1 : 0) +
                          (paymentForm.amount ? 1 : 0) +
                          (paymentForm.paymentMethod ? 1 : 0) +
                          (paymentForm.paymentDate ? 1 : 0) +
                          (paymentForm.bankName ? 1 : 0) +
                          (paymentForm.referenceNumber ? 1 : 0) +
                          (paymentForm.tellerName || paymentForm.branch ? 1 : 0) +
                          (paymentForm.paymentFor.length > 0 ? 1 : 0)
                        ) * 12.5}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Ghana Card</span>
                    <span>Amount</span>
                    <span>Method</span>
                    <span>Date</span>
                    <span>Bank</span>
                    <span>Reference</span>
                    <span>Teller</span>
                    <span>Payment For</span>
                  </div>
                </div>

                {/* Student Information Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-blue-900">Student Details</h4>
                    <p className="text-sm text-blue-700">ID: {selectedStudent.studentId}</p>
                    <p className="text-sm text-blue-700">Name: {selectedStudent.studentName}</p>
                    <p className="text-sm text-blue-700">Programme: {selectedStudent.programme}</p>
                    <p className="text-sm text-blue-700">Level: {selectedStudent.level}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">Academic Information</h4>
                    <p className="text-sm text-blue-700">Academic Year: {currentAcademicInfo.year}</p>
                    <p className="text-sm text-blue-700">Current Semester: {currentAcademicInfo.semester}</p>
                    <p className="text-sm text-blue-700">Programme Type: {selectedStudent.programme?.toLowerCase().includes('weekend') ? 'Weekend' : 'Regular'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">Current Fee Status</h4>
                    <p className="text-sm text-blue-700">Total Fees: ¢{selectedStudent.totalFees.toLocaleString()}</p>
                    <p className="text-sm text-blue-700">Paid: ¢{selectedStudent.paidAmount.toLocaleString()}</p>
                    <p className="text-sm text-blue-700">Outstanding: ¢{selectedStudent.outstandingBalance.toLocaleString()}</p>
                    <Badge className={getStatusColor(selectedStudent.status)}>
                      {selectedStudent.status.charAt(0).toUpperCase() + selectedStudent.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Payment Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Payment Details */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Payment Information</h4>
                    
                    {/* Ghana Card Number - First Field */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Ghana Card Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={paymentForm.ghanaCardNumber}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase()
                          setPaymentForm(prev => ({ ...prev, ghanaCardNumber: value }))
                          validateCurrentField('ghanaCardNumber', value)
                        }}
                        placeholder="GHA-XXXXXXXXX-X"
                        className={`mt-1 ${fieldErrors.ghanaCardNumber ? 'border-red-500' : ''}`}
                        disabled={false}
                      />
                      {fieldErrors.ghanaCardNumber && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.ghanaCardNumber}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Format: GHA-123456789-1
                      </p>
                    </div>

                    {/* Amount - Second Field */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Amount Paid (¢) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        value={paymentForm.amount}
                        onChange={(e) => {
                          const value = e.target.value
                          setPaymentForm(prev => ({ ...prev, amount: value }))
                          validateCurrentField('amount', value)
                        }}
                        placeholder="Enter amount from receipt"
                        className={`mt-1 ${fieldErrors.amount ? 'border-red-500' : ''}`}
                        disabled={!paymentForm.ghanaCardNumber || fieldErrors.ghanaCardNumber !== ''}
                      />
                      {fieldErrors.amount && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.amount}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Suggested: ¢{(selectedStudent.outstandingBalance / 2).toLocaleString()} (semester fee)
                      </p>
                      {/* Payment Guidance */}
                      <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                        <p className="text-xs text-blue-800 font-medium">💡 Payment Guidance:</p>
                        <ul className="text-xs text-blue-700 mt-1 space-y-1">
                          <li>• First Semester: ¢2,450</li>
                          <li>• Second Semester: ¢2,450</li>
                          <li>• Total for both: ¢4,900</li>
                          <li>• If paying ¢5,000, select both semesters</li>
                        </ul>
                      </div>
                    </div>

                    {/* Payment Method - Third Field */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Payment Method <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={paymentForm.paymentMethod}
                        onChange={(e) => {
                          const value = e.target.value
                          setPaymentForm(prev => ({ ...prev, paymentMethod: value }))
                          validateCurrentField('paymentMethod', value)
                        }}
                        className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md ${fieldErrors.paymentMethod ? 'border-red-500' : ''}`}
                        disabled={!paymentForm.amount || fieldErrors.amount !== ''}
                      >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Mobile Money">Mobile Money</option>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                      {fieldErrors.paymentMethod && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.paymentMethod}</p>
                      )}
                    </div>

                    {/* Payment Date and Time - Fourth Field */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Payment Date <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="date"
                          value={paymentForm.paymentDate}
                          onChange={(e) => {
                            const value = e.target.value
                            setPaymentForm(prev => ({ ...prev, paymentDate: value }))
                            validateCurrentField('paymentDate', value)
                          }}
                          className={`mt-1 ${fieldErrors.paymentDate ? 'border-red-500' : ''}`}
                          disabled={!paymentForm.paymentMethod || fieldErrors.paymentMethod !== ''}
                        />
                        {fieldErrors.paymentDate && (
                          <p className="text-xs text-red-500 mt-1">{fieldErrors.paymentDate}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Time</label>
                        <Input
                          type="time"
                          value={paymentForm.paymentTime}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentTime: e.target.value }))}
                          className="mt-1"
                          disabled={!paymentForm.paymentDate || fieldErrors.paymentDate !== ''}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Bank/Receipt Details */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Bank/Receipt Details</h4>
                    
                    {/* Bank Name - Fifth Field */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Bank Name {paymentForm.paymentMethod === 'Bank Transfer' && <span className="text-red-500">*</span>}
                      </label>
                      <Input
                        value={paymentForm.bankName}
                        onChange={(e) => {
                          const value = e.target.value
                          setPaymentForm(prev => ({ ...prev, bankName: value }))
                          validateCurrentField('bankName', value)
                        }}
                        placeholder="e.g., GCB Bank, Fidelity Bank"
                        className={`mt-1 ${fieldErrors.bankName ? 'border-red-500' : ''}`}
                        disabled={!paymentForm.paymentTime}
                      />
                      {fieldErrors.bankName && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.bankName}</p>
                      )}
                    </div>

                    {/* Reference Number - Sixth Field */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Reference Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={paymentForm.referenceNumber}
                        onChange={(e) => {
                          const value = e.target.value
                          setPaymentForm(prev => ({ ...prev, referenceNumber: value }))
                          validateCurrentField('referenceNumber', value)
                        }}
                        placeholder="Transaction reference from slip"
                        className={`mt-1 ${fieldErrors.referenceNumber ? 'border-red-500' : ''}`}
                        disabled={
                          !paymentForm.bankName || 
                          (paymentForm.paymentMethod === 'Bank Transfer' && fieldErrors.bankName !== '')
                        }
                      />
                      {fieldErrors.referenceNumber && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.referenceNumber}</p>
                      )}
                    </div>

                    {/* Bank Receipt Number - Seventh Field */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">Bank Receipt Number</label>
                      <Input
                        value={paymentForm.bankReceiptNumber}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, bankReceiptNumber: e.target.value }))}
                        placeholder="Receipt number from bank slip"
                        className="mt-1"
                        disabled={!paymentForm.referenceNumber || fieldErrors.referenceNumber !== ''}
                      />
                    </div>

                    {/* Teller and Branch - Eighth Field */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Teller Name</label>
                        <Input
                          value={paymentForm.tellerName}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, tellerName: e.target.value }))}
                          placeholder="Bank teller name"
                          className="mt-1"
                          disabled={!paymentForm.bankReceiptNumber}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Branch</label>
                        <Input
                          value={paymentForm.branch}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, branch: e.target.value }))}
                          placeholder="Bank branch"
                          className="mt-1"
                          disabled={!paymentForm.bankReceiptNumber}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment For Section */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Payment Applied To:</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={paymentForm.paymentFor.includes('semester1')}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setPaymentForm(prev => ({
                            ...prev,
                            paymentFor: checked 
                              ? [...prev.paymentFor, 'semester1']
                              : prev.paymentFor.filter(p => p !== 'semester1')
                          }))
                        }}
                        className="rounded"
                        disabled={!paymentForm.tellerName && !paymentForm.branch}
                      />
                      <div>
                        <p className="text-sm font-medium">First Semester</p>
                        <p className="text-xs text-gray-500">¢{(selectedStudent.totalFees / 2).toLocaleString()}</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={paymentForm.paymentFor.includes('semester2')}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setPaymentForm(prev => ({
                            ...prev,
                            paymentFor: checked 
                              ? [...prev.paymentFor, 'semester2']
                              : prev.paymentFor.filter(p => p !== 'semester2')
                          }))
                        }}
                        className="rounded"
                        disabled={!paymentForm.tellerName && !paymentForm.branch}
                      />
                      <div>
                        <p className="text-sm font-medium">Second Semester</p>
                        <p className="text-xs text-gray-500">¢{(selectedStudent.totalFees / 2).toLocaleString()}</p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={paymentForm.paymentFor.includes('other')}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setPaymentForm(prev => ({
                            ...prev,
                            paymentFor: checked 
                              ? [...prev.paymentFor, 'other']
                              : prev.paymentFor.filter(p => p !== 'other')
                          }))
                          if (checked) {
                            // Show services selection when "Other Fees" is checked
                          } else {
                            // Clear selected services when unchecked
                            setSelectedServices([])
                          }
                        }}
                        className="rounded"
                        disabled={!paymentForm.tellerName && !paymentForm.branch}
                      />
                      <div>
                        <p className="text-sm font-medium">Other Fees</p>
                        <p className="text-xs text-gray-500">Lab, Field Work, etc.</p>
                      </div>
                    </label>
                  </div>

                  {/* Services Selection - Shows when "Other Fees" is selected */}
                  {paymentForm.paymentFor.includes('other') && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">Select Specific Services:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                        {services
                          .filter(service => service.isActive && service.type !== 'Mandatory')
                          .map((service) => (
                            <label key={service.id} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-white">
                              <input
                                type="checkbox"
                                checked={selectedServices.includes(service.id)}
                                onChange={(e) => {
                                  const checked = e.target.checked
                                  setSelectedServices(prev => 
                                    checked 
                                      ? [...prev, service.id]
                                      : prev.filter(id => id !== service.id)
                                  )
                                }}
                                className="rounded"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{service.name}</p>
                                <p className="text-xs text-gray-500">
                                  ¢{(service.amount / 100).toLocaleString()} - {service.category}
                                </p>
                              </div>
                            </label>
                          ))}
                        {services.filter(service => service.isActive && service.type !== 'Mandatory').length === 0 && (
                          <p className="text-sm text-gray-500 col-span-2 text-center py-4">
                            No optional services available. Services must be added in the Services tab first.
                          </p>
                        )}
                      </div>
                      {selectedServices.length > 0 && (
                        <div className="mt-3 p-2 bg-blue-50 rounded">
                          <p className="text-xs text-blue-700">
                            Selected {selectedServices.length} service(s): {
                              services
                                .filter(s => selectedServices.includes(s.id))
                                .map(s => s.name)
                                .join(', ')
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes Section */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Verification Notes</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes about the payment verification..."
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t bg-gray-50 -mx-6 px-6 py-4 rounded-b-lg">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Step {paymentForm.paymentFor.length > 0 ? '8' : '7'} of 8:</span> Review and verify payment details
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowPaymentVerification(false)
                        setSelectedStudent(null)
                      }}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={async () => {
                      try {
                        // Validate form step by step
                        const requiredFields = ['ghanaCardNumber', 'amount', 'paymentMethod', 'paymentDate', 'referenceNumber']
                        const missingFields = []
                        
                        for (const field of requiredFields) {
                          const error = validateField(field, paymentForm[field as keyof typeof paymentForm] as string)
                          if (error) {
                            missingFields.push(field)
                          }
                        }

                        if (missingFields.length > 0) {
                          alert(`Please complete these required fields: ${missingFields.join(', ')}`)
                          return
                        }

                        // Validate payment amount vs selected fees
                        const selectedFeeAmount = paymentForm.paymentFor.reduce((total, feeType) => {
                          if (feeType === 'semester1' || feeType === 'semester2') {
                            return total + 2450; // Each semester is ¢2,450
                          }
                          return total;
                        }, 0);
                        
                        if (Number(paymentForm.amount) < selectedFeeAmount) {
                          alert(`Payment amount (¢${paymentForm.amount}) is less than selected fees (¢${selectedFeeAmount}). Please adjust the amount or select fewer fees.`);
                          return;
                        }
                        
                        if (Number(paymentForm.amount) > selectedFeeAmount + 1000) { // Allow small overpayment
                          // Suggest selecting second semester if payment covers it
                          if (Number(paymentForm.amount) >= 4900 && !paymentForm.paymentFor.includes('semester2')) {
                            const shouldAddSecondSemester = confirm(`Payment amount (¢${paymentForm.amount}) covers both semesters (¢4,900). Would you like to automatically select both semesters?`);
                            if (shouldAddSecondSemester) {
                              setPaymentForm(prev => ({
                                ...prev,
                                paymentFor: [...prev.paymentFor, 'semester2']
                              }));
                              // Update the selected services state as well
                              setSelectedServices(prev => [...prev]);
                            }
                          } else {
                            alert(`Payment amount (¢${paymentForm.amount}) is significantly more than selected fees (¢${selectedFeeAmount}). Please adjust the amount or select additional fees.`);
                            return;
                          }
                        }

                        if (paymentForm.paymentFor.length === 0) {
                          alert('Please select what this payment is for')
                          return
                        }

                        // Validate services if "Other Fees" is selected
                        if (paymentForm.paymentFor.includes('other') && selectedServices.length === 0) {
                          alert('Please select specific services for "Other Fees"')
                          return
                        }

                        // Prepare payment data
                        const paymentData = {
                          studentId: selectedStudent.studentId,
                          studentName: selectedStudent.studentName,
                          programme: selectedStudent.programme,
                          programmeType: selectedStudent.programme?.toLowerCase().includes('weekend') ? 'weekend' : 'regular',
                          level: selectedStudent.level,
                          ghanaCardNumber: paymentForm.ghanaCardNumber,
                          amount: paymentForm.amount,
                          paymentMethod: paymentForm.paymentMethod,
                          bankName: paymentForm.bankName,
                          referenceNumber: paymentForm.referenceNumber,
                          paymentDate: paymentForm.paymentDate,
                          paymentTime: paymentForm.paymentTime,
                          bankReceiptNumber: paymentForm.bankReceiptNumber,
                          tellerName: paymentForm.tellerName,
                          branch: paymentForm.branch,
                          notes: paymentForm.notes,
                          paymentFor: paymentForm.paymentFor,
                          selectedServices: selectedServices,
                          verifiedBy: user?.name || 'Director',
                          academicYear: currentAcademicInfo.year,
                          semester: currentAcademicInfo.semester
                        }

                        console.log('🔄 Verifying payment:', paymentData)

                        // Call API to verify payment
                        const response = await fetch('/api/finance/verify-payment', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(paymentData),
                        })

                        const result = await response.json()

                        if (result.success) {
                          // Show success message with better formatting
                          const successMessage = `
🎉 PAYMENT VERIFIED SUCCESSFULLY!

📋 Payment Details:
• Payment ID: ${result.paymentId}
• Student: ${selectedStudent.studentName}
• Amount: ¢${paymentForm.amount}
• Method: ${paymentForm.paymentMethod}
• Academic Year: ${currentAcademicInfo.year}

✅ The student's fees portal has been updated immediately.
✅ Transaction history has been created.
✅ Payment record is now available for verification.

The student can now view this payment in their portal.`

                          alert(successMessage)
                          
                          // Reset form and close modal with a slight delay for user to see success
                          setTimeout(() => {
                            setShowPaymentVerification(false)
                            setSelectedStudent(null)
                            setSelectedServices([])
                            setFieldErrors({})
                            setPaymentForm({
                              ghanaCardNumber: '',
                              amount: '',
                              paymentMethod: 'Bank Transfer',
                              bankName: '',
                              accountNumber: '',
                              referenceNumber: '',
                              paymentDate: new Date().toISOString().split('T')[0],
                              paymentTime: new Date().toTimeString().slice(0, 5),
                              bankReceiptNumber: '',
                              tellerName: '',
                              branch: '',
                              notes: '',
                              paymentFor: [],
                              manualEntry: true
                            })

                            // Refresh student records
                            fetchStudentRecords()
                          }, 1000)
                        } else {
                          alert(`❌ PAYMENT VERIFICATION FAILED\n\nError: ${result.error}\n\nPlease check the form details and try again.`)
                        }
                      } catch (error) {
                        console.error('❌ Payment verification error:', error)
                        alert('❌ Failed to verify payment. Please try again.')
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 font-medium"
                    disabled={!paymentForm.ghanaCardNumber || !paymentForm.amount || paymentForm.paymentFor.length === 0}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Verify Payment
                  </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default function StaffFinancePage() {
  // Select default tab from query (?tab=...)
  // We can read it in client component by checking window.location (simple approach)
  // Avoid SSR issues: pick after mount via useEffect by clicking tab programmatically
  return (
    <RouteGuard requiredPermissions={["finance_management"]}>
      <FinanceContent />
    </RouteGuard>
  )
}
