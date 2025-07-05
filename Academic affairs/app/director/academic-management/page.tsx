"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { useAcademic, type AcademicSemester } from "@/components/academic-context"
import { Plus, RotateCcw, GraduationCap, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AcademicManagement() {
  const { academicYears, currentSemester, addAcademicYear, addSemester, setCurrentSemester, rolloverToNewSemester } =
    useAcademic()
  const { toast } = useToast()

  const [isAddYearOpen, setIsAddYearOpen] = useState(false)
  const [isAddSemesterOpen, setIsAddSemesterOpen] = useState(false)
  const [isRolloverOpen, setIsRolloverOpen] = useState(false)

  const [yearForm, setYearForm] = useState({
    year: "",
    startDate: "",
    endDate: "",
    status: "upcoming" as const,
  })

  const [semesterForm, setSemesterForm] = useState({
    name: "",
    yearId: "",
    startDate: "",
    endDate: "",
    registrationStart: "",
    registrationEnd: "",
    status: "upcoming" as const,
  })

  const [rolloverForm, setRolloverForm] = useState({
    name: "",
    yearId: "",
    startDate: "",
    endDate: "",
    registrationStart: "",
    registrationEnd: "",
  })

  const handleAddYear = () => {
    if (!yearForm.year || !yearForm.startDate || !yearForm.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    addAcademicYear({
      year: yearForm.year,
      startDate: yearForm.startDate,
      endDate: yearForm.endDate,
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
    if (!semesterForm.name || !semesterForm.yearId || !semesterForm.startDate || !semesterForm.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    addSemester({
      name: semesterForm.name,
      yearId: semesterForm.yearId,
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

  const handleRollover = () => {
    if (!rolloverForm.name || !rolloverForm.yearId || !rolloverForm.startDate || !rolloverForm.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    rolloverToNewSemester({
      name: rolloverForm.name,
      yearId: rolloverForm.yearId,
      startDate: rolloverForm.startDate,
      endDate: rolloverForm.endDate,
      registrationStart: rolloverForm.registrationStart,
      registrationEnd: rolloverForm.registrationEnd,
    })

    setRolloverForm({
      name: "",
      yearId: "",
      startDate: "",
      endDate: "",
      registrationStart: "",
      registrationEnd: "",
    })
    setIsRolloverOpen(false)

    toast({
      title: "Rollover Complete",
      description: "New semester has been activated and previous data archived",
    })
  }

  // Get all semesters across all years
  const allSemesters: AcademicSemester[] = []
  academicYears.forEach((year) => {
    // In real implementation, semesters would be fetched based on yearId
    // For now, we'll use a mock approach
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Academic Management</h1>
        <p className="text-muted-foreground">Manage academic years, semesters, and rollover processes</p>
      </div>

      {/* Current Semester Info */}
      {currentSemester && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Current Semester
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium">Semester</Label>
                <p className="text-lg font-semibold">{currentSemester.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Start Date</Label>
                <p>{new Date(currentSemester.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">End Date</Label>
                <p>{new Date(currentSemester.endDate).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge variant="default">{currentSemester.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="years" className="space-y-4">
        <TabsList>
          <TabsTrigger value="years">Academic Years</TabsTrigger>
          <TabsTrigger value="semesters">Semesters</TabsTrigger>
          <TabsTrigger value="rollover">Semester Rollover</TabsTrigger>
        </TabsList>

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
                      <TableCell>{new Date(year.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(year.endDate).toLocaleDateString()}</TableCell>
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
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="semesters" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Semesters</CardTitle>
                <Dialog open={isAddSemesterOpen} onOpenChange={setIsAddSemesterOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Semester
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Semester</DialogTitle>
                      <DialogDescription>Create a new semester within an academic year</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="semester-name">Semester Name *</Label>
                          <Input
                            id="semester-name"
                            value={semesterForm.name}
                            onChange={(e) => setSemesterForm({ ...semesterForm, name: e.target.value })}
                            placeholder="Spring 2025"
                          />
                        </div>
                        <div>
                          <Label htmlFor="academic-year">Academic Year *</Label>
                          <Select
                            value={semesterForm.yearId}
                            onValueChange={(value) => setSemesterForm({ ...semesterForm, yearId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select academic year" />
                            </SelectTrigger>
                            <SelectContent>
                              {academicYears.map((year) => (
                                <SelectItem key={year.id} value={year.id}>
                                  {year.year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="semester-start">Semester Start *</Label>
                          <Input
                            id="semester-start"
                            type="date"
                            value={semesterForm.startDate}
                            onChange={(e) => setSemesterForm({ ...semesterForm, startDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="semester-end">Semester End *</Label>
                          <Input
                            id="semester-end"
                            type="date"
                            value={semesterForm.endDate}
                            onChange={(e) => setSemesterForm({ ...semesterForm, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="reg-start">Registration Start</Label>
                          <Input
                            id="reg-start"
                            type="date"
                            value={semesterForm.registrationStart}
                            onChange={(e) => setSemesterForm({ ...semesterForm, registrationStart: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="reg-end">Registration End</Label>
                          <Input
                            id="reg-end"
                            type="date"
                            value={semesterForm.registrationEnd}
                            onChange={(e) => setSemesterForm({ ...semesterForm, registrationEnd: e.target.value })}
                          />
                        </div>
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
                    <TableHead>Semester</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Registration Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Mock semester data - in real app, this would come from the context */}
                  <TableRow>
                    <TableCell className="font-medium">
                      Fall 2024
                      {currentSemester?.name === "Fall 2024" && (
                        <Badge variant="default" className="ml-2">
                          Current
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>2024-2025</TableCell>
                    <TableCell>Sep 1 - Dec 20, 2024</TableCell>
                    <TableCell>Aug 15 - Sep 15, 2024</TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rollover" className="space-y-4">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Semester Rollover
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium mb-2">Rollover Process</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Current semester will be marked as completed</li>
                    <li>• All current data will be archived for historical records</li>
                    <li>• New semester will be activated</li>
                    <li>• Student registrations will be reset</li>
                    <li>• Staff assignments will be cleared for reassignment</li>
                  </ul>
                </div>

                <AlertDialog open={isRolloverOpen} onOpenChange={setIsRolloverOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Initiate Semester Rollover
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Semester Rollover</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will complete the current semester and start a new one. This process cannot be
                        undone. Please configure the new semester details below.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="new-semester-name">New Semester Name *</Label>
                          <Input
                            id="new-semester-name"
                            value={rolloverForm.name}
                            onChange={(e) => setRolloverForm({ ...rolloverForm, name: e.target.value })}
                            placeholder="Spring 2025"
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-academic-year">Academic Year *</Label>
                          <Select
                            value={rolloverForm.yearId}
                            onValueChange={(value) => setRolloverForm({ ...rolloverForm, yearId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select academic year" />
                            </SelectTrigger>
                            <SelectContent>
                              {academicYears.map((year) => (
                                <SelectItem key={year.id} value={year.id}>
                                  {year.year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="new-start">Semester Start *</Label>
                          <Input
                            id="new-start"
                            type="date"
                            value={rolloverForm.startDate}
                            onChange={(e) => setRolloverForm({ ...rolloverForm, startDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-end">Semester End *</Label>
                          <Input
                            id="new-end"
                            type="date"
                            value={rolloverForm.endDate}
                            onChange={(e) => setRolloverForm({ ...rolloverForm, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="new-reg-start">Registration Start</Label>
                          <Input
                            id="new-reg-start"
                            type="date"
                            value={rolloverForm.registrationStart}
                            onChange={(e) => setRolloverForm({ ...rolloverForm, registrationStart: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-reg-end">Registration End</Label>
                          <Input
                            id="new-reg-end"
                            type="date"
                            value={rolloverForm.registrationEnd}
                            onChange={(e) => setRolloverForm({ ...rolloverForm, registrationEnd: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRollover} className="bg-red-600 hover:bg-red-700">
                        Confirm Rollover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
