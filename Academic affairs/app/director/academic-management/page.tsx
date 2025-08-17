"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateSystemAcademicPeriod, getSystemAcademicPeriod } from "@/lib/system-config"
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
import { useAcademic, type AcademicSemester, type AcademicYear } from "@/components/academic-context"
import { Plus, RotateCcw, GraduationCap, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AcademicYearsService } from "@/lib/firebase-service"
import { SemestersService } from "@/lib/firebase-service"
import { auth } from "@/lib/firebase"

// Helper function to safely format dates
const formatDate = (dateValue: any): string => {
  if (!dateValue) return "Not set";
  
  try {
    // Handle various date formats
    let date;
    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'object' && dateValue.toDate) {
      // Handle Firestore Timestamp
      date = dateValue.toDate();
    } else {
      date = new Date(dateValue);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    
    // Format as DD-MM-YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

export default function AcademicManagement() {
  const { 
    academicYears, 
    currentSemester, 
    currentRegularSemester, 
    currentWeekendSemester,
    addAcademicYear, 
    addSemester, 
    setCurrentSemester, 
    rolloverToNewSemester, 
    refreshAcademicData 
  } = useAcademic()
  const { toast } = useToast()

  const [isAddYearOpen, setIsAddYearOpen] = useState(false)
  const [isAddSemesterOpen, setIsAddSemesterOpen] = useState(false)
  const [isRolloverOpen, setIsRolloverOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  
  // Add state for editing and deleting semesters
  const [editSemesterData, setEditSemesterData] = useState<AcademicSemester | null>(null)
  const [isEditSemesterOpen, setIsEditSemesterOpen] = useState(false)
  const [semesterToDelete, setSemesterToDelete] = useState<string | null>(null)
  const [isDeleteSemesterConfirmOpen, setIsDeleteSemesterConfirmOpen] = useState(false)
  const [previousActiveSemester, setPreviousActiveSemester] = useState<{id: string, programType: "Regular" | "Weekend"} | null>(null)

  const [yearForm, setYearForm] = useState({
    year: "",
    startDate: "",
    endDate: "",
    status: "upcoming" as const,
  })

  const [semesterForm, setSemesterForm] = useState({
    name: "",
    yearId: "",
    programType: "Regular" as "Regular" | "Weekend",
    startDate: "",
    endDate: "",
    registrationStart: "",
    registrationEnd: "",
    status: "upcoming" as const,
  })

  const [rolloverForm, setRolloverForm] = useState({
    name: "",
    yearId: "",
    programType: "Regular" as "Regular" | "Weekend",
    startDate: "",
    endDate: "",
    registrationStart: "",
    registrationEnd: "",
  })

  const [editYearData, setEditYearData] = useState<{
    id: string;
    year: string;
    startDate: string;
    endDate: string;
    status: "active" | "completed" | "upcoming";
  } | null>(null);

  const [isEditYearOpen, setIsEditYearOpen] = useState(false);

  // Add a state to track the previous active academic year
  const [previousActiveYear, setPreviousActiveYear] = useState<string | null>(null);

  // Add state for delete confirmation
  const [yearToDelete, setYearToDelete] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleAddYear = () => {
    if (!yearForm.year || !yearForm.startDate || !yearForm.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Create proper Date objects
    const startDate = new Date(yearForm.startDate);
    const endDate = new Date(yearForm.endDate);

    addAcademicYear({
      year: yearForm.year,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: yearForm.status,
      semesters: [],
    })

    setYearForm({
      year: "",
      startDate: "",
      endDate: "",
      status: "upcoming",
    })
    setIsAddYearOpen(false)

    toast({
      title: "Success",
      description: "Academic year added successfully",
    })
  }

  const handleAddSemester = () => {
    if (!semesterForm.name || !semesterForm.yearId || !semesterForm.startDate || !semesterForm.endDate || !semesterForm.programType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Verify the selected academic year is active
    const selectedYear = academicYears.find(y => y.id === semesterForm.yearId);
    if (!selectedYear || selectedYear.status !== "active") {
      toast({
        title: "Invalid Academic Year",
        description: "Semesters can only be added to the active academic year",
        variant: "destructive",
      })
      return
    }

    addSemester({
      name: semesterForm.name,
      yearId: semesterForm.yearId,
      programType: semesterForm.programType,
      startDate: semesterForm.startDate,
      endDate: semesterForm.endDate,
      registrationStart: semesterForm.registrationStart,
      registrationEnd: semesterForm.registrationEnd,
      status: semesterForm.status,
      isCurrentSemester: false,
    })

    setSemesterForm({
      name: "",
      yearId: "",
      programType: "Regular",
      startDate: "",
      endDate: "",
      registrationStart: "",
      registrationEnd: "",
      status: "upcoming",
    })
    setIsAddSemesterOpen(false)

    toast({
      title: "Success",
      description: "Semester added successfully",
    })
  }

  // First, fix the handleRollover function to handle programType and be async
  const handleRollover = async () => {
    if (!rolloverForm.name || !rolloverForm.yearId || !rolloverForm.startDate || !rolloverForm.endDate || !rolloverForm.programType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsRolloverOpen(false)
    setIsLoading(true)

    try {
      // Execute rollover with the programType
      await rolloverToNewSemester({
        name: rolloverForm.name,
        yearId: rolloverForm.yearId,
        programType: rolloverForm.programType, // Make sure programType is included
        startDate: rolloverForm.startDate,
        endDate: rolloverForm.endDate,
        registrationStart: rolloverForm.registrationStart || "",
        registrationEnd: rolloverForm.registrationEnd || "",
        status: "active",
        isCurrentSemester: true,
      });

      // Refresh academic data after rollover
      await refreshAcademicData();

      toast({
        title: "Rollover Complete",
        description: "New semester has been activated and previous data archived",
      });
    } catch (error) {
      console.error("Error during rollover:", error);
      toast({
        title: "Rollover Failed",
        description: "An error occurred while rolling over to the new semester",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleEditYear = (year: AcademicYear) => {
    // Format the date strings properly for input elements
    let startDate = "";
    let endDate = "";

    try {
      // Handle different date formats that might exist
      if (typeof year.startDate === 'string') {
        // Try to parse the string into a Date object
        startDate = new Date(year.startDate).toISOString().split('T')[0];
        endDate = new Date(year.endDate).toISOString().split('T')[0];
      } else if (year.startDate instanceof Date) {
        startDate = year.startDate.toISOString().split('T')[0];
        endDate = year.endDate.toISOString().split('T')[0];
      }
    } catch (e) {
      console.error("Error formatting dates:", e);
      // Fallback to string version if parsing fails
      startDate = String(year.startDate).split('T')[0];
      endDate = String(year.endDate).split('T')[0];
    }

    setEditYearData({
      id: year.id,
      year: year.year,
      startDate: startDate,
      endDate: endDate,
      status: year.status,
    });
    
    setIsEditYearOpen(true);
  };

  // Add a function to handle undoing the active academic year
  const handleUndoActiveYear = async () => {
    try {
      // Find the currently active academic year
      const activeYear = academicYears.find(y => y.status === "active");
      if (!activeYear) {
        toast({
          title: "Error",
          description: "No active academic year found",
          variant: "destructive",
        });
        return;
      }

      // Find semesters of the active year that are active
      const activeSemesters = allSemesters.filter(
        s => s.yearId === activeYear.id && s.isCurrentSemester
      );

      // Set the current academic year to inactive
      await AcademicYearsService.update(activeYear.id, {
        status: "inactive"
      });

      // Set all active semesters to inactive
      for (const semester of activeSemesters) {
        await SemestersService.update(semester.id, {
          status: "inactive"
        });
      }

      // Set the previous active year to active if available
      if (previousActiveYear) {
        const prevYearData = academicYears.find(y => y.id === previousActiveYear);
        if (prevYearData) {
          await AcademicYearsService.update(previousActiveYear, {
            status: "active"
          });
        }
      }

      toast({
        title: "Success",
        description: "Active academic year setting undone successfully",
      });

      // Refresh the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error undoing active academic year:", error);
      toast({
        title: "Error",
        description: "Failed to undo active academic year",
        variant: "destructive",
      });
    }
  };

  // Update the code that sets an academic year as active to track the previous active year
  const saveEditedYear = async () => {
    if (!editYearData) return;
    
    try {
      // If we're setting a year as active, store the previous active year
      if (editYearData.status === "active") {
        const currentActiveYear = academicYears.find(y => y.status === "active");
        if (currentActiveYear && currentActiveYear.id !== editYearData.id) {
          setPreviousActiveYear(currentActiveYear.id);
        }
      }

      // Create proper Date objects from the date strings
      const startDate = new Date(editYearData.startDate);
      const endDate = new Date(editYearData.endDate);

      await AcademicYearsService.update(editYearData.id, {
        year: editYearData.year,
        startDate: startDate,
        endDate: endDate,
        status: editYearData.status
      });
      
      // If setting as active, deactivate others first
      if (editYearData.status === "active") {
        const yearsToUpdate = academicYears
          .filter(y => y.id !== editYearData.id && y.status === "active")
          .map(y => y.id);
          
        for (const yearId of yearsToUpdate) {
          await AcademicYearsService.update(yearId, { status: "inactive" });
        }
      }
      
      // Refresh the academic context to ensure changes propagate system-wide
      await refreshAcademicData();
      
      // If setting as active, update system config
      if (editYearData.status === "active") {
        // Find active semester for this year if any
        const yearSemesters = academicYears
          .find(y => y.id === editYearData.id)?.semesters || [];
        
        // Find active regular semester
        const activeSemester = yearSemesters.find(
          s => s.status === "active" && s.programType === "Regular"
        );
        
        // Use the year field or name field as a fallback
        const academicYearString = editYearData.year || editYearData.name || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;
        
        // Update system-wide config
        await updateSystemAcademicPeriod(
          editYearData.id,
          academicYearString,
          activeSemester?.id || null,
          activeSemester?.name || null,
          auth.currentUser?.uid || "unknown"
        );
        
        toast({
          title: "Success",
          description: "Academic year updated successfully and set as system-wide active year",
        });
      } else {
        toast({
          title: "Success",
          description: "Academic year updated successfully",
        });
      }
      
      setIsEditYearOpen(false);
      setEditYearData(null);
    } catch (error) {
      console.error("Error updating academic year:", error);
      toast({
        title: "Error",
        description: "Failed to update academic year",
        variant: "destructive",
      });
    }
  };

  // Add a function to set a semester as current
  const handleSetSemesterAsCurrent = async (semesterId: string, programType: "Regular" | "Weekend") => {
    try {
      // Find the semester
      const semesterToUpdate = allSemesters.find(s => s.id === semesterId);
      if (!semesterToUpdate) {
        toast({
          title: "Error",
          description: "Semester not found",
          variant: "destructive",
        });
        return;
      }
      
      // Find the academic year of this semester
      const academicYear = academicYears.find(y => y.id === semesterToUpdate.yearId);
      if (!academicYear) {
        toast({
          title: "Error",
          description: "Academic year not found",
          variant: "destructive",
        });
        return;
      }

      // Check if the semester belongs to the active academic year
      const activeYear = academicYears.find(y => y.status === "active");
      if (!activeYear) {
        toast({
          title: "Error",
          description: "No active academic year found. Please set an academic year as active first.",
          variant: "destructive",
        });
        return;
      }

      if (academicYear.id !== activeYear.id) {
        toast({
          title: "Invalid Selection",
          description: `This semester belongs to ${academicYear.year} but the active academic year is ${activeYear.year}. Only semesters from the active academic year can be set as current.`,
          variant: "destructive",
        });
        return;
      }
      
      // Call the context function with proper programType
      await setCurrentSemester(semesterId, programType);
      
      // If this is a Regular semester, update the system config
      if (programType === "Regular") {
        await updateSystemAcademicPeriod(
          activeYear.id,
          activeYear.year || activeYear.name || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
          semesterId,
          semesterToUpdate.name,
          auth.currentUser?.uid || "unknown"
        );
        
        toast({
          title: "Success",
          description: `${programType} semester set as current successfully and updated system-wide`,
        });
      } else {
        toast({
          title: "Success",
          description: `${programType} semester/trimester set as current successfully`,
        });
      }
    } catch (error) {
      console.error("Error setting semester as current:", error);
      toast({
        title: "Error",
        description: "Failed to set semester as current",
        variant: "destructive",
      });
    }
  };

  // Add function to handle deleting an academic year
  const handleDeleteYear = async (yearId: string) => {
    // Open confirmation dialog
    setYearToDelete(yearId);
    setIsDeleteConfirmOpen(true);
  };

  // Function to confirm and execute deletion
  const confirmDeleteYear = async () => {
    if (!yearToDelete) return;
    
    try {
      const yearToDeleteData = academicYears.find(y => y.id === yearToDelete);
      
      // Don't allow deletion of active years
      if (yearToDeleteData?.status === "active") {
        toast({
          title: "Cannot Delete Active Year",
          description: "Please deactivate the academic year before deleting.",
          variant: "destructive",
        });
        setIsDeleteConfirmOpen(false);
        setYearToDelete(null);
        return;
      }
      
      // Find all semesters associated with this year
      const yearSemesters = allSemesters.filter(s => s.yearId === yearToDelete);
      
      // Delete all associated semesters first
      for (const semester of yearSemesters) {
        await SemestersService.delete(semester.id);
      }
      
      // Delete the academic year
      await AcademicYearsService.delete(yearToDelete);
      
      toast({
        title: "Success",
        description: `Academic year deleted successfully (and ${yearSemesters.length} associated semesters)`,
      });
      
      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error("Error deleting academic year:", error);
      toast({
        title: "Error",
        description: "Failed to delete academic year",
        variant: "destructive",
      });
    } finally {
      setIsDeleteConfirmOpen(false);
      setYearToDelete(null);
    }
  };

  // Get all semesters across all years
  const allSemesters: AcademicSemester[] = []
  academicYears.forEach((year) => {
    year.semesters.forEach((semester) => {
      allSemesters.push(semester)
    })
  })

  // Debug duplicate IDs (development only)
  if (process.env.NODE_ENV === 'development') {
    const semesterIds = allSemesters.map(s => s.id)
    const duplicateIds = semesterIds.filter((id, index) => semesterIds.indexOf(id) !== index)
    if (duplicateIds.length > 0) {
      console.warn('🚨 Duplicate semester IDs found:', duplicateIds)
      console.warn('📊 All semester data:', allSemesters.map(s => ({ id: s.id, name: s.name, yearId: s.yearId, programType: s.programType })))
    }
  }

  // Filter semesters by program type
  const regularSemesters = allSemesters.filter(semester => semester.programType === "Regular")
  const weekendSemesters = allSemesters.filter(semester => semester.programType === "Weekend")

  // Handle edit semester
  const handleEditSemester = (semester: AcademicSemester) => {
    setEditSemesterData({
      ...semester,
      startDate: new Date(semester.startDate).toISOString().substring(0, 10),
      endDate: new Date(semester.endDate).toISOString().substring(0, 10),
    });
    
    setIsEditSemesterOpen(true);
  };

  // Save edited semester
  const saveEditedSemester = async () => {
    if (!editSemesterData) return;
    
    try {
      // Create proper Date objects from the date strings
      const startDate = new Date(editSemesterData.startDate);
      const endDate = new Date(editSemesterData.endDate);

      await SemestersService.update(editSemesterData.id, {
        name: editSemesterData.name,
        startDate: startDate,
        endDate: endDate,
        status: editSemesterData.status
      });
      
      // If setting as active, update the current semester
      if (editSemesterData.status === "active") {
        const currentSemesters = allSemesters
          .filter(s => s.programType === editSemesterData.programType && s.status === "active" && s.id !== editSemesterData.id)
          .map(s => s.id);
          
        // Store the previous active semester for undo functionality
        if (currentSemesters.length > 0) {
          setPreviousActiveSemester({
            id: currentSemesters[0],
            programType: editSemesterData.programType
          });
        }
        
        // If making semester active, call setCurrentSemester
        await setCurrentSemester(editSemesterData.id, editSemesterData.programType);
        
        // If it's a Regular semester, update system config
        if (editSemesterData.programType === "Regular") {
          const activeYear = academicYears.find(y => y.status === "active");
          
          if (activeYear) {
            await updateSystemAcademicPeriod(
              activeYear.id,
              activeYear.year || activeYear.name || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
              editSemesterData.id,
              editSemesterData.name,
              auth.currentUser?.uid || "unknown"
            );
          }
        }
      }
      
      // Refresh the academic context to ensure changes propagate
      await refreshAcademicData();
      
      toast({
        title: "Success",
        description: "Semester updated successfully",
      });
      
      setIsEditSemesterOpen(false);
      setEditSemesterData(null);
    } catch (error) {
      console.error("Error updating semester:", error);
      toast({
        title: "Error",
        description: "Failed to update semester",
        variant: "destructive",
      });
    }
  };

  // Handle undo active semester
  const handleUndoActiveSemester = async (programType: "Regular" | "Weekend") => {
    try {
      const currentSemester = programType === "Regular" ? currentRegularSemester : currentWeekendSemester;
      
      if (!currentSemester) {
        toast({
          title: "Error",
          description: `No active ${programType.toLowerCase()} semester to undo`,
          variant: "destructive",
        });
        return;
      }

      // Mark active semester as inactive
      await SemestersService.update(currentSemester.id, {
        status: "inactive"
      });
      
      // If it was a Regular semester, update system config
      if (programType === "Regular") {
        const activeYear = academicYears.find(y => y.status === "active");
        if (activeYear) {
          await updateSystemAcademicPeriod(
            activeYear.id,
            activeYear.year || activeYear.name || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
            null,
            null,
            auth.currentUser?.uid || "unknown"
          );
        }
      }
      
      // Refresh academic data
      await refreshAcademicData();

      toast({
        title: "Success",
        description: `${programType} semester/trimester deactivated successfully`,
      });
    } catch (error) {
      console.error(`Error undoing active ${programType.toLowerCase()} semester:`, error);
      toast({
        title: "Error",
        description: `Failed to deactivate ${programType.toLowerCase()} semester/trimester`,
        variant: "destructive",
      });
    }
  };

  // Handle delete semester
  const handleDeleteSemester = async (semesterId: string) => {
    // Open confirmation dialog
    setSemesterToDelete(semesterId);
    setIsDeleteSemesterConfirmOpen(true);
  };

  // Confirm delete semester
  const confirmDeleteSemester = async () => {
    if (!semesterToDelete) return;
    
    try {
      const semesterToDeleteData = allSemesters.find(s => s.id === semesterToDelete);
      
      // Don't allow deletion of active semesters
      if (semesterToDeleteData?.status === "active") {
        toast({
          title: "Cannot Delete Active Semester",
          description: "Please deactivate the semester before deleting.",
          variant: "destructive",
        });
        setIsDeleteSemesterConfirmOpen(false);
        setSemesterToDelete(null);
        return;
      }
      
      // Delete the semester
      await SemestersService.delete(semesterToDelete);
      
      toast({
        title: "Success",
        description: "Semester deleted successfully",
      });
      
      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error("Error deleting semester:", error);
      toast({
        title: "Error",
        description: "Failed to delete semester",
        variant: "destructive",
      });
    } finally {
      setIsDeleteSemesterConfirmOpen(false);
      setSemesterToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Academic Management</h1>
        <p className="text-muted-foreground">Manage academic years, semesters, and rollover processes</p>
      </div>

      {/* Current Academic Status */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Current Academic Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Regular Program Current Semester */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="mb-3 font-semibold">Regular Program</h3>
            {currentRegularSemester ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Semester</Label>
                  <p className="text-lg font-semibold">{currentRegularSemester.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Start Date</Label>
                  <p>{new Date(currentRegularSemester.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">End Date</Label>
                  <p>{new Date(currentRegularSemester.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant="default">{currentRegularSemester.status}</Badge>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No active semester for Regular Program</p>
            )}
          </div>
          
          {/* Weekend Program Current Semester */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="mb-3 font-semibold">Weekend Program</h3>
            {currentWeekendSemester ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Trimester</Label>
                  <p className="text-lg font-semibold">{currentWeekendSemester.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Start Date</Label>
                  <p>{new Date(currentWeekendSemester.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">End Date</Label>
                  <p>{new Date(currentWeekendSemester.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant="default">{currentWeekendSemester.status}</Badge>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No active trimester for Weekend Program</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="years" className="space-y-4">
        <TabsList>
          <TabsTrigger value="years">Academic Years</TabsTrigger>
          <TabsTrigger value="semesters">Regular Semesters</TabsTrigger>
          <TabsTrigger value="trimesters">Weekend Trimesters</TabsTrigger>
          <TabsTrigger value="rollover">Semester Rollover</TabsTrigger>
        </TabsList>

        {/* Academic Years Tab */}
        <TabsContent value="years" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Academic Years</CardTitle>
                <Dialog open={isAddYearOpen} onOpenChange={setIsAddYearOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Academic Year
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Academic Year</DialogTitle>
                      <DialogDescription>Create a new academic year in the system</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="year">Academic Year *</Label>
                        <Input
                          id="year"
                          value={yearForm.year}
                          onChange={(e) => setYearForm({ ...yearForm, year: e.target.value })}
                          placeholder="2024-2025"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start-date">Start Date *</Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={yearForm.startDate}
                            onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-date">End Date *</Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={yearForm.endDate}
                            onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={yearForm.status}
                          onValueChange={(value: any) => setYearForm({ ...yearForm, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddYearOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddYear}>Add Year</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {academicYears.map((year) => (
                    <TableRow key={year.id}>
                      <TableCell className="font-medium">{year.year}</TableCell>
                      <TableCell>{formatDate(year.startDate)}</TableCell>
                      <TableCell>{formatDate(year.endDate)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            year.status === "active" ? "default" : year.status === "completed" ? "secondary" : "outline"
                          }
                        >
                          {year.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditYear(year)}
                          >
                            Edit
                          </Button>
                          {year.status === "active" && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-red-500 text-red-500 hover:bg-red-50"
                              onClick={handleUndoActiveYear}
                            >
                              Undo
                            </Button>
                          )}
                          {year.status !== "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-500 hover:bg-red-50"
                              onClick={() => handleDeleteYear(year.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regular Semesters Tab */}
        <TabsContent value="semesters" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Regular Program Semesters</CardTitle>
                <Dialog open={isAddSemesterOpen && semesterForm.programType === "Regular"} onOpenChange={(open) => {
                  setIsAddSemesterOpen(open);
                  if (open) {
                    // Find the active academic year
                    const activeYear = academicYears.find(y => y.status === "active");
                    setSemesterForm(prev => ({
                      ...prev, 
                      programType: "Regular",
                      yearId: activeYear ? activeYear.id : ""
                    }));
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Semester
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Semester</DialogTitle>
                      <DialogDescription>Add a new semester for Regular Program</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="year-id">Academic Year *</Label>
                        <Select 
                          value={semesterForm.yearId} 
                          onValueChange={(value) => setSemesterForm({...semesterForm, yearId: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select academic year" />
                          </SelectTrigger>
                          <SelectContent>
                            {academicYears
                              .filter(y => y.status === "active")
                              .map(year => (
                                <SelectItem key={year.id} value={year.id}>{year.year}</SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="name">Semester Name *</Label>
                        <Select 
                          value={semesterForm.name} 
                          onValueChange={(value) => setSemesterForm({...semesterForm, name: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="First Semester">First Semester</SelectItem>
                            <SelectItem value="Second Semester">Second Semester</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start-date">Start Date *</Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={semesterForm.startDate}
                            onChange={(e) => setSemesterForm({ ...semesterForm, startDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-date">End Date *</Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={semesterForm.endDate}
                            onChange={(e) => setSemesterForm({ ...semesterForm, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={semesterForm.status}
                          onValueChange={(value: any) => setSemesterForm({ ...semesterForm, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddSemesterOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddSemester}>Add Semester</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regularSemesters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No semesters found</TableCell>
                    </TableRow>
                  ) : (
                    regularSemesters.map((semester, index) => {
                      const year = academicYears.find((y) => y.id === semester.yearId)
                      return (
                        <TableRow key={`regular-${semester.id}-${index}`}>
                          <TableCell className="font-medium">{semester.name}</TableCell>
                          <TableCell>{year?.year || "Unknown Year"}</TableCell>
                          <TableCell>{new Date(semester.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(semester.endDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={semester.status === "active" ? "default" : "outline"}>
                              {semester.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditSemester(semester)}
                              >
                                Edit
                              </Button>
                              
                              {semester.status !== "active" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSetSemesterAsCurrent(semester.id, "Regular")}
                                >
                                  Set as Current
                                </Button>
                              )}
                              
                              {semester.status === "active" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500 text-red-500 hover:bg-red-50"
                                  onClick={() => handleUndoActiveSemester("Regular")}
                                >
                                  Undo
                                </Button>
                              )}
                              
                              {semester.status !== "active" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500 text-red-500 hover:bg-red-50"
                                  onClick={() => handleDeleteSemester(semester.id)}
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekend Trimesters Tab */}
        <TabsContent value="trimesters" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Weekend Program Trimesters</CardTitle>
                <Dialog open={isAddSemesterOpen && semesterForm.programType === "Weekend"} onOpenChange={(open) => {
                  setIsAddSemesterOpen(open);
                  if (open) {
                    // Find the active academic year
                    const activeYear = academicYears.find(y => y.status === "active");
                    setSemesterForm(prev => ({
                      ...prev, 
                      programType: "Weekend",
                      yearId: activeYear ? activeYear.id : ""
                    }));
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Trimester
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Trimester</DialogTitle>
                      <DialogDescription>Add a new trimester for Weekend Program</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="year-id">Academic Year *</Label>
                        <Select 
                          value={semesterForm.yearId} 
                          onValueChange={(value) => setSemesterForm({...semesterForm, yearId: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select academic year" />
                          </SelectTrigger>
                          <SelectContent>
                            {academicYears
                              .filter(y => y.status === "active")
                              .map(year => (
                                <SelectItem key={year.id} value={year.id}>{year.year}</SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="name">Trimester Name *</Label>
                        <Select 
                          value={semesterForm.name} 
                          onValueChange={(value) => setSemesterForm({...semesterForm, name: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select trimester" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="First Trimester">First Trimester</SelectItem>
                            <SelectItem value="Second Trimester">Second Trimester</SelectItem>
                            <SelectItem value="Third Trimester">Third Trimester</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start-date">Start Date *</Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={semesterForm.startDate}
                            onChange={(e) => setSemesterForm({ ...semesterForm, startDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-date">End Date *</Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={semesterForm.endDate}
                            onChange={(e) => setSemesterForm({ ...semesterForm, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={semesterForm.status}
                          onValueChange={(value: any) => setSemesterForm({ ...semesterForm, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddSemesterOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddSemester}>Add Trimester</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weekendSemesters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No trimesters found</TableCell>
                    </TableRow>
                  ) : (
                    weekendSemesters.map((semester, index) => {
                      const year = academicYears.find((y) => y.id === semester.yearId)
                      return (
                        <TableRow key={`weekend-${semester.id}-${index}`}>
                          <TableCell className="font-medium">{semester.name}</TableCell>
                          <TableCell>{year?.year || "Unknown Year"}</TableCell>
                          <TableCell>{new Date(semester.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(semester.endDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={semester.status === "active" ? "default" : "outline"}>
                              {semester.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditSemester(semester)}
                              >
                                Edit
                              </Button>
                              
                              {semester.status !== "active" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSetSemesterAsCurrent(semester.id, "Weekend")}
                                >
                                  Set as Current
                                </Button>
                              )}
                              
                              {semester.status === "active" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500 text-red-500 hover:bg-red-50"
                                  onClick={() => handleUndoActiveSemester("Weekend")}
                                >
                                  Undo
                                </Button>
                              )}
                              
                              {semester.status !== "active" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500 text-red-500 hover:bg-red-50"
                                  onClick={() => handleDeleteSemester(semester.id)}
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Update the Rollover tab to include programType */}
        <TabsContent value="rollover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Semester Rollover</CardTitle>
              <CardDescription>
                Complete the current semester/trimester and start a new one. This will archive all data from the current
                semester/trimester and set up a new one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog open={isRolloverOpen} onOpenChange={setIsRolloverOpen}>
                <AlertDialogTrigger asChild>
                  <Button className="w-full" disabled={isLoading}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {isLoading ? "Rolling Over..." : "Start Rollover Process"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Academic Semester Rollover</AlertDialogTitle>
                    <AlertDialogDescription>
                      <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                          This process will complete the current semester/trimester and create a new one. All data from
                          the current semester/trimester will be archived. This action cannot be undone.
                        </div>
                        
                        <div className="flex items-start gap-2 text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span>
                            Please select the appropriate program type (Regular/Weekend) to ensure the correct semester/trimester is rolled over.
                          </span>
                        </div>
                      </div>
                      <div className="grid gap-4">
                        <div>
                          <Label>Program Type</Label>
                          <Select
                            value={rolloverForm.programType}
                            onValueChange={(value: "Regular" | "Weekend") => setRolloverForm({ ...rolloverForm, programType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select program type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Regular">Regular Program</SelectItem>
                              <SelectItem value="Weekend">Weekend Program</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Academic Year</Label>
                          <Select
                            value={rolloverForm.yearId}
                            onValueChange={(value) => setRolloverForm({ ...rolloverForm, yearId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select academic year" />
                            </SelectTrigger>
                            <SelectContent>
                              {academicYears
                                .filter((y) => y.status !== "completed")
                                .map((year) => (
                                  <SelectItem key={year.id} value={year.id}>
                                    {year.year}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>New Semester/Trimester</Label>
                          <Select
                            value={rolloverForm.name}
                            onValueChange={(value) => setRolloverForm({ ...rolloverForm, name: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select semester/trimester" />
                            </SelectTrigger>
                            <SelectContent>
                              {rolloverForm.programType === "Regular" ? (
                                <>
                                  <SelectItem value="First Semester">First Semester</SelectItem>
                                  <SelectItem value="Second Semester">Second Semester</SelectItem>
                                </>
                              ) : (
                                <>
                                  <SelectItem value="First Trimester">First Trimester</SelectItem>
                                  <SelectItem value="Second Trimester">Second Trimester</SelectItem>
                                  <SelectItem value="Third Trimester">Third Trimester</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={rolloverForm.startDate}
                              onChange={(e) => setRolloverForm({ ...rolloverForm, startDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={rolloverForm.endDate}
                              onChange={(e) => setRolloverForm({ ...rolloverForm, endDate: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRollover} disabled={isLoading}>
                      {isLoading ? "Rolling Over..." : "Continue"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditYearOpen} onOpenChange={setIsEditYearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Academic Year</DialogTitle>
            <DialogDescription>Edit details of the academic year</DialogDescription>
          </DialogHeader>
          {editYearData && (
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="edit-year">Academic Year *</Label>
                <Input
                  id="edit-year"
                  value={editYearData.year}
                  onChange={(e) => setEditYearData({ ...editYearData, year: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-start-date">Start Date *</Label>
                  <Input
                    id="edit-start-date"
                    type="date"
                    value={editYearData.startDate}
                    onChange={(e) => setEditYearData({ ...editYearData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-end-date">End Date *</Label>
                  <Input
                    id="edit-end-date"
                    type="date"
                    value={editYearData.endDate}
                    onChange={(e) => setEditYearData({ ...editYearData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editYearData.status}
                  onValueChange={(value: "active" | "completed" | "upcoming") => 
                    setEditYearData({ ...editYearData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditYearOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEditedYear}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Academic Year</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this academic year? This action cannot be undone and will also delete all associated semesters.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setYearToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteYear} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditSemesterOpen} onOpenChange={setIsEditSemesterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Semester</DialogTitle>
            <DialogDescription>Edit details of the semester</DialogDescription>
          </DialogHeader>
          {editSemesterData && (
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="edit-name">Semester Name *</Label>
                <Input
                  id="edit-name"
                  value={editSemesterData.name}
                  onChange={(e) => setEditSemesterData({ ...editSemesterData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-year-id">Academic Year *</Label>
                <Select 
                  value={editSemesterData.yearId} 
                  onValueChange={(value) => setEditSemesterData({...editSemesterData, yearId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears
                      .filter(y => y.status === "active")
                      .map(year => (
                        <SelectItem key={year.id} value={year.id}>{year.year}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-start-date">Start Date *</Label>
                  <Input
                    id="edit-start-date"
                    type="date"
                    value={editSemesterData.startDate}
                    onChange={(e) => setEditSemesterData({ ...editSemesterData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-end-date">End Date *</Label>
                  <Input
                    id="edit-end-date"
                    type="date"
                    value={editSemesterData.endDate}
                    onChange={(e) => setEditSemesterData({ ...editSemesterData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editSemesterData.status}
                  onValueChange={(value: "upcoming" | "active" | "completed") => 
                    setEditSemesterData({ ...editSemesterData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSemesterOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEditedSemester}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteSemesterConfirmOpen} onOpenChange={setIsDeleteSemesterConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Semester</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this semester? This action cannot be undone and will also delete all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSemesterToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSemester} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
