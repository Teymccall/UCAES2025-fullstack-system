"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, BookOpen, Calendar, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useSystemConfig } from '@/components/system-config-provider';
import { useToast } from '@/hooks/use-toast';
import { getAvailableCoursesForStudent, registerStudentForCourses } from '@/lib/academic-service';

interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  description?: string;
  level: number;
  semester: number;
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
  const { academicYear: systemAcademicYear, semester: systemSemester } = useSystemConfig()
  
  // Use props if provided, otherwise fall back to system config
  const academicYear = propAcademicYear || systemAcademicYear
  const semester = propSemester || systemSemester
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'pending' | 'processing' | 'submitted'>('idle')
  const [recentRegistration, setRecentRegistration] = useState<any>(null)

  useEffect(() => {
    if (user && academicYear && semester) {
      loadAvailableCourses();
    }
  }, [user, academicYear, semester]);

  const loadAvailableCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.uid) {
        throw new Error("User not authenticated");
      }

      console.log('🔍 Loading available courses for student:', user.uid);
      console.log('Student data:', user);
      console.log('System config - Year:', academicYear, 'Semester:', semester);

      // Get student's academic data to determine program and level
      let studentProgramId = user.programId || '';
      let studentLevel = user.currentLevel || 100;

      // If we don't have programId, try to get it from the student's program name
      if (!studentProgramId && user.programme) {
        console.log('No programId, attempting to resolve from program name:', user.programme);
        
        // Import the helper function dynamically to avoid circular dependencies
        const { getProgramIdFromName } = await import('@/lib/academic-service');
        studentProgramId = await getProgramIdFromName(user.programme) || '';
        console.log('Resolved program ID:', studentProgramId);
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
      console.log('  Program ID:', studentProgramId);
      console.log('  Level:', studentLevel);
      console.log('  Semester:', semesterNumber);
      console.log('  Academic Year:', academicYear);

      if (!studentProgramId) {
        throw new Error("Unable to determine student's program. Please contact support.");
      }

      const availableCourses = await getAvailableCoursesForStudent(
        user.uid,
        studentProgramId,
        studentLevel,
        semesterNumber,
        academicYear
      );
      
      console.log(`✅ Loaded ${availableCourses.length} available courses`);
      setCourses(availableCourses);
      
      if (availableCourses.length === 0) {
        setError("No courses available for registration at this time. Please check back later or contact your academic advisor.");
      }
    } catch (err) {
      console.error('Error loading available courses:', err);
      setError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelection = (courseId: string, checked: boolean) => {
    const newSelection = new Set(selectedCourses);
    if (checked) {
      newSelection.add(courseId);
    } else {
      newSelection.delete(courseId);
    }
    setSelectedCourses(newSelection);
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
      
      const result = await registerStudentForCourses(
        user!.uid,
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
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setRegistrationStatus('idle');
          setRecentRegistration(null);
        }, 3000);
      } else {
        setError(result.error || "Registration failed");
        setRegistrationStatus('idle');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setRegistrationStatus('idle');
    } finally {
      setSubmitting(false);
    }
  };

  const getTotalCredits = () => {
    return courses
      .filter(course => selectedCourses.has(course.id))
      .reduce((total, course) => total + (course.credits || 0), 0);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading available courses...</span>
        </CardContent>
      </Card>
    );
  }

  if (error && !courses.length) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Registration</CardTitle>
          <CardDescription>
            No courses available for registration at this time.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Registration Status Display */}
      {registrationStatus === 'processing' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Processing Registration...</p>
                <p className="text-sm text-blue-700">Please wait while we register your courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {registrationStatus === 'submitted' && recentRegistration && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Registration Submitted!</p>
                <p className="text-sm text-green-700">
                  {recentRegistration.courses.length} courses • {recentRegistration.totalCredits} credits
                </p>
              </div>
            </div>
            <div className="mt-3 text-sm text-green-600">
              <p>Status: <span className="font-medium">Pending Review</span></p>
              <p>Your registration will be reviewed by Academic Affairs</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Registration
          </CardTitle>
          <CardDescription>
            Select courses for {academicYear} - Semester {semester}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox
                  id={course.id}
                  checked={selectedCourses.has(course.id)}
                  onCheckedChange={(checked) => handleCourseSelection(course.id, checked as boolean)}
                  disabled={submitting || registrationStatus !== 'idle'}
                />
                <div className="flex-1 space-y-1">
                  <label htmlFor={course.id} className="font-medium cursor-pointer">
                    {course.code} - {course.title}
                  </label>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.credits} credits
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Level {course.level}
                    </Badge>
                  </div>
                  {course.description && (
                    <p className="text-sm text-gray-500">{course.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedCourses.size > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  Selected: {selectedCourses.size} course{selectedCourses.size > 1 ? 's' : ''}
                </span>
                <span className="text-sm text-gray-600">
                  Total credits: {getTotalCredits()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={selectedCourses.size === 0 || submitting || registrationStatus !== 'idle'}
          className="min-w-[200px]"
        >
          {submitting || registrationStatus === 'processing' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            `Register ${selectedCourses.size} Course${selectedCourses.size > 1 ? 's' : ''}`
          )}
        </Button>
      </div>
    </div>
  );
}