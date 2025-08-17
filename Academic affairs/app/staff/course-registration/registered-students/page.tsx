"use client"

import { RouteGuard } from "@/components/route-guard"
import DirectorRegisteredStudentsPage from "../../../director/course-registration/registered-students/page"

export default function StaffRegisteredStudentsPage() {
  return (
    <RouteGuard requiredPermissions={["registration_management"]}>
      <DirectorRegisteredStudentsPage />
    </RouteGuard>
  )
}


