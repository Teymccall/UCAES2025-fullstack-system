"use client"

import { RouteGuard } from "@/components/route-guard"
import { ScholarshipManagement } from "@/components/scholarship-management"

export default function ScholarshipsPage() {
  return (
    <RouteGuard requiredRole="staff">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Scholarship Management</h1>
          <p className="text-gray-600 mt-2">
            Award scholarships, manage disbursements, and track student recipients
          </p>
        </div>
        
        <ScholarshipManagement />
      </div>
    </RouteGuard>
  )
}



