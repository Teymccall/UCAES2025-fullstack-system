"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { FormData } from "@/app/register/page"

interface GuardianDetailsFormProps {
  data: FormData
  updateData: (data: Partial<FormData>) => void
}

export default function GuardianDetailsForm({ data, updateData }: GuardianDetailsFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Guardian / Corresponding Details</h3>
        <p className="text-sm text-gray-600 mb-6">Please provide your guardian or emergency contact information</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guardianName">Guardian's Full Name *</Label>
            <Input
              id="guardianName"
              value={data.guardianName}
              onChange={(e) => updateData({ guardianName: e.target.value.toUpperCase() })}
              placeholder="Enter guardian's full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship *</Label>
            <Select value={data.relationship} onValueChange={(value) => updateData({ relationship: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="father">Father</SelectItem>
                <SelectItem value="mother">Mother</SelectItem>
                <SelectItem value="guardian">Guardian</SelectItem>
                <SelectItem value="uncle">Uncle</SelectItem>
                <SelectItem value="aunt">Aunt</SelectItem>
                <SelectItem value="sibling">Sibling</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianContact">Guardian's Contact Number *</Label>
            <Input
              id="guardianContact"
              type="tel"
              value={data.guardianContact}
              onChange={(e) => updateData({ guardianContact: e.target.value })}
              placeholder="Enter guardian's contact number"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guardianEmail">Guardian's Email</Label>
            <Input
              id="guardianEmail"
              type="email"
              value={data.guardianEmail}
              onChange={(e) => updateData({ guardianEmail: e.target.value })}
              placeholder="Enter guardian's email (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianAddress">Guardian's Address *</Label>
            <Textarea
              id="guardianAddress"
              value={data.guardianAddress}
              onChange={(e) => updateData({ guardianAddress: e.target.value.toUpperCase() })}
              placeholder="Enter guardian's complete address"
              className="min-h-[100px]"
              required
            />
          </div>
        </div>
      </div>
    </div>
  )
}
