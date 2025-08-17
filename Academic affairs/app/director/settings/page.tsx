"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAcademic, type OperationalHours } from "@/components/academic-context"
import { Clock, Save, AlertCircle, Database, RefreshCw, AlertTriangle, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import migrateToFirebase from "@/scripts/migrate-to-firebase"

export default function SystemSettings() {
  const { operationalHours, setOperationalHours, isWithinOperationalHours } = useAcademic()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("general")
  const [migrationStatus, setMigrationStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const [initializationStatus, setInitializationStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")

  const [hoursForm, setHoursForm] = useState({
    startTime: operationalHours?.startTime || "08:00",
    endTime: operationalHours?.endTime || "18:00",
    workingDays: operationalHours?.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    timezone: operationalHours?.timezone || "UTC",
    isActive: operationalHours?.isActive || true,
  })

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const handleWorkingDayChange = (day: string, checked: boolean) => {
    if (checked) {
      setHoursForm((prev) => ({
        ...prev,
        workingDays: [...prev.workingDays, day],
      }))
    } else {
      setHoursForm((prev) => ({
        ...prev,
        workingDays: prev.workingDays.filter((d) => d !== day),
      }))
    }
  }

  const handleSaveOperationalHours = () => {
    if (!hoursForm.startTime || !hoursForm.endTime) {
      toast({
        title: "Validation Error",
        description: "Please set both start and end times",
        variant: "destructive",
      })
      return
    }

    if (hoursForm.workingDays.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one working day",
        variant: "destructive",
      })
      return
    }

    const newHours: Omit<OperationalHours, "id" | "createdAt"> = {
      startTime: hoursForm.startTime,
      endTime: hoursForm.endTime,
      workingDays: hoursForm.workingDays,
      timezone: hoursForm.timezone,
      isActive: hoursForm.isActive,
    }

    setOperationalHours(newHours)

    toast({
      title: "Settings Saved",
      description: "Operational hours have been updated successfully",
    })
  }

  const currentStatus = isWithinOperationalHours()

  const handleMigration = async () => {
    setMigrationStatus("running")
    setStatusMessage("Migration in progress...")
    
    try {
      await migrateToFirebase()
      setMigrationStatus("success")
      setStatusMessage("Migration completed successfully!")
    } catch (error) {
      console.error("Migration error:", error)
      setMigrationStatus("error")
      setStatusMessage(`Migration failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleInitialization = async () => {
    setInitializationStatus("running")
    setStatusMessage("Database initialization in progress...")
    
    try {
      // Call API route to initialize the database
      await fetch("/api/init-db", { method: "POST" })
      setInitializationStatus("success")
      setStatusMessage("Database initialized successfully!")
    } catch (error) {
      console.error("Initialization error:", error)
      setInitializationStatus("error")
      setStatusMessage(`Initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Configure system-wide settings and operational parameters</p>
      </div>

      {/* Current Status */}
      <Card className={`border-2 ${currentStatus ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">System is currently {currentStatus ? "OPEN" : "CLOSED"}</p>
              <p className="text-sm text-muted-foreground">
                {operationalHours?.isActive
                  ? `Operating hours: ${operationalHours.startTime} - ${operationalHours.endTime}`
                  : "Operational hours are disabled"}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {currentStatus ? "ACTIVE" : "RESTRICTED"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="operational">Operational Hours</TabsTrigger>
          <TabsTrigger value="academic">Academic Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>General settings configuration options will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Initialize Database
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      This will ensure all required collections exist and are properly initialized.
                      Use this if you're setting up the system for the first time.
                    </p>
                    <Button 
                      onClick={handleInitialization}
                      disabled={initializationStatus === "running"}
                      className="w-full"
                    >
                      {initializationStatus === "running" ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Initializing...
                        </>
                      ) : initializationStatus === "success" ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Database Initialized
                        </>
                      ) : (
                        <>
                          <Database className="mr-2 h-4 w-4" />
                          Initialize Database
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <RefreshCw className="h-5 w-5" />
                      Migrate to Firebase
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      This will check for any mock data in the system and migrate it to Firebase Firestore.
                      Use this to ensure all data is coming from the real database.
                    </p>
                    <Button 
                      onClick={handleMigration} 
                      disabled={migrationStatus === "running"}
                      className="w-full"
                    >
                      {migrationStatus === "running" ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Migrating...
                        </>
                      ) : migrationStatus === "success" ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Migration Complete
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Start Migration
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              {(migrationStatus === "success" || migrationStatus === "error" || 
                initializationStatus === "success" || initializationStatus === "error") && (
                <Alert variant={migrationStatus === "error" || initializationStatus === "error" ? "destructive" : "default"}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>
                    {migrationStatus === "error" || initializationStatus === "error" ? "Operation Failed" : "Operation Complete"}
                  </AlertTitle>
                  <AlertDescription>{statusMessage}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Operational Hours Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-hours"
                  checked={hoursForm.isActive}
                  onCheckedChange={(checked) => setHoursForm((prev) => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="enable-hours">Enable operational hours restrictions</Label>
              </div>

              {hoursForm.isActive && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={hoursForm.startTime}
                        onChange={(e) => setHoursForm((prev) => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={hoursForm.endTime}
                        onChange={(e) => setHoursForm((prev) => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Working Days</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {daysOfWeek.map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={day}
                            checked={hoursForm.workingDays.includes(day)}
                            onCheckedChange={(checked) => handleWorkingDayChange(day, checked as boolean)}
                          />
                          <Label htmlFor={day} className="text-sm">
                            {day}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Operational Hours Impact</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          When operational hours are enabled, staff members will only be able to access the system
                          during the specified times and days. Outside these hours, they will see a "System Closed"
                          message and cannot perform any actions.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Button onClick={handleSaveOperationalHours}>
                <Save className="h-4 w-4 mr-2" />
                Save Operational Hours
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Grading Scale</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                    <div>A: 90-100</div>
                    <div>A-: 85-89</div>
                    <div>B+: 80-84</div>
                    <div>B: 75-79</div>
                    <div>B-: 70-74</div>
                    <div>C+: 65-69</div>
                    <div>C: 60-64</div>
                    <div>C-: 55-59</div>
                    <div>D: 50-54</div>
                    <div>F: 0-49</div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Assessment Weights</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>Midterm: 30%</div>
                    <div>Final: 50%</div>
                    <div>Assignments: 20%</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="auto-gpa" defaultChecked />
                <Label htmlFor="auto-gpa">Automatic GPA calculation on result approval</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="result-notifications" defaultChecked />
                <Label htmlFor="result-notifications">Send notifications on result submissions</Label>
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Academic Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="email-notifications" defaultChecked />
                  <Label htmlFor="email-notifications">Email notifications</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="daily-report-reminders" defaultChecked />
                  <Label htmlFor="daily-report-reminders">Daily report submission reminders</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="result-approval-notifications" defaultChecked />
                  <Label htmlFor="result-approval-notifications">Result approval notifications</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="semester-rollover-alerts" defaultChecked />
                  <Label htmlFor="semester-rollover-alerts">Semester rollover alerts</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="staff-login-notifications" />
                  <Label htmlFor="staff-login-notifications">Staff login notifications</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="notification-time">Daily reminder time</Label>
                <Input id="notification-time" type="time" defaultValue="17:00" className="mt-1 w-48" />
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
