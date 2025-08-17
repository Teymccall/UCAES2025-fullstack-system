"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Home as TrendingUp, 
  Home as Clock, 
  Home as CheckCircle, 
  Home as AlertCircle, 
  Home as Calendar,
  GraduationCap,
  Home as BookOpen
} from "lucide-react"
import { 
  getProgressionSummary, 
  getProgressionRules, 
  getProgressionLogs 
} from "@/lib/progression-service"
import { 
  ProgressionSummary, 
  ProgressionRule, 
  ProgressionLog 
} from "@/lib/progression-types"
import { 
  AcademicYearUtils, 
  ProgressionTimingUtils, 
  FormatUtils 
} from "@/lib/progression-utils"

interface ProgressionDashboardProps {
  academicYear: string;
}

export function ProgressionDashboard({ academicYear }: ProgressionDashboardProps) {
  const [summary, setSummary] = useState<ProgressionSummary | null>(null);
  const [rules, setRules] = useState<ProgressionRule[]>([]);
  const [logs, setLogs] = useState<ProgressionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [academicYear]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryData, rulesData, logsData] = await Promise.all([
        getProgressionSummary(academicYear),
        getProgressionRules(),
        getProgressionLogs(20)
      ]);

      setSummary(summaryData);
      setRules(rulesData);
      setLogs(logsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load progression data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
          <Button onClick={loadDashboardData} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <GraduationCap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No progression data available for {academicYear}</p>
        </CardContent>
      </Card>
    );
  }

  const nextProgressionDates = {
    regular: ProgressionTimingUtils.getNextProgressionDate("Regular"),
    weekend: ProgressionTimingUtils.getNextProgressionDate("Weekend")
  };

  const daysUntilProgression = {
    regular: ProgressionTimingUtils.getDaysUntilProgression("Regular"),
    weekend: ProgressionTimingUtils.getDaysUntilProgression("Weekend")
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Student Level Progression</h2>
          <p className="text-gray-600">
            Academic Year: {FormatUtils.formatAcademicYear(academicYear)}
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" size="sm">
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{summary.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eligible for Progression</p>
                <p className="text-2xl font-bold text-green-600">{summary.eligibleForProgression}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Not Eligible</p>
                <p className="text-2xl font-bold text-orange-600">{summary.notEligible}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Already Progressed</p>
                <p className="text-2xl font-bold text-gray-600">{summary.alreadyProgressed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-level">By Level</TabsTrigger>
          <TabsTrigger value="schedule">Schedule & Rules</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Progression Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Next Progression Dates
              </CardTitle>
              <CardDescription>
                Upcoming progression dates for each schedule type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Regular Students</h4>
                    <Badge variant="outline">September</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Next progression: {FormatUtils.formatDate(nextProgressionDates.regular)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {daysUntilProgression.regular} days remaining
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Weekend Students</h4>
                    <Badge variant="outline">October</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Next progression: {FormatUtils.formatDate(nextProgressionDates.weekend)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {daysUntilProgression.weekend} days remaining
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progression Status */}
          <Card>
            <CardHeader>
              <CardTitle>Progression Status Summary</CardTitle>
              <CardDescription>
                Overview of student progression eligibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Eligible for Progression</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${summary.totalStudents > 0 ? (summary.eligibleForProgression / summary.totalStudents) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{summary.eligibleForProgression}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Not Eligible</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ 
                          width: `${summary.totalStudents > 0 ? (summary.notEligible / summary.totalStudents) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{summary.notEligible}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending Review</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ 
                          width: `${summary.totalStudents > 0 ? (summary.pendingReview / summary.totalStudents) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{summary.pendingReview}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-level" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progression by Student Level</CardTitle>
              <CardDescription>
                Breakdown of progression eligibility by current student level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(summary.byLevel).map(([level, stats]) => (
                  <div key={level} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Level {level}
                      </h4>
                      <Badge variant="secondary">{stats.total} students</Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-green-600 font-medium">{stats.eligible}</p>
                        <p className="text-gray-600">Eligible</p>
                      </div>
                      <div className="text-center">
                        <p className="text-orange-600 font-medium">{stats.notEligible}</p>
                        <p className="text-gray-600">Not Eligible</p>
                      </div>
                      <div className="text-center">
                        <p className="text-blue-600 font-medium">
                          {stats.total - stats.eligible - stats.notEligible}
                        </p>
                        <p className="text-gray-600">Other</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progression Rules</CardTitle>
              <CardDescription>
                Current progression rules and schedule configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{rule.scheduleType} Students</h4>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Required Periods</p>
                        <p className="font-medium">{rule.requiredPeriods}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Progression Month</p>
                        <p className="font-medium">
                          {new Date(2000, rule.progressionMonth - 1).toLocaleDateString('en-US', { month: 'long' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-gray-600 text-sm">Period Names</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rule.periodNames.map((period, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {period}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Recent progression system activity and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        log.level === 'success' ? 'bg-green-500' :
                        log.level === 'warning' ? 'bg-yellow-500' :
                        log.level === 'error' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{log.message}</p>
                        <p className="text-xs text-gray-500">
                          {log.action} • {FormatUtils.formatDate(new Date(log.timestamp))}
                        </p>
                        {log.studentId && (
                          <p className="text-xs text-gray-400">Student: {log.studentId}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProgressionDashboard;

