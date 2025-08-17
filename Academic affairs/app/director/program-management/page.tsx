"use client"

import ProgramDisplay from "@/components/program-display"
import { redirect } from "next/navigation"

export default function ProgramManagementPage() {
  // Make the Courses & Program Management page canonical for managing programs/courses
  redirect("/director/courses")
} 