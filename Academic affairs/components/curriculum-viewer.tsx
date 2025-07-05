// Curriculum viewer component
import React, { useState } from 'react';
import { 
  useAcademicPrograms, 
  useProgramCourses, 
  useProgramSpecializations,
  useCurriculumStructure
} from '../hooks/use-curriculum-data';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from './ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from './ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

export function CurriculumViewer() {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('1');
  const [selectedSemester, setSelectedSemester] = useState<string>('1');
  
  const { programs, loading: loadingPrograms } = useAcademicPrograms();
  const { courses, loading: loadingCourses } = useProgramCourses(selectedProgramId);
  const { specializations, loading: loadingSpecializations } = useProgramSpecializations(selectedProgramId);
  
  // Find the selected program code
  const selectedProgram = programs.find(p => p.id === selectedProgramId);
  const programCode = selectedProgram?.code || null;
  
  // Get curriculum structure for the selected program
  const { structure, loading: loadingStructure } = useCurriculumStructure(programCode);
  
  // Filter courses by year and semester
  const yearSemesterCourses = courses.filter(
    course => course.year === parseInt(selectedYear) && course.semester === parseInt(selectedSemester)
  );
  
  // Get list of distinct years from courses
  const years = Array.from(new Set(courses.map(course => course.year)))
    .filter((year): year is number => year !== undefined && year !== null)
    .sort();
  
  // Get list of distinct semesters for the selected year
  const semesters = Array.from(
    new Set(courses.filter(course => course.year === parseInt(selectedYear)).map(course => course.semester))
  ).filter(Boolean).sort();
  
  // Handle program selection
  const handleProgramChange = (value: string) => {
    setSelectedProgramId(value);
    setSelectedYear('1');  // Reset to first year
    setSelectedSemester('1');  // Reset to first semester
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Curriculum Viewer</CardTitle>
          <CardDescription>
            View program curricula, courses, and specializations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Program selector */}
            <div className="space-y-2">
              <label htmlFor="program-select" className="text-sm font-medium">
                Select Program
              </label>
              {loadingPrograms ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select onValueChange={handleProgramChange} value={selectedProgramId || undefined}>
                  <SelectTrigger id="program-select">
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {/* Show program details if a program is selected */}
            {selectedProgram && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedProgram.name}</CardTitle>
                  <CardDescription>
                    {selectedProgram.department}, {selectedProgram.faculty}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Program Code:</strong> {selectedProgram.code}</p>
                    <p><strong>Description:</strong> {selectedProgram.description}</p>
                    <p><strong>Duration:</strong> {selectedProgram.durationYears} years</p>
                    <p><strong>Total Credits:</strong> {selectedProgram.credits}</p>
                    <p><strong>Entry Requirements:</strong> {selectedProgram.entryRequirements}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Year and semester selector */}
            {selectedProgramId && years.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="year-select" className="text-sm font-medium">
                    Year
                  </label>
                  <Select 
                    onValueChange={(value) => setSelectedYear(value)} 
                    value={selectedYear}
                  >
                    <SelectTrigger id="year-select">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={`year-${year}`} value={year.toString()}>
                          Year {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="semester-select" className="text-sm font-medium">
                    Semester
                  </label>
                  <Select 
                    onValueChange={(value) => setSelectedSemester(value)} 
                    value={selectedSemester}
                  >
                    <SelectTrigger id="semester-select">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((semester) => (
                        <SelectItem key={`semester-${semester}`} value={semester.toString()}>
                          Semester {semester}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {/* Show courses for the selected year and semester */}
            {selectedProgramId && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Courses for Year {selectedYear}, Semester {selectedSemester}
                </h3>
                
                {loadingCourses ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : yearSemesterCourses.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Theory/Practice</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {yearSemesterCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>{course.code}</TableCell>
                          <TableCell>{course.title}</TableCell>
                          <TableCell>{course.credits}</TableCell>
                          <TableCell>
                            {course.isCore ? (
                              <Badge variant="default">Core</Badge>
                            ) : (
                              <Badge variant="outline">Elective</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {course.theoryHours}/{course.practicalHours}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">
                    No courses found for the selected year and semester.
                  </p>
                )}
              </div>
            )}
            
            {/* Show specializations if available */}
            {selectedProgramId && specializations.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Specializations</h3>
                
                {loadingSpecializations ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {specializations.map((specialization) => (
                      <Card key={specialization.id}>
                        <CardHeader>
                          <CardTitle>{specialization.name}</CardTitle>
                          <CardDescription>
                            Available from Year {specialization.year}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>{specialization.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Show curriculum structure */}
            {selectedProgramId && structure && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Curriculum Structure</h3>
                
                {loadingStructure ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <div className="space-y-4">
                    {structure.structure.map((sem, index) => (
                      <Card key={`structure-${index}`}>
                        <CardHeader>
                          <CardTitle>
                            Year {sem.year}, Semester {sem.semester}
                            {sem.specialization && (
                              <Badge className="ml-2">{sem.specialization}</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            Total Credits: {sem.totalCredits}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p><strong>Courses:</strong> {sem.courses.join(', ')}</p>
                            {sem.coreCourses && (
                              <p><strong>Core:</strong> {sem.coreCourses.join(', ')}</p>
                            )}
                            {sem.electiveGroups && Object.entries(sem.electiveGroups).map(([group, courses]) => (
                              <p key={group}><strong>{group}:</strong> {courses.join(', ')}</p>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CurriculumViewer;