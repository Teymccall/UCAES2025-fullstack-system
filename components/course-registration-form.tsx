"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, BookOpen, Calendar, Clock, AlertCircle, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useSystemConfig } from '@/components/system-config-provider';
import { useToast } from '@/hooks/use-toast';
import { getAvailableCoursesForStudent, registerStudentForCourses, canStudentRegisterForSemester } from '@/lib/academic-service';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

interface Course {
  id: string;
  code: string;
  title: string;
  name: string;
  description?: string;
  credits: number;
  level: number;
  semester: number;
  theory?: number;
  practical?: number;
  type?: 'core' | 'elective';
  specialization?: { name: string };
  electiveGroup?: string;
  prerequisites?: string[];
  status?: 'active' | 'inactive';
}

interface CourseRegistrationFormProps {
  onRegistrationComplete?: (registrationId: string) => void;
  currentAcademicYear?: string;
  currentSemester?: string | number;
}

export function CourseRegistrationForm({ 
  onRegistrationComplete, 
  currentAcademicYear: propAcademicYear, 
  currentSemester: propSemester 
}: CourseRegistrationFormProps) {
  const { user } = useAuth()
  const { 
    academicYear: systemAcademicYear, 
    semester: systemSemester,
    currentAcademicYear: centralizedAcademicYear,
    currentSemester: centralizedSemester,
    currentProgramType
  } = useSystemConfig()
  
  // Use props if provided, otherwise fall back to centralized system config
  const academicYear = propAcademicYear || centralizedAcademicYear || systemAcademicYear
  const semester = propSemester || centralizedSemester || systemSemester
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'pending' | 'processing' | 'submitted'>('idle')
  const [recentRegistration, setRecentRegistration] = useState<any>(null)

  // Registration eligibility states
  const [canRegister, setCanRegister] = useState<boolean>(true)
  const [registrationRestriction, setRegistrationRestriction] = useState<string>("")
  const [existingRegistration, setExistingRegistration] = useState<any>(null)

  // Enhanced filtering states
  const [searchTerm, setSearchTerm] = useState("")
  const [courseTypeFilter, setCourseTypeFilter] = useState<string>("all")
  const [specializationFilter, setSpecializationFilter] = useState<string>("all")
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>([])

  useEffect(() => {
    if (user && academicYear && semester) {
      checkRegistrationEligibility();
      loadAvailableCourses();
    }
  }, [user, academicYear, semester]);

  const checkRegistrationEligibility = async () => {
    if (!user?.uid && !user?.id) return;
    
    try {
      const studentId = user.id || user.uid;
      const eligibility = await canStudentRegisterForSemester(
        studentId,
        academicYear,
        typeof semester === 'string' ? parseInt(semester) : semester
      );
      
      setCanRegister(eligibility.canRegister);
      setRegistrationRestriction(eligibility.reason || "");
      setExistingRegistration(eligibility.existingRegistration);
      
      if (!eligibility.canRegister) {
        setError(eligibility.reason || "Registration not allowed");
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error checking registration eligibility:', err);
      setCanRegister(false);
      setRegistrationRestriction("Unable to verify registration eligibility");
    }
  };

  const loadAvailableCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.uid) {
        throw new Error("User not authenticated");
      }

      console.log('🔍 Loading available courses for student:', user.uid);
      console.log('Student data:', {
        uid: user.uid,
        id: user.id,
        programme: user.programme,
        programId: user.programId,
        currentLevel: user.currentLevel,
        name: user.name,
        registrationNumber: user.registrationNumber
      });
      console.log('System config - Year:', academicYear, 'Semester:', semester);

      // Get student's academic data to determine program and level
      let studentProgramId = user.programId || '';
      let studentLevel = user.currentLevel || 100;
      
      // Use the correct student ID - prefer user.id over user.uid for database lookups
      const studentId = user.id || user.uid;

      // If we don't have programId, try to get it from the student's program name
      if (!studentProgramId && user.programme) {
        console.log('No programId, attempting to resolve from program name:', user.programme);
        
        // Import the helper function dynamically to avoid circular dependencies
        const { getProgramIdFromName } = await import('@/lib/academic-service');
        studentProgramId = await getProgramIdFromName(user.programme) || '';
        console.log('Resolved program ID:', studentProgramId);
        
        // If still no program ID, try alternative matching
        if (!studentProgramId) {
          console.log('Still no program ID, trying alternative approaches...');
          
          // Check if the program name contains key terms
          const programLower = user.programme.toLowerCase();
          if (programLower.includes('agriculture') || programLower.includes('sustainable')) {
            // Try to find any agriculture-related program
            const { collection, getDocs } = await import('firebase/firestore');
            const programsRef = collection(db, "academic-programs");
            const allPrograms = await getDocs(programsRef);
            
            for (const doc of allPrograms.docs) {
              const data = doc.data();
              if (data.name && data.name.toLowerCase().includes('agriculture')) {
                studentProgramId = doc.id;
                console.log(`Found agriculture program: ${data.name} (ID: ${studentProgramId})`);
                break;
              }
            }
          }
        }
      }

      // Convert level text to number if needed
      if (typeof studentLevel === 'string') {
        const levelMatch = studentLevel.match(/\d+/);
        if (levelMatch) {
          studentLevel = parseInt(levelMatch[0]);
        } else {
          studentLevel = 100; // Default fallback
        }
      }

      // Convert semester to number if needed
      let semesterNumber = semester;
      if (typeof semester === 'string') {
        if (semester === "1" || semester === "2") {
          semesterNumber = parseInt(semester);
        } else if (semester === "First Semester" || semester === "First") {
          semesterNumber = 1;
        } else if (semester === "Second Semester" || semester === "Second") {
          semesterNumber = 2;
        } else {
          semesterNumber = 1; // Default fallback
        }
      }

      console.log('📋 Final parameters for course loading:');
      console.log('  Student ID:', studentId);
      console.log('  Program ID:', studentProgramId);
      console.log('  Level:', studentLevel);
      console.log('  Semester:', semesterNumber);
      console.log('  Academic Year:', academicYear);

      if (!studentProgramId) {
        throw new Error(`Unable to determine student's program. Your program "${user.programme}" could not be matched to any available academic program. Please contact support to update your program information.`);
      }

      // Enhanced course loading - try structured mapping first, then fallback to catalog
      let availableCourses = await getAvailableCoursesForStudent(
        studentId,
        studentProgramId,
        studentLevel,
        semesterNumber,
        academicYear
      );

      // If no courses found from structured mapping, try catalog-based approach
      if (availableCourses.length === 0) {
        console.log('No courses found from structured mapping, trying catalog-based approach...');
        availableCourses = await getCatalogBasedCourses(studentProgramId, studentLevel, semesterNumber);
      }

      // Get specializations for Level 400 students
      if (studentLevel === 400) {
        const specializations = Array.from(
          new Set(availableCourses.map(course => course.specialization?.name).filter(Boolean))
        );
        setAvailableSpecializations(specializations);
      }
      
      console.log(`✅ Loaded ${availableCourses.length} available courses`);
      setCourses(availableCourses);
      
      if (availableCourses.length === 0) {
        setError(`No courses available for registration. This could be because:
        • No courses are configured for Level ${studentLevel}, Semester ${semesterNumber}
        • You have already registered for all available courses
        • Your program "${user.programme}" may need course structure setup
        
        Please contact your academic advisor for assistance.`);
      }
    } catch (err) {
      console.error('Error loading available courses:', err);
      setError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced catalog-based course loading (similar to director's system)
  const getCatalogBasedCourses = async (programId: string, level: number, semester: number): Promise<Course[]> => {
    try {
      const coursesRef = collection(db, "academic-courses");
      const q = query(
        coursesRef,
        where("programId", "==", programId),
        where("level", "==", level),
        where("semester", "==", semester),
        where("status", "==", "active")
      );
      
      const snapshot = await getDocs(q);
      const catalogCourses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];

      console.log(`Found ${catalogCourses.length} courses from catalog`);
      return catalogCourses;
    } catch (error) {
      console.error('Error loading catalog courses:', error);
      return [];
    }
  };

  const handleCourseSelection = (courseId: string, checked: boolean) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    // Elective group validation (similar to director's system)
    if (course.type === 'elective') {
      const selectedElectiveGroup = Array.from(selectedCourses).find(selectedId => {
        const selectedCourse = courses.find(c => c.id === selectedId);
        return selectedCourse?.type === 'elective' && selectedCourse?.electiveGroup;
      });

      if (selectedElectiveGroup && course.electiveGroup && course.electiveGroup !== selectedElectiveGroup) {
        // Show error toast
        return;
      }
    }

    const newSelection = new Set(selectedCourses);
    if (checked) {
      newSelection.add(courseId);
    } else {
      newSelection.delete(courseId);
    }
    setSelectedCourses(newSelection);
  };

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchTerm || 
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = courseTypeFilter === "all" || course.type === courseTypeFilter;
    const matchesSpecialization = specializationFilter === "all" || 
      course.specialization?.name === specializationFilter;

    return matchesSearch && matchesType && matchesSpecialization;
  });

  // Group courses by type
  const coreCourses = filteredCourses.filter(c => c.type === 'core');
  const electiveCourses = filteredCourses.filter(c => c.type === 'elective');

  const getTotalCredits = () => {
    return Array.from(selectedCourses).reduce((total, courseId) => {
      const course = courses.find(c => c.id === courseId);
      return total + (course?.credits || 0);
    }, 0);
  };

  const handleSubmit = async () => {
    if (selectedCourses.size === 0) {
      setError("Please select at least one course");
      return;
    }

    try {
      setSubmitting(true);
      setRegistrationStatus('processing');
      setError(null);
      setSuccess(null);

      const selectedCourseObjects = courses.filter(course => selectedCourses.has(course.id));
      
      const studentId = user!.id || user!.uid;
      const result = await registerStudentForCourses(
        studentId,
        selectedCourseObjects,
        academicYear,
        semester,
        'student'
      );

      if (result.success && result.registrationId) {
        setSuccess(`Successfully registered for ${selectedCourses.size} courses!`);
        setSelectedCourses(new Set());
        setRegistrationStatus('submitted');
        
        // Create registration summary
        const newRegistration = {
          id: result.registrationId,
          academicYear,
          semester,
          courses: selectedCourseObjects.map(c => ({
            id: c.id,
            code: c.code,
            name: c.title,
            credits: c.credits
          })),
          totalCredits: getTotalCredits(),
          registrationDate: new Date().toISOString()
        };
        setRecentRegistration(newRegistration);
        
        // Reload courses to reflect changes
        await loadAvailableCourses();
        
        if (onRegistrationComplete) {
          onRegistrationComplete(result.registrationId);
        }
        
        // Reset filters
        setSearchTerm("");
        setCourseTypeFilter("all");
        setSpecializationFilter("all");
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err) {
      console.error('Error submitting registration:', err);
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading available courses...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Registration Not Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          {existingRegistration && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">Your Current Registration</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Academic Year:</strong> {existingRegistration.academicYear}</p>
                <p><strong>Semester:</strong> {existingRegistration.semester}</p>
                <p><strong>Status:</strong> 
                  <Badge variant={existingRegistration.status === 'approved' ? 'default' : 'secondary'} className="ml-2">
                    {existingRegistration.status}
                  </Badge>
                </p>
                <p><strong>Total Credits:</strong> {existingRegistration.totalCredits}</p>
                <p><strong>Courses:</strong> {existingRegistration.courses?.length || 0}</p>
              </div>
              
              {existingRegistration.status === 'pending' && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Your registration is pending approval. You will be able to register for the next semester once this registration is approved.
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Next Steps:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Wait for the next semester to register for new courses</li>
              <li>Contact Academic Affairs if you need to make changes to your current registration</li>
              <li>Check your registration history for previous semesters</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>{success}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Academic Period Display */}
      {academicYear && semester && (
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p><strong>Current Academic Period:</strong> {academicYear} - {semester}</p>
                {currentProgramType && (
                  <p className="text-sm text-muted-foreground">Program Type: {currentProgramType}</p>
                )}
              </div>
              <Badge variant="outline">
                Centralized Configuration
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Course Selection Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Available Courses for Registration
          </CardTitle>
          <CardDescription>
            Select courses for {academicYear} - Semester {semester}. 
            Minimum requirement: 18 credits per semester.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Registration Status Warning */}
          {!canRegister && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Registration Restricted:</strong> {registrationRestriction}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={courseTypeFilter} onValueChange={setCourseTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Course Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="core">Core Courses</SelectItem>
                <SelectItem value="elective">Elective Courses</SelectItem>
              </SelectContent>
            </Select>
            {availableSpecializations.length > 0 && (
              <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {availableSpecializations.map(spec => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="text-sm text-gray-600 flex items-center">
              <span>Total Credits: {getTotalCredits()}</span>
            </div>
          </div>

          {/* Course Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Courses ({filteredCourses.length})</TabsTrigger>
              <TabsTrigger value="core">Core ({coreCourses.length})</TabsTrigger>
              <TabsTrigger value="elective">Elective ({electiveCourses.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <CourseTable 
                courses={filteredCourses} 
                selectedCourses={selectedCourses}
                onCourseSelection={handleCourseSelection}
              />
            </TabsContent>

            <TabsContent value="core" className="mt-4">
              <CourseTable 
                courses={coreCourses} 
                selectedCourses={selectedCourses}
                onCourseSelection={handleCourseSelection}
              />
            </TabsContent>

            <TabsContent value="elective" className="mt-4">
              <CourseTable 
                courses={electiveCourses} 
                selectedCourses={selectedCourses}
                onCourseSelection={handleCourseSelection}
              />
            </TabsContent>
          </Tabs>

          {/* Registration Summary */}
          {selectedCourses.size > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">Selected Courses ({selectedCourses.size})</h3>
              <div className="space-y-1">
                {Array.from(selectedCourses).map(courseId => {
                  const course = courses.find(c => c.id === courseId);
                  return course ? (
                    <div key={courseId} className="flex justify-between text-sm">
                      <span>{course.code} - {course.title}</span>
                      <span>{course.credits} credits</span>
                    </div>
                  ) : null;
                })}
              </div>
              <div className="mt-2 pt-2 border-t border-blue-200">
                <div className="flex justify-between font-medium">
                  <span>Total Credits:</span>
                  <span>{getTotalCredits()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || selectedCourses.size === 0 || !canRegister}
              className="min-w-[150px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : !canRegister ? (
                "Registration Not Allowed"
              ) : (
                `Register ${selectedCourses.size} Course${selectedCourses.size !== 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced Course Table Component
function CourseTable({ 
  courses, 
  selectedCourses, 
  onCourseSelection 
}: { 
  courses: Course[]; 
  selectedCourses: Set<string>; 
  onCourseSelection: (courseId: string, checked: boolean) => void;
}) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No courses found matching the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Select</TableHead>
            <TableHead>Course Code</TableHead>
            <TableHead>Course Title</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Theory</TableHead>
            <TableHead>Practical</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Specialization</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell>
                <Checkbox
                  checked={selectedCourses.has(course.id)}
                  onCheckedChange={(checked) => 
                    onCourseSelection(course.id, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell className="font-medium">{course.code}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{course.title}</div>
                  {course.description && (
                    <div className="text-sm text-gray-500 mt-1">
                      {course.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{course.credits}</TableCell>
              <TableCell>{course.theory || 3}h</TableCell>
              <TableCell>{course.practical || 0}h</TableCell>
              <TableCell>
                <Badge variant={course.type === 'core' ? 'default' : 'secondary'}>
                  {course.type || 'core'}
                </Badge>
              </TableCell>
              <TableCell>
                {course.specialization?.name ? (
                  <Badge variant="outline">{course.specialization.name}</Badge>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}