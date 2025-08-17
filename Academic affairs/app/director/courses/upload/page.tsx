"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Fetch programs from API
const getPrograms = async () => {
  try {
    const response = await fetch('/api/programs');
    if (!response.ok) {
      throw new Error('Failed to fetch programs');
    }
    const data = await response.json();
    return data.programs || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Fetch academic years from API
const getAcademicYears = async () => {
  try {
    const response = await fetch('/api/academic-years');
    if (!response.ok) {
      throw new Error('Failed to fetch academic years');
    }
    const data = await response.json();
    return data.academicYears || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default function UploadCoursesPage() {
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [courses, setCourses] = useState([{ code: '', name: '', credits: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      setPrograms(await getPrograms());
      setAcademicYears(await getAcademicYears());
    };
    fetchData();
  }, []);

  const handleCourseChange = (index, field, value) => {
    const updatedCourses = [...courses];
    updatedCourses[index][field] = value;
    setCourses(updatedCourses);
  };

  const addCourseRow = () => {
    setCourses([...courses, { code: '', name: '', credits: '' }]);
  };

  const removeCourseRow = (index) => {
    const updatedCourses = courses.filter((_, i) => i !== index);
    setCourses(updatedCourses);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!selectedProgram || !selectedYear || !selectedSemester || !selectedLevel) {
      toast({
        title: "Missing Information",
        description: "Please select a program, academic year, semester, and level.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const validCourses = courses.filter(c => c.code && c.name && c.credits);
    if (validCourses.length === 0) {
      toast({
        title: "No Courses to Save",
        description: "Please add at least one valid course.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // TODO: Implement API call to bulk upload endpoint
    try {
        const response = await fetch('/api/programs/bulk-add-courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                programId: selectedProgram,
                academicYear: selectedYear,
                semester: selectedSemester,
                level: selectedLevel,
                courses: validCourses,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to upload courses');
        }

        const result = await response.json();
        
        toast({
            title: "Courses Uploaded Successfully",
            description: `${result.createdCourses.length} courses have been added to the program.`,
        });

        // Reset form
        setCourses([{ code: '', name: '', credits: '' }]);

    } catch (error) {
        toast({
            title: "Error Uploading Courses",
            description: error.message,
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Courses</CardTitle>
          <CardDescription>
            Add multiple courses to a program for a specific academic period and level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Select onValueChange={setSelectedProgram}>
                <SelectTrigger><SelectValue placeholder="Select Program" /></SelectTrigger>
                <SelectContent>
                  {programs
                    .filter(p => p._id && p._id.trim() !== "")
                    .map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select onValueChange={setSelectedYear}>
                <SelectTrigger><SelectValue placeholder="Select Academic Year" /></SelectTrigger>
                <SelectContent>
                  {academicYears
                    .filter(y => y.name && y.name.trim() !== "")
                    .map(y => <SelectItem key={y._id} value={y.name}>{y.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select onValueChange={setSelectedSemester}>
                <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Semester 1</SelectItem>
                  <SelectItem value="2">Semester 2</SelectItem>
                  <SelectItem value="3">Trimester 1</SelectItem>
                  <SelectItem value="4">Trimester 2</SelectItem>
                  <SelectItem value="5">Trimester 3</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={setSelectedLevel}>
                <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">Level 100</SelectItem>
                  <SelectItem value="200">Level 200</SelectItem>
                  <SelectItem value="300">Level 300</SelectItem>
                  <SelectItem value="400">Level 400</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Course List</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            placeholder="e.g., COSC101"
                            value={course.code}
                            onChange={(e) => handleCourseChange(index, 'code', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="e.g., Introduction to Computer Science"
                            value={course.name}
                            onChange={(e) => handleCourseChange(index, 'name', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="e.g., 3"
                            value={course.credits}
                            onChange={(e) => handleCourseChange(index, 'credits', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeCourseRow(index)} disabled={courses.length <= 1}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={addCourseRow}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Row
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Courses'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 