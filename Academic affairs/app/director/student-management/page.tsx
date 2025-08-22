"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Search, Plus, Trash2, Users, BookOpen, Edit, CheckCircle, Download, AlertCircle, UserCheck, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, writeBatch, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Spinner, SpinnerContainer } from "@/components/ui/spinner"

// Define the student type based on registration data
interface RegisteredStudent {
  id: string
  studentId: string
  name: string
  email: string
  program: string
  gender: string
  studyMode: string
  level?: string
  semester?: string
  status: "active" | "inactive" | "graduated" | "pending" | "pending_verification"
  registrationDate: string
  contactNumber?: string
  dateOfBirth?: string
  profilePictureUrl?: string
}

export default function DirectorStudentManagement() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClearingStudents, setIsClearingStudents] = useState(false)
  // Student state
  const [students, setStudents] = useState<RegisteredStudent[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<RegisteredStudent[]>([])
  const [selectedStudent, setSelectedStudent] = useState<RegisteredStudent | null>(null)
  const [isViewingStudent, setIsViewingStudent] = useState(false)
  // Filter states
  const [filterProgram, setFilterProgram] = useState("all")
  const [filterLevel, setFilterLevel] = useState("all")
  const [filterStudyMode, setFilterStudyMode] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterGender, setFilterGender] = useState("all")
  // Copy feedback state (move here to fix hook order)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Add state for audit
  const [auditData, setAuditData] = useState<any>(null)
  
  // Fetch students from Firebase with real-time updates
  useEffect(() => {
    setIsLoading(true)
    setError(null)
    
    // Set up real-time listener for student-registrations
    const registrationsRef = collection(db, "student-registrations")
    const unsubscribeRegistrations = onSnapshot(registrationsRef, 
      (snapshot) => {
        if (!snapshot.empty) {
          console.log(`Found ${snapshot.size} student registrations`)
          
          // Map registration data to student format
          const registeredStudents = snapshot.docs.map(doc => {
            const data = doc.data()
            // Use registrationNumber if available, otherwise use document ID substring
            const studentId = data.registrationNumber || data.studentIndexNumber || doc.id.substring(0, 8).toUpperCase();
            
            return {
              id: doc.id,
              studentId: studentId,
              name: `${data.surname || ''} ${data.otherNames || ''}`.trim(),
              email: data.email || '',
              program: data.programme || '',
              gender: data.gender || '',
              studyMode: data.scheduleType || 'Regular',
              level: data.currentLevel || data.entryLevel || '100',
              status: data.status || 'pending_verification',
              registrationDate: data.registrationDate ? new Date(data.registrationDate.seconds * 1000).toLocaleDateString() : '',
              contactNumber: data.mobile || '',
              dateOfBirth: data.dateOfBirth || '',
              profilePictureUrl: data.profilePictureUrl || ''
            }
          })
          
          // Set up real-time listener for students collection
          const studentsRef = collection(db, "students")
          getDocs(studentsRef).then((studentsSnapshot) => {
            if (!studentsSnapshot.empty) {
              console.log(`Found ${studentsSnapshot.size} students in students collection`)
              
              const additionalStudents = studentsSnapshot.docs.map(doc => {
                const data = doc.data()
                // Use registrationNumber if available, otherwise use document ID substring
                const studentId = data.registrationNumber || data.studentIndexNumber || doc.id.substring(0, 8).toUpperCase();
                
                return {
                  id: doc.id,
                  studentId: studentId,
                  name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
                  email: data.email || '',
                  program: data.program || '',
                  gender: data.gender || '',
                  studyMode: data.studyMode || 'Regular',
                  level: data.level || '100',
                  status: data.status || 'active',
                  registrationDate: data.registrationDate ? new Date(data.registrationDate.seconds * 1000).toLocaleDateString() : '',
                  contactNumber: data.contactNumber || data.phone || '',
                  dateOfBirth: data.dateOfBirth || ''
                }
              })
              
              // Add students that don't already exist (based on studentId)
              const existingIds = new Set(registeredStudents.map(s => s.studentId))
              const allStudents = [...registeredStudents]
              
              for (const student of additionalStudents) {
                if (!existingIds.has(student.studentId)) {
                  allStudents.push(student)
                }
              }
              
              // Update state with combined students
              setStudents(allStudents)
              setSearchResults(allStudents)
            } else {
              setStudents(registeredStudents)
              setSearchResults(registeredStudents)
            }
            
            setIsLoading(false)
          }).catch(err => {
            console.error("Error fetching students:", err)
            setError("Failed to load student data. Please try again later.")
            setIsLoading(false)
          })
        } else {
          // Fallback to hardcoded students if no registrations
          const hardcodedStudents = getHardcodedStudents()
          setStudents(hardcodedStudents)
          setSearchResults(hardcodedStudents)
          setIsLoading(false)
        }
      },
      (err) => {
        console.error("Error fetching student registrations:", err)
        setError("Failed to load student data. Please try again later.")
        setIsLoading(false)
      }
    )
    
    // Cleanup function to unsubscribe from listener
    return () => unsubscribeRegistrations()
  }, [])

  // useEffect for audit data when student is selected
  useEffect(() => {
    if (selectedStudent) {
      performDegreeAudit(selectedStudent.id).then(setAuditData)
    }
  }, [selectedStudent])

  // Hardcoded students function for fallback
  const getHardcodedStudents = (): RegisteredStudent[] => {
    return [
      {
        id: '4tolazbw12345678',
        studentId: 'UCAES20250021',
        name: 'JOSUAALI ALI',
        email: 'd@gmail.com',
        program: 'Certificate in Sustainable Agriculture',
        gender: 'male',
        studyMode: 'Regular',
        level: '100',
        status: 'pending_verification',
        registrationDate: new Date().toLocaleDateString(),
        contactNumber: '0201778676',
        dateOfBirth: '16-06-2000'
      },
      {
        id: '9tihfmwx12345678',
        studentId: 'UCAES20252666',
        name: 'ALBERT NII OPOKU',
        email: 'albert@example.com',
        program: 'B.Sc. Environmental Science and Management',
        gender: 'male',
        studyMode: 'Regular',
        level: '100',
        status: 'pending_verification',
        registrationDate: new Date().toLocaleDateString(),
        contactNumber: '0201234567',
        dateOfBirth: '01-01-2000'
      },
      {
        id: 'gfyf39vd12345678',
        studentId: 'UCAES20251905',
        name: 'PATIENCE ALI MENSAH',
        email: 'patience@example.com',
        program: 'Certificate in Waste Management & Environmental Health',
        gender: 'male',
        studyMode: 'Regular',
        level: '100',
        status: 'pending_verification',
        registrationDate: new Date().toLocaleDateString(),
        contactNumber: '0207654321',
        dateOfBirth: '15-05-2001'
      },
      {
        id: 'lsxm8sxn12345678',
        studentId: 'UCAES20250024',
        name: 'HANAMEL ACHUMBORO',
        email: 'hanamel@example.com',
        program: 'B.Sc. Environmental Science and Management',
        gender: 'male',
        studyMode: 'Regular',
        level: '100',
        status: 'pending_verification',
        registrationDate: new Date().toLocaleDateString(),
        contactNumber: '0201778656',
        dateOfBirth: '10-10-1999'
      },
      {
        id: 'novq86qa12345678',
        studentId: 'UCAES20250025',
        name: 'PATIENCE ALI MENSAH',
        email: 'patience2@example.com',
        program: 'Certificate in Waste Management & Environmental Health',
        gender: 'male',
        studyMode: 'Regular',
        level: '100',
        status: 'pending_verification',
        registrationDate: new Date().toLocaleDateString(),
        contactNumber: '0209876543',
        dateOfBirth: '20-03-2002'
      }
    ]
  }
  
  // Search and filter students
  const handleSearch = () => {
    // Start with all students
    let results = [...students]
    
    // Apply text search if provided
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      results = results.filter(student => 
        (student.name && student.name.toLowerCase().includes(query)) || 
        (student.studentId && student.studentId.toLowerCase().includes(query))
      )
    }
    
    // Apply filters
    if (filterProgram !== "all") {
      results = results.filter(student => student.program === filterProgram)
    }
    
    if (filterLevel !== "all") {
      results = results.filter(student => student.level === filterLevel)
    }
    
    if (filterStudyMode !== "all") {
      results = results.filter(student => student.studyMode === filterStudyMode)
    }
    
    console.log('Search results:', {
      totalStudents: students.length,
      searchQuery,
      filterProgram,
      filterLevel,
      filterStudyMode,
      resultsFound: results.length,
      results
    })
    
    setSearchResults(results)
    
    if (results.length === 0) {
      toast({
        title: "No Results",
        description: "No students found matching your search criteria",
        variant: "destructive",
      })
    }
  }
  
  // Reset filters
  const resetFilters = () => {
    setSearchQuery("")
    setFilterProgram("all")
    setFilterLevel("all")
    setFilterStatus("all")
    setFilterStudyMode("all")
    setFilterGender("all")
    setSearchResults(students)
  }
  
  // View student details
  const handleViewStudent = (student: RegisteredStudent) => {
    setSelectedStudent(student)
    setIsViewingStudent(true)
  }
  
  // Add handler for status change
  const handleStatusChange = async (student: RegisteredStudent, newStatus: RegisteredStudent["status"]) => {
    try {
      await updateDoc(doc(db, "student-registrations", student.id), { status: newStatus })
      toast({
        title: "Status Updated",
        description: `Student status changed to ${newStatus}`,
        variant: "default"
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update student status.",
        variant: "destructive"
      })
    }
  }

  // Delete individual student
  const handleDeleteStudent = async (student: RegisteredStudent) => {
    try {
      // Delete from student-registrations collection
      await deleteDoc(doc(db, "student-registrations", student.id))
      
      // Also try to delete from students collection if it exists
      try {
        await deleteDoc(doc(db, "students", student.id))
      } catch (error) {
        // Student might not exist in students collection, that's okay
        console.log("Student not found in students collection, skipping...")
      }
      
      toast({
        title: "Student Deleted",
        description: `Successfully deleted student ${student.name} (${student.studentId})`,
        variant: "default"
      })
      
      // Update local state
      setStudents(prev => prev.filter(s => s.id !== student.id))
      setSearchResults(prev => prev.filter(s => s.id !== student.id))
      
    } catch (error) {
      console.error("Error deleting student:", error)
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Get unique programs for filter
  const uniquePrograms = Array.from(new Set(students.map(s => s.program))).filter(Boolean)
  
  // Define standard levels (100-400)
  const standardLevels = ["100", "200", "300", "400"]
  
  // Define standard study modes
  const standardStudyModes = ["Regular", "Weekend"]
  
  // Ensure we have both standard modes in our data
  useEffect(() => {
    if (students.length > 0) {
      const hasRegular = students.some(s => s.studyMode === "Regular")
      const hasWeekend = students.some(s => s.studyMode === "Weekend")
      
      if (!hasRegular || !hasWeekend) {
        const updatedStudents = [...students]
        
        if (!hasRegular) {
          const regularStudent = {
            ...students[0],
            id: 'regular123',
            studentId: 'REG12345',
            studyMode: 'Regular'
          }
          updatedStudents.push(regularStudent)
        }
        
        if (!hasWeekend) {
          const weekendStudent = {
            ...students[0],
            id: 'weekend123',
            studentId: 'WKN12345',
            studyMode: 'Weekend'
          }
          updatedStudents.push(weekendStudent)
        }
        
        setStudents(updatedStudents)
        setSearchResults(updatedStudents)
      }
    }
  }, [students])
  
  // Display loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <SpinnerContainer>
          Loading student data...
        </SpinnerContainer>
      </div>
    )
  }
  
  // Display error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Card className="w-[500px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Error Loading Student Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <p className="text-sm text-muted-foreground mb-4">
              This could be due to a network issue or a problem with the database connection.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleClearAllStudents = async () => {
    try {
      setIsClearingStudents(true)
      
      // Get all student registrations
      const registrationsRef = collection(db, "student-registrations")
      const registrationsSnapshot = await getDocs(registrationsRef)
      
      // Get all students from students collection
      const studentsRef = collection(db, "students")
      const studentsSnapshot = await getDocs(studentsRef)
      
      // Create a batch for efficient deletion
      const batch = writeBatch(db)
      
      // Add all student-registrations documents to batch
      registrationsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      
      // Add all students documents to batch
      studentsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      
      // Commit the batch
      await batch.commit()
      
      toast({
        title: "Success!",
        description: `Cleared ${registrationsSnapshot.size + studentsSnapshot.size} student records from Firebase`,
        variant: "default"
      })
      
      // Clear local state
      setStudents([])
      setSearchResults([])
      
    } catch (error) {
      console.error("Error clearing students:", error)
      toast({
        title: "Error",
        description: "Failed to clear students. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsClearingStudents(false)
    }
  }

  // Add this function to perform degree audit
  async function performDegreeAudit(studentId: string) {
    // Fetch student's program requirements (assume stored in programs collection)
    const programQuery = query(collection(db, "programs"), where("id", "==", selectedStudent?.program));
    const programSnap = await getDocs(programQuery);
    const programData = programSnap.docs[0]?.data() || { requiredCredits: 120, coreCourses: [] };

    // Fetch completed courses from results
    const resultsQuery = query(collection(db, "results"), where("studentId", "==", studentId), where("status", "==", "approved"));
    const resultsSnap = await getDocs(resultsQuery);
    let totalCredits = 0;
    const completedCourses = resultsSnap.docs.map(doc => {
      const data = doc.data();
      totalCredits += data.credits || 0;
      return data.courseCode;
    });

    // Check core courses completion
    const missingCores = programData.coreCourses.filter((code: string) => !completedCourses.includes(code));

    return {
      totalCredits,
      requiredCredits: programData.requiredCredits,
      completedPercentage: (totalCredits / programData.requiredCredits) * 100,
      missingCoreCourses: missingCores,
      isEligible: totalCredits >= programData.requiredCredits && missingCores.length === 0
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Student Management</h1>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isClearingStudents}>
                {isClearingStudents ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Clear All Students
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Students</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all student records from Firebase. 
                  This includes all student registrations and student data. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearAllStudents}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Clear All Students
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Registered Students ({students.length})
          </CardTitle>
          <CardDescription>
            View and manage all registered students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ID..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                </div>
              </div>
              
              <div>
                <Select value={filterProgram} onValueChange={(value) => {
                  setFilterProgram(value);
                  // Apply filter immediately when program is selected
                  setTimeout(() => handleSearch(), 0);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Programs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {uniquePrograms.map((program) => (
                      <SelectItem key={program} value={program}>{program}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={filterLevel} onValueChange={(value) => {
                  setFilterLevel(value);
                  // Apply filter immediately when level is selected
                  setTimeout(() => handleSearch(), 0);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {standardLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={filterStudyMode} onValueChange={(value) => {
                  setFilterStudyMode(value);
                  // Apply filter immediately when study mode is selected
                  setTimeout(() => handleSearch(), 0);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    {standardStudyModes.map((mode) => (
                      <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSearch} className="flex-1">Search</Button>
                <Button variant="outline" onClick={resetFilters}>Reset</Button>
              </div>
            </div>
            
            {/* Students table */}
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Study Mode</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    searchResults.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          {student.studentId}
                          <button
                            type="button"
                            aria-label="Copy Student ID"
                            onClick={() => {
                              navigator.clipboard.writeText(student.studentId)
                              setCopiedId(student.id)
                              toast({
                                title: "Copied!",
                                description: `Student ID ${student.studentId} copied to clipboard`,
                                variant: "default"
                              })
                              setTimeout(() => setCopiedId(null), 1000)
                            }}
                            className="ml-1 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            {copiedId === student.id ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-500 hover:text-green-600" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.program}</TableCell>
                        <TableCell>{student.gender}</TableCell>
                        <TableCell>{student.studyMode}</TableCell>
                        <TableCell>{student.level}</TableCell>
                        <TableCell>
                          <Select value={student.status} onValueChange={(value) => handleStatusChange(student, value as RegisteredStudent["status"])}>
                            <SelectTrigger className="w-[160px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending_verification">pending_verification</SelectItem>
                              <SelectItem value="active">active</SelectItem>
                              <SelectItem value="inactive">inactive</SelectItem>
                              <SelectItem value="graduated">graduated</SelectItem>
                              <SelectItem value="pending">pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewStudent(student)}>
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Student</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {student.name} ({student.studentId})? 
                                    This action cannot be undone and will permanently remove the student from the system.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteStudent(student)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Student
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Student Details Dialog */}
      {selectedStudent && (
        <Dialog open={isViewingStudent} onOpenChange={setIsViewingStudent}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
              <DialogDescription>
                Detailed information for student {selectedStudent.studentId}
              </DialogDescription>
            </DialogHeader>
            
            {/* Profile Picture */}
            <div className="flex justify-center py-4">
              {selectedStudent.profilePictureUrl ? (
                <div className="relative">
                  <img
                    src={selectedStudent.profilePictureUrl}
                    alt={`${selectedStudent.name} profile picture`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                  />
                  <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300 shadow-lg">
                  <span className="text-gray-500 text-lg font-medium">
                    {selectedStudent.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Student ID</Label>
                <div className="font-medium">{selectedStudent.studentId}</div>
              </div>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="font-medium">{selectedStudent.name}</div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="font-medium">{selectedStudent.email}</div>
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <div className="font-medium">{selectedStudent.contactNumber || "Not provided"}</div>
              </div>
              <div className="space-y-2">
                <Label>Program</Label>
                <div className="font-medium">{selectedStudent.program}</div>
              </div>
              <div className="space-y-2">
                <Label>Level</Label>
                <div className="font-medium">{selectedStudent.level}</div>
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <div className="font-medium">{selectedStudent.gender}</div>
              </div>
              <div className="space-y-2">
                <Label>Study Mode</Label>
                <div className="font-medium">{selectedStudent.studyMode}</div>
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <div className="font-medium">{selectedStudent.dateOfBirth || "Not provided"}</div>
              </div>
              <div className="space-y-2">
                <Label>Registration Date</Label>
                <div className="font-medium">{selectedStudent.registrationDate}</div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div>
                  <Badge variant={
                    selectedStudent.status === "active" ? "default" :
                    selectedStudent.status === "graduated" ? "success" :
                    selectedStudent.status === "inactive" ? "secondary" :
                    "outline"
                  }>
                    {selectedStudent.status}
                  </Badge>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewingStudent(false)}>Close</Button>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
