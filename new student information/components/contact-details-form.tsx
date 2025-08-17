"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FormData } from "@/app/register/page"

interface ContactDetailsFormProps {
  data: FormData
  updateData: (data: Partial<FormData>) => void
}

export default function ContactDetailsForm({ data, updateData }: ContactDetailsFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Details</h3>
        <p className="text-sm text-gray-600 mb-6">Please provide your contact information</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Student Email *</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number *</Label>
            <Input
              id="mobile"
              type="tel"
              value={data.mobile}
              onChange={(e) => updateData({ mobile: e.target.value })}
              placeholder="Enter your mobile number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              value={data.street}
              onChange={(e) => updateData({ street: e.target.value.toUpperCase() })}
              placeholder="Enter your street address"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={data.city}
              onChange={(e) => updateData({ city: e.target.value.toUpperCase() })}
              placeholder="Enter your city"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              value={data.country}
              onChange={(e) => updateData({ country: e.target.value.toUpperCase() })}
              placeholder="Enter your country"
              required
            />
          </div>
        </div>
      </div>
    </div>
  )
}
