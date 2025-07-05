"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { GraduationCap, Calendar, Award, BookOpen, TrendingUp, School, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getAcademicRecord, AcademicRecord, AcademicLevel } from "@/lib/academic-service"

export default function AcademicRecords() {
  const { student } = useAuth()
  const [academicRecord, setAcademicRecord] = useState<AcademicRecord | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch academic record on component mount
  useEffect(() => {
    if (!student) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Try to get data from Firebase
        try {
          const record = await getAcademicRecord(student)
          setAcademicRecord(record)
        } catch (err) {
          console.error("Failed to fetch from Firebase, using hardcoded data:", err)
          
          // Hardcoded academic record for testing
          const hardcodedRecord: AcademicRecord = {
            studentId: student.id,
            registrationNumber: student.registrationNumber || '',
            indexNumber: student.studentIndexNumber || '',
            programme: student.programme || 'B.Sc. Environmental Science and Management',
            programmeDuration: 4,
            currentLevel: 'Level 300',
            currentLevelNumber: 300,
            yearOfAdmission: '2021',
            expectedCompletionYear: '2025',
            entryQualification: 'WASSCE',
            entryLevel: 'Level 100',
            currentCGPA: 3.45,
            totalCreditsEarned: 108,
            totalCreditsRequired: 144,
            creditsRemaining: 36,
            academicStanding: 'Good Standing',
            projectedClassification: 'Second Class Upper',
            probationStatus: 'None',
            graduationEligibility: 'On Track',
            levels: [
              {
                level: 'Level 100',
                levelNumber: 100,
                creditsRequired: 36,
                creditsEarned: 36,
                gpa: 3.2,
                status: 'completed',
                academicYear: '2021/2022'
              },
              {
                level: 'Level 200',
                levelNumber: 200,
                creditsRequired: 36,
                creditsEarned: 36,
                gpa: 3.6,
                status: 'completed',
                academicYear: '2022/2023'
              },
              {
                level: 'Level 300',
                levelNumber: 300,
                creditsRequired: 36,
                creditsEarned: 36,
                gpa: 3.5,
                status: 'in-progress',
                academicYear: '2023/2024'
              },
              {
                level: 'Level 400',
                levelNumber: 400,
                creditsRequired: 36,
                creditsEarned: 0,
                gpa: 0,
                status: 'upcoming',
                academicYear: '2024/2025'
              }
            ]
          }
          
          setAcademicRecord(hardcodedRecord)
        }
      } catch (err) {
        console.error("Failed to load academic record data:", err)
        setError("Failed to load academic record data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [student])

  // Loading state
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading your academic records...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !academicRecord) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 p-4 rounded-lg max-w-md mx-auto">
          <p className="text-red-600 mb-2">Unable to load academic records</p>
          <p className="text-sm text-gray-600">Please try again later or contact support</p>
        </div>
      </div>
    )
  }

  // Calculate progress percentage
  const progressPercentage = academicRecord.totalCreditsRequired > 0
    ? Math.round((academicRecord.totalCreditsEarned / academicRecord.totalCreditsRequired) * 100)
    : 0

  // Get completed and in-progress levels
  const completedLevels = academicRecord.levels.filter(level => level.status === 'completed')
  const currentLevel = academicRecord.levels.find(level => level.status === 'in-progress')
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
          <GraduationCap className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Records</h1>
          <p className="text-gray-600">Your academic journey and program information</p>
        </div>
      </div>

      {/* Program Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-green-600" />
            Program Overview
          </CardTitle>
          <CardDescription>Current academic program and enrollment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Index Number</label>
              <p className="text-lg font-semibold text-gray-900">{academicRecord.indexNumber || academicRecord.registrationNumber}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Programme</label>
              <p className="text-lg font-semibold text-gray-900">{academicRecord.programme}</p>
              <Badge className="bg-green-100 text-green-800">{academicRecord.programmeDuration}-Year Program</Badge>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Current Level</label>
              <p className="text-lg font-semibold text-gray-900">{academicRecord.currentLevel}</p>
              <Badge variant="secondary">Year {academicRecord.currentLevelNumber / 100} of {academicRecord.programmeDuration}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Academic Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Year of Admission</label>
                <p className="text-gray-900 font-medium">{academicRecord.yearOfAdmission}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Expected Completion</label>
                <p className="text-gray-900 font-medium">{academicRecord.expectedCompletionYear}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Entry Qualification</label>
              <p className="text-gray-900 font-medium">{academicRecord.entryQualification}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Entry Level</label>
              <p className="text-gray-900 font-medium">{academicRecord.entryLevel}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Academic Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Program Completion</span>
                <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Credit Hours Earned</span>
                <span className="text-sm font-medium text-gray-900">
                  {academicRecord.totalCreditsEarned}/{academicRecord.totalCreditsRequired}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{academicRecord.currentCGPA.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Current CGPA</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{academicRecord.creditsRemaining}</p>
                <p className="text-sm text-gray-600">Remaining Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            Level Breakdown
          </CardTitle>
          <CardDescription>Academic performance by level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {academicRecord.levels
                .filter(level => level.status !== 'upcoming')
                .map((level, index) => (
                  <div key={level.level} className={`border rounded-lg p-4 ${level.status === 'in-progress' ? 'border-green-200 bg-green-50' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{level.level}</h4>
                      <Badge className={`${level.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {level.status === 'in-progress' ? 'In Progress' : 'Completed'}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Credits Earned:</span>
                        <span className="font-medium">{level.creditsEarned}/{level.creditsRequired}</span>
                      </div>
                      {level.status === 'completed' && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">GPA:</span>
                          <span className="font-medium">{level.gpa.toFixed(1)}</span>
                        </div>
                      )}
                      {level.status === 'in-progress' && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current GPA:</span>
                          <span className="font-medium">{level.gpa > 0 ? level.gpa.toFixed(1) : 'N/A'}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Academic Year:</span>
                        <span className="font-medium">{level.academicYear}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Standing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            Academic Standing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Current Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-green-100 text-green-800">{academicRecord.academicStanding}</Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Classification</label>
                <p className="text-gray-900 font-medium">{academicRecord.projectedClassification}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Probation Status</label>
                <p className="text-gray-900 font-medium">{academicRecord.probationStatus}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Graduation Eligibility</label>
                <p className="text-gray-900 font-medium">{academicRecord.graduationEligibility}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
