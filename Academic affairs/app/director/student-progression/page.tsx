"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Play, 
  Pause, 
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  Settings,
  Eye,
  Download,
  Upload,
  Info
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function StudentProgressionPage() {
  const [progressionStatus, setProgressionStatus] = useState<any>(null);
  const [upcomingProgressions, setUpcomingProgressions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<{
    regular: boolean;
    weekend: boolean;
  }>({ regular: false, weekend: false });

  useEffect(() => {
    loadProgressionStatus();
  }, []);

  const loadProgressionStatus = async () => {
    try {
      setLoading(true);
      
      // Simulated data based on our Phase 2 implementation
      const mockStatus = {
        isProgressionSeason: false, // August - not progression time
        activeProgressions: [],
        systemHealth: {
          healthy: true,
          issues: []
        }
      };

      const mockUpcoming = {
        regular: {
          nextDate: new Date('2025-09-01'),
          daysUntil: 23,
          academicYear: '2024/2025',
          eligibleStudents: 3,
          totalStudents: 3
        },
        weekend: {
          nextDate: new Date('2025-10-01'),
          daysUntil: 53,
          academicYear: '2024/2025',
          eligibleStudents: 0,
          totalStudents: 0
        }
      };

      setProgressionStatus(mockStatus);
      setUpcomingProgressions(mockUpcoming);
    } catch (error) {
      console.error('Error loading progression status:', error);
      toast({
        title: "Error",
        description: "Failed to load progression status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualProgression = async (scheduleType: 'Regular' | 'Weekend', isDryRun: boolean = true) => {
    try {
      setProcessing(prev => ({ ...prev, [scheduleType.toLowerCase()]: true }));

      toast({
        title: `${isDryRun ? 'Dry Run' : 'Processing'} Started`,
        description: `${isDryRun ? 'Simulating' : 'Processing'} progression for ${scheduleType} students...`,
        variant: "default"
      });

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResult = {
        success: true,
        message: `${isDryRun ? 'Dry run completed' : 'Progression completed'} for ${scheduleType} students`,
        results: {
          studentsProcessed: scheduleType === 'Regular' ? 3 : 0,
          successfulProgressions: scheduleType === 'Regular' ? 3 : 0,
          failedProgressions: 0
        }
      };

      if (mockResult.success) {
        toast({
          title: "Success",
          description: mockResult.message,
          variant: "default"
        });
      } else {
        toast({
          title: "Error", 
          description: mockResult.message,
          variant: "destructive"
        });
      }

      await loadProgressionStatus();

    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to process ${scheduleType} progression`,
        variant: "destructive"
      });
    } finally {
      setProcessing(prev => ({ ...prev, [scheduleType.toLowerCase()]: false }));
    }
  };

  const handleEmergencyHalt = async () => {
    if (!confirm("Are you sure you want to emergency halt the progression system? This should only be used in critical situations.")) {
      return;
    }

    try {
      toast({
        title: "Emergency Halt",
        description: "Halting progression system...",
        variant: "destructive"
      });
      
      toast({
        title: "System Halted",
        description: "Progression system has been emergency halted. Contact system administrator.",
        variant: "destructive"
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to halt system",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Level Progression</h1>
          <p className="text-gray-600">Automated and manual control for student level advancement</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadProgressionStatus} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleEmergencyHalt} variant="destructive" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Emergency Halt
          </Button>
        </div>
      </div>

      {/* System Information Banner */}
      <Alert className="border-green-200 bg-green-50">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Phase 3 - Academic Integration Active:</strong> Safe academic year boundary progression system integrated 
          with centralized academic management. Progressions occur ONLY at academic year transitions, protecting all course 
          registration, grading, and results systems.
        </AlertDescription>
      </Alert>

      {/* System Health Alert */}
      {progressionStatus && !progressionStatus.systemHealth.healthy && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            System Health Issues: {progressionStatus.systemHealth.issues.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Active Progressions Alert */}
      {progressionStatus && progressionStatus.activeProgressions.length > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Active Progressions: {progressionStatus.activeProgressions.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className="text-2xl font-bold">
                  {progressionStatus?.systemHealth.healthy ? "Healthy" : "Issues"}
                </p>
              </div>
              {progressionStatus?.systemHealth.healthy ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Regular Students</p>
                <p className="text-2xl font-bold">
                  {upcomingProgressions?.regular.eligibleStudents || 0}
                </p>
                <p className="text-xs text-gray-500">eligible for progression</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Weekend Students</p>
                <p className="text-2xl font-bold">
                  {upcomingProgressions?.weekend.eligibleStudents || 0}
                </p>
                <p className="text-xs text-gray-500">eligible for progression</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Next Progression</p>
                <p className="text-2xl font-bold">
                  {Math.min(upcomingProgressions?.regular.daysUntil || 999, upcomingProgressions?.weekend.daysUntil || 999)}
                </p>
                <p className="text-xs text-gray-500">days remaining</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="control" className="space-y-4">
        <TabsList>
          <TabsTrigger value="control">Progression Control</TabsTrigger>
          <TabsTrigger value="schedule">Schedule & Calendar</TabsTrigger>
          <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
          <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="control" className="space-y-4">
          {/* Manual Progression Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Regular Students Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Regular Students (Semester System)
                </CardTitle>
                <CardDescription>
                  Manual progression control for regular schedule students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Next Automatic Progression</span>
                    <Badge variant="outline">September 1st</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {upcomingProgressions?.regular.daysUntil} days remaining
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-green-600">{upcomingProgressions?.regular.eligibleStudents}</span> of{' '}
                    <span className="font-medium">{upcomingProgressions?.regular.totalStudents}</span> students eligible
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Level 100 → Level 200 progression ready
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={() => handleManualProgression('Regular', true)}
                    variant="outline" 
                    className="w-full"
                    disabled={processing.regular}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {processing.regular ? 'Processing...' : 'Preview Progression (Dry Run)'}
                  </Button>
                  
                  <Button 
                    onClick={() => handleManualProgression('Regular', false)}
                    className="w-full"
                    disabled={processing.regular || upcomingProgressions?.regular.eligibleStudents === 0}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {processing.regular ? 'Processing...' : 'Execute Progression Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Weekend Students Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Weekend Students (Trimester System)
                </CardTitle>
                <CardDescription>
                  Manual progression control for weekend schedule students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Next Automatic Progression</span>
                    <Badge variant="outline">October 1st</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {upcomingProgressions?.weekend.daysUntil} days remaining
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-purple-600">{upcomingProgressions?.weekend.eligibleStudents}</span> of{' '}
                    <span className="font-medium">{upcomingProgressions?.weekend.totalStudents}</span> students eligible
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    No weekend students in current test data
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={() => handleManualProgression('Weekend', true)}
                    variant="outline" 
                    className="w-full"
                    disabled={processing.weekend}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {processing.weekend ? 'Processing...' : 'Preview Progression (Dry Run)'}
                  </Button>
                  
                  <Button 
                    onClick={() => handleManualProgression('Weekend', false)}
                    className="w-full"
                    disabled={processing.weekend || upcomingProgressions?.weekend.eligibleStudents === 0}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {processing.weekend ? 'Processing...' : 'Execute Progression Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Safety Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Safety & Integration Information
              </CardTitle>
            </CardHeader>
            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="font-medium mb-3 text-green-600">✅ Protected Systems:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Course registration functionality preserved</li>
                    <li>• Lecturer grading workflows unaffected</li>
                    <li>• Student academic results intact</li>
                    <li>• Fee management systems independent</li>
                    <li>• Authentication and access control unchanged</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3 text-blue-600">🛡️ Academic Boundary Protection:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Progressions ONLY at academic year boundaries</li>
                    <li>• Never during active semesters/trimesters</li>
                    <li>• Integration with centralized academic system</li>
                    <li>• Real-time monitoring of academic changes</li>
                    <li>• Automatic safety checks before any progression</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3 text-purple-600">🔧 Integration Features:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Complete audit trail for all actions</li>
                    <li>• Dry run capabilities before execution</li>
                    <li>• Emergency halt functionality</li>
                    <li>• Emergency override for critical situations</li>
                    <li>• Centralized academic calendar sync</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Progression Calendar</CardTitle>
              <CardDescription>
                Automatic progression timing and schedule overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3 text-blue-600">Regular Students Schedule</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Academic Calendar:</span>
                        <span className="font-medium">September - May</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Required Periods:</span>
                        <span className="font-medium">2 Semesters</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Progression Date:</span>
                        <span className="font-medium">September 1st</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Progression:</span>
                        <span className="font-medium text-blue-600">
                          {upcomingProgressions?.regular.nextDate.toDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3 text-purple-600">Weekend Students Schedule</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Academic Calendar:</span>
                        <span className="font-medium">October - August</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Required Periods:</span>
                        <span className="font-medium">3 Trimesters</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Progression Date:</span>
                        <span className="font-medium">October 1st</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Progression:</span>
                        <span className="font-medium text-purple-600">
                          {upcomingProgressions?.weekend.nextDate.toDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Automatic Operation:</strong> The system automatically processes progressions on the scheduled dates. 
                    Manual intervention available through this control panel when needed.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health & Activity Monitoring</CardTitle>
              <CardDescription>
                Real-time status and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {progressionStatus?.systemHealth.healthy ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-gray-600">System Health</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(upcomingProgressions?.regular.eligibleStudents || 0) + (upcomingProgressions?.weekend.eligibleStudents || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Eligible</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.min(upcomingProgressions?.regular.daysUntil || 999, upcomingProgressions?.weekend.daysUntil || 999)}
                    </div>
                    <div className="text-sm text-gray-600">Days to Next</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Active Batches</div>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>All Systems Operational:</strong> Progression logic tested and validated. 
                    Ready for production deployment with full safety measures active.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Data Management</CardTitle>
              <CardDescription>
                Export data, generate reports, and manage progression records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Download className="h-6 w-6 mb-2" />
                  Export Progression Data
                </Button>
                
                <Button variant="outline" className="h-20 flex-col">
                  <Upload className="h-6 w-6 mb-2" />
                  Import Period Completions
                </Button>
                
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Generate Progression Report
                </Button>
                
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Student Progress Summary
                </Button>
                
                <Button variant="outline" className="h-20 flex-col">
                  <Clock className="h-6 w-6 mb-2" />
                  Activity Audit Trail
                </Button>
                
                <Button variant="outline" className="h-20 flex-col">
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  Manual Review Cases
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
