"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff } from "lucide-react"
import type { FormData } from "@/app/register/page"

interface RegistrationDebugProps {
  formData: FormData
}

export default function RegistrationDebug({ formData }: RegistrationDebugProps) {
  const [showDebug, setShowDebug] = useState(false)

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4">
        <Button variant="outline" size="sm" onClick={() => setShowDebug(true)} className="bg-white shadow-lg">
          <Eye className="h-4 w-4 mr-2" />
          Debug Data
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto">
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Registration Data Debug</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowDebug(false)}>
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div>
            <Badge variant="secondary">Personal Info</Badge>
            <div className="mt-1 space-y-1">
              <p>
                <strong>Surname:</strong> {formData.surname || "Not set"}
              </p>
              <p>
                <strong>Other Names:</strong> {formData.otherNames || "Not set"}
              </p>
              <p>
                <strong>Gender:</strong> {formData.gender || "Not set"}
              </p>
              <p>
                <strong>Nationality:</strong> {formData.nationality || "Not set"}
              </p>
            </div>
          </div>

          <div>
            <Badge variant="secondary">Contact Info</Badge>
            <div className="mt-1 space-y-1">
              <p>
                <strong>Email:</strong> {formData.email || "Not set"}
              </p>
              <p>
                <strong>Mobile:</strong> {formData.mobile || "Not set"}
              </p>
              <p>
                <strong>City:</strong> {formData.city || "Not set"}
              </p>
            </div>
          </div>

          <div>
            <Badge variant="secondary">Academic Info</Badge>
            <div className="mt-1 space-y-1">
              <p>
                <strong>Programme:</strong> {formData.programme || "Not set"}
              </p>
              <p>
                <strong>Year:</strong> {formData.yearOfEntry || "Not set"}
              </p>
            </div>
          </div>

          <div>
            <Badge variant="secondary">Profile Picture</Badge>
            <div className="mt-1">
              <p>
                <strong>File:</strong>{" "}
                {formData.profilePicture
                  ? `${formData.profilePicture.name} (${Math.round(formData.profilePicture.size / 1024)}KB)`
                  : "No file selected"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
