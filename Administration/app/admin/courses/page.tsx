"use client"

import { useState, useEffect, FormEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Edit, Eye, Trash2, Filter, MoreHorizontal, AlertCircle, Sync, RefreshCcw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { sampleCourses } from "@/lib/sample-data"
import type { Course } from "@/lib/types"
import { toast } from "sonner"
import { clearAllData, syncModuleData } from "@/lib/firebase-services"
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
import { collection, getDocs, query, where, deleteDoc, doc, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSemester, setFilterSemester] = useState("all")
  const [filterLevel, setFilterLevel] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isAddDepartmentDialogOpen, setIsAddDepartmentDialogOpen] = useState(false)
  const [newDepartmentName, setNewDepartmentName] = useState("")
  const [departments, setDepartments] = useState<string[]>(["Agriculture", "Environmental Science", "Information Technology"])
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [resetResults, setResetResults] = useState<{ success: boolean; message: string; deletedCount: Record<string, number> } | null>(null)
  const [newCourse, setNewCourse] = useState({
    code: "",
    title: "",
    creditHours: 3,
    department: "",
    semester: "",
    level: "",
    lecturer: "",
    description: "",
    status: "Active",
    prerequisites: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch courses from Firebase
    const fetchCourses = async () => {
      try {
        const coursesRef = collection(db, "courses");
        const coursesSnapshot = await getDocs(coursesRef);
        
        if (coursesSnapshot.empty) {
          setCourses([]);
          setFilteredCourses([]);
          return;
        }
        
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Course[];
        
        setCourses(coursesData);
        setFilteredCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses: " + (error instanceof Error ? error.message : "Unknown error"));
        
        // Fallback to sample data if Firebase fetch fails
        setCourses(sampleCourses);
        setFilteredCourses(sampleCourses);
      }
    };
    
    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = courses

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.lecturer.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Semester filter
    if (filterSemester !== "all") {
      filtered = filtered.filter((course) => course.semester === filterSemester)
    }

    // Level filter
    if (filterLevel !== "all") {
      filtered = filtered.filter((course) => course.level === filterLevel)
    }

    setFilteredCourses(filtered)
  }, [courses, searchTerm, filterSemester, filterLevel])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "Inactive":
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const semesters = [...new Set(courses.map((c) => c.semester))]
  const levels = [...new Set(courses.map((c) => c.level))]

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course)
    setIsViewDialogOpen(true)
  }

  const handleAddDepartment = () => {
    if (!newDepartmentName.trim()) {
      toast.error("Department name cannot be empty");
      return;
    }

    if (departments.includes(newDepartmentName.trim())) {
      toast.error("Department already exists");
      return;
    }

    setDepartments([...departments, newDepartmentName.trim()]);
    setNewDepartmentName("");
    setIsAddDepartmentDialogOpen(false);
    toast.success(`Department "${newDepartmentName.trim()}" added successfully`);
  }

  // Add function to reset courses
  const handleResetCourses = async () => {
    setIsResetting(true)
    setResetResults(null)
    
    try {
      // Option 1: Clear only courses collection
      const coursesRef = collection(db, "courses")
      const coursesSnapshot = await getDocs(coursesRef)
      let deletedCount = 0
      
      for (const document of coursesSnapshot.docs) {
        await deleteDoc(doc(db, "courses", document.id))
        deletedCount++
      }
      
      // Option 2: Clear all course-related collections
      const programCoursesRef = collection(db, "program-courses")
      const programCoursesSnapshot = await getDocs(programCoursesRef)
      let programCoursesDeleted = 0
      
      for (const document of programCoursesSnapshot.docs) {
        await deleteDoc(doc(db, "program-courses", document.id))
        programCoursesDeleted++
      }
      
      // Update UI after reset
      setCourses([])
      setFilteredCourses([])
      
      toast.success(`Successfully cleared ${deletedCount} courses and ${programCoursesDeleted} program assignments`)
      
      // Reinitialize with default courses after clearing
      await syncModuleData()
    } catch (error) {
      console.error("Error resetting courses:", error)
      toast.error("Failed to reset courses: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsResetting(false)
      setIsResetDialogOpen(false)
    }
  }

  // Add function to handle input changes
  const handleInputChange = (field: string, value: string | number) => {
    setNewCourse(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add function to handle course submission
  const handleAddCourse = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newCourse.code || !newCourse.title || !newCourse.department || 
        !newCourse.semester || !newCourse.level) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Add to courses collection
      const courseData = {
        ...newCourse,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, "courses"), courseData);
      
      // Get program code from department (could be enhanced)
      let programCode = "";
      if (newCourse.department === "Environmental Science") {
        programCode = "BESM";
      } else if (newCourse.department === "Agriculture") {
        programCode = "BSA";
      } else if (newCourse.department === "Land Economy") {
        programCode = "BLE";
      }
      
      // Add to program-courses collection if we have a program code
      if (programCode) {
        await addDoc(collection(db, "program-courses"), {
          programCode,
          courseCode: newCourse.code,
          level: newCourse.level,
          semester: newCourse.semester,
          required: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      // Refresh courses list
      const coursesRef = collection(db, "courses");
      const coursesSnapshot = await getDocs(coursesRef);
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      
      setCourses(coursesData);
      setFilteredCourses(coursesData);
      
      // Reset form and close dialog
      setNewCourse({
        code: "",
        title: "",
        creditHours: 3,
        department: "",
        semester: "",
        level: "",
        lecturer: "",
        description: "",
        status: "Active",
        prerequisites: []
      });
      setIsAddDialogOpen(false);
      
      toast.success(`Course ${newCourse.code} added successfully`);
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error("Failed to add course: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600">Manage course offerings and curriculum</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            onClick={() => setIsResetDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Reset Courses
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-700 hover:bg-green-800">
                <Plus className="mr-2 h-4 w-4" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleAddCourse}>
                <DialogHeader>
                  <DialogTitle>Add New Course</DialogTitle>
                  <DialogDescription>Enter the course information below.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="courseCode">Course Code <span className="text-red-500">*</span></Label>
                      <Input 
                        id="courseCode" 
                        placeholder="AGRI301" 
                        value={newCourse.code}
                        onChange={(e) => handleInputChange('code', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="creditHours">Credit Hours <span className="text-red-500">*</span></Label>
                      <Input 
                        id="creditHours" 
                        type="number" 
                        placeholder="3" 
                        value={newCourse.creditHours}
                        onChange={(e) => handleInputChange('creditHours', parseInt(e.target.value) || 0)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="courseTitle">Course Title <span className="text-red-500">*</span></Label>
                    <Input 
                      id="courseTitle" 
                      placeholder="Crop Production" 
                      value={newCourse.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester <span className="text-red-500">*</span></Label>
                      <Select 
                        value={newCourse.semester} 
                        onValueChange={(value) => handleInputChange('semester', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="First">First</SelectItem>
                          <SelectItem value="Second">Second</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level">Level <span className="text-red-500">*</span></Label>
                      <Select 
                        value={newCourse.level} 
                        onValueChange={(value) => handleInputChange('level', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="200">200</SelectItem>
                          <SelectItem value="300">300</SelectItem>
                          <SelectItem value="400">400</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                      <div className="flex gap-2">
                        <Select 
                          className="flex-1"
                          value={newCourse.department} 
                          onValueChange={(value) => handleInputChange('department', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                            <SelectItem value="add_new" className="text-green-700 font-medium" onClick={() => {
                              setIsAddDepartmentDialogOpen(true);
                              return false; // Prevent closing the dropdown
                            }}>
                              + Add New Department
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button" 
                          size="icon" 
                          variant="outline" 
                          className="h-10 w-10"
                          onClick={() => setIsAddDepartmentDialogOpen(true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lecturer">Lecturer</Label>
                    <Input 
                      id="lecturer" 
                      placeholder="Dr. Kwame Boateng" 
                      value={newCourse.lecturer}
                      onChange={(e) => handleInputChange('lecturer', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Course description..." 
                      value={newCourse.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-green-700 hover:bg-green-800"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Adding...
                      </>
                    ) : (
                      "Add Course"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by course code, title, or lecturer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterSemester} onValueChange={setFilterSemester}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {semesters.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Courses ({filteredCourses.length})</CardTitle>
          <CardDescription>Manage course offerings and curriculum information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Credit Hours</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Lecturer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.code}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.creditHours}</TableCell>
                    <TableCell>{course.semester}</TableCell>
                    <TableCell>{course.lecturer}</TableCell>
                    <TableCell>{getStatusBadge(course.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewCourse(course)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Course Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedCourse?.code} - {selectedCourse?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-green-700">Course Information</h3>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">Course Code</Label>
                      <p className="text-sm text-gray-600">{selectedCourse.code}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Title</Label>
                      <p className="text-sm text-gray-600">{selectedCourse.title}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Credit Hours</Label>
                      <p className="text-sm text-gray-600">{selectedCourse.creditHours}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Department</Label>
                      <p className="text-sm text-gray-600">{selectedCourse.department}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-green-700">Schedule & Staff</h3>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">Semester</Label>
                      <p className="text-sm text-gray-600">{selectedCourse.semester}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Level</Label>
                      <p className="text-sm text-gray-600">{selectedCourse.level}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Lecturer</Label>
                      <p className="text-sm text-gray-600">{selectedCourse.lecturer}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">{getStatusBadge(selectedCourse.status)}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-green-700">Description</h3>
                <p className="text-sm text-gray-600">{selectedCourse.description}</p>
              </div>
              {selectedCourse.prerequisites.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-green-700">Prerequisites</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.prerequisites.map((prereq, index) => (
                      <Badge key={index} variant="outline">
                        {prereq}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button className="bg-green-700 hover:bg-green-800">
              <Edit className="mr-2 h-4 w-4" />
              Edit Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Department Dialog */}
      <Dialog open={isAddDepartmentDialogOpen} onOpenChange={setIsAddDepartmentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>
              Enter the name of the new department to add to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="departmentName">Department Name</Label>
              <Input 
                id="departmentName" 
                placeholder="e.g. Animal Science" 
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDepartmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-700 hover:bg-green-800" onClick={handleAddDepartment}>
              Add Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Courses Dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Reset All Courses
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete ALL courses and their program assignments from the database.
              This cannot be undone. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleResetCourses}
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Yes, Reset All Courses
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
