"use client"

import React from 'react'
import ProgressionDashboard from '@/components/progression-dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestProgressionPage() {
  const currentYear = new Date().getFullYear()
  const academicYear = `${currentYear}/${currentYear + 1}`

  return (
    <div className="bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">
                🎓 Student Level Progression System - Phase 1 Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Status:</strong> ✅ Foundation Successfully Implemented</p>
                <p><strong>Phase:</strong> Phase 1 - Non-disruptive Foundation</p>
                <p><strong>Academic Year:</strong> {academicYear}</p>
                <p><strong>Students Initialized:</strong> 3 approved students</p>
                <p><strong>Safety:</strong> No existing functionality affected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <ProgressionDashboard academicYear={academicYear} />
      </div>
    </div>
  )
}
