"use client"

import { 
  GraduationCap
} from "lucide-react"

export function Navigation() {

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">UCAES</h1>
                <p className="text-xs text-gray-500">Student Information System</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </nav>
  )
}

export default Navigation

