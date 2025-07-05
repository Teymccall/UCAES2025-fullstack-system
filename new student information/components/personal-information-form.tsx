"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, Loader2, CheckCircle } from "lucide-react"
import type { FormData } from "@/app/register/page"
import Image from "next/image"
import { toast } from "@/components/ui/use-toast"
import PassportUpload from "./passport-upload"

interface PersonalInformationFormProps {
  data: FormData
  updateData: (data: Partial<FormData>) => void
}

export default function PersonalInformationForm({ data, updateData }: PersonalInformationFormProps) {
  // Handle passport photo update from PassportUpload component
  const handlePhotoUpdate = (photoData: { 
    file: File | null;
    previewUrl: string | null;
    name: string;
    type: string;
    size: number;
    hasImage: boolean;
  }) => {
    // Store the file object and preview URL in the form data
    updateData({ 
      profilePicture: {
        file: photoData.file,
        url: photoData.previewUrl || '',
        previewUrl: photoData.previewUrl,
        name: photoData.name,
        type: photoData.type,
        size: photoData.size,
        hasImage: photoData.hasImage
      }
    });
  };

  // Get the initial photo URL from the form data if it exists
  const getInitialPhotoUrl = () => {
    if (data.profilePicture) {
      if (typeof data.profilePicture === 'object' && 'url' in data.profilePicture) {
        return data.profilePicture.url;
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <p className="text-sm text-gray-600 mb-6">Please provide your basic personal details</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="surname">Surname *</Label>
            <Input
              id="surname"
              value={data.surname}
              onChange={(e) => updateData({ surname: e.target.value.toUpperCase() })}
              placeholder="Enter your surname"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="otherNames">Other Names *</Label>
            <Input
              id="otherNames"
              value={data.otherNames}
              onChange={(e) => updateData({ otherNames: e.target.value.toUpperCase() })}
              placeholder="Enter your other names"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Gender *</Label>
            <RadioGroup
              value={data.gender}
              onValueChange={(value) => updateData({ gender: value })}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="text"
              value={data.dateOfBirth}
              onChange={(e) => updateData({ dateOfBirth: e.target.value })}
              placeholder="DD-MM-YYYY"
              required
            />
            <p className="text-xs text-gray-500">Format: DD-MM-YYYY (Important for portal login)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="placeOfBirth">Place of Birth *</Label>
            <Input
              id="placeOfBirth"
              value={data.placeOfBirth}
              onChange={(e) => updateData({ placeOfBirth: e.target.value.toUpperCase() })}
              placeholder="Enter your place of birth"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality *</Label>
            <Input
              id="nationality"
              value={data.nationality}
              onChange={(e) => updateData({ nationality: e.target.value.toUpperCase() })}
              placeholder="Enter your nationality"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="religion">Religion</Label>
            <Select value={data.religion} onValueChange={(value) => updateData({ religion: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your religion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHRISTIAN">Christian</SelectItem>
                <SelectItem value="MUSLIM">Muslim</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maritalStatus">Marital Status *</Label>
            <Select value={data.maritalStatus} onValueChange={(value) => updateData({ maritalStatus: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationalId">National ID Number (Optional)</Label>
            <Input
              id="nationalId"
              value={data.nationalId}
              onChange={(e) => updateData({ nationalId: e.target.value.toUpperCase() })}
              placeholder="Enter your national ID number (if available)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ssnitNumber">SSNIT Number (Optional)</Label>
            <Input
              id="ssnitNumber"
              value={data.ssnitNumber}
              onChange={(e) => updateData({ ssnitNumber: e.target.value.toUpperCase() })}
              placeholder="Enter your SSNIT number (if available)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="physicalChallenge">Physical Challenge (if any)</Label>
            <Input
              id="physicalChallenge"
              value={data.physicalChallenge}
              onChange={(e) => updateData({ physicalChallenge: e.target.value })}
              placeholder="Specify any physical challenge"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentIndexNumber">Student Index Number (if applicable)</Label>
            <Input
              id="studentIndexNumber"
              value={data.studentIndexNumber}
              onChange={(e) => updateData({ studentIndexNumber: e.target.value.toUpperCase() })}
              placeholder="Enter your student index number"
            />
          </div>
        </div>
      </div>

      {/* Passport Photo Upload */}
      <div className="mt-6">
        <PassportUpload 
          onPhotoUpdate={handlePhotoUpdate} 
          initialPhoto={getInitialPhotoUrl()} 
        />
      </div>
    </div>
  )
}
