"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, CreditCard, Smartphone, AlertCircle, File } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { useDropzone } from "react-dropzone"

interface PaymentFormProps {
  onSubmit: (data: any) => void
  outstandingBalance?: number // Optional: Outstanding balance for suggestions
  paymentSuggestions?: { label: string; value: number }[]
}

export function PaymentForm({ onSubmit, outstandingBalance, paymentSuggestions }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    method: "",
    reference: "",
    notes: "",
    receipt: null as File | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [paymentInstructions, setPaymentInstructions] = useState<string>("")
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load form data from local storage on component mount
    const savedFormData = localStorage.getItem("paymentFormData")
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData))
    }
  }, [])

  useEffect(() => {
    // Save form data to local storage whenever it changes
    localStorage.setItem("paymentFormData", JSON.stringify(formData))
  }, [formData])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    handleFile(file)
  }

  const handleFile = (file: File | null) => {
    if (file) {
      // Validate file type and size
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, receipt: "Please upload a valid image (JPEG, PNG) or PDF file" }))
        return
      }

      if (file.size > maxSize) {
        setErrors((prev) => ({ ...prev, receipt: "File size must be less than 5MB" }))
        return
      }

      setFormData((prev) => ({ ...prev, receipt: file }))
      setErrors((prev) => ({ ...prev, receipt: "" }))

      // Generate file preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFormData((prev) => ({ ...prev, receipt: null }))
      setFilePreview(null)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.category) newErrors.category = "Please select a payment category"
    if (!formData.amount) newErrors.amount = "Please enter an amount"
    if (Number.parseFloat(formData.amount) <= 0) newErrors.amount = "Amount must be greater than 0"
    if (!formData.method) newErrors.method = "Please select a payment method"
    if (!formData.reference) newErrors.reference = "Please enter a payment reference"
    if (!formData.receipt) newErrors.receipt = "Please upload a payment receipt"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      // Reset form on success
      setFormData({
        category: "",
        amount: "",
        method: "",
        reference: "",
        notes: "",
        receipt: null,
      })
      setFilePreview(null)
      localStorage.removeItem("paymentFormData") // Clear saved data on successful submission
      toast({
        title: "Payment submitted",
        description: "Your payment has been submitted for verification.",
      })
    } catch (error) {
      console.error("Payment submission error:", error)
      toast({
        title: "Payment submission failed",
        description: "An error occurred while submitting your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    switch (formData.method) {
      case "bank":
        setPaymentInstructions(
          "Please make the payment to our bank account: Account Name: University ABC, Account Number: 1234567890, Bank: XYZ Bank.  Use your student ID as payment reference.",
        )
        break
      case "momo":
        setPaymentInstructions(
          "Please send the payment to our Mobile Money account: Number: 024XXXXXXX, Name: University ABC. Use your student ID as payment reference.",
        )
        break
      default:
        setPaymentInstructions("")
    }
  }, [formData.method])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      handleFile(acceptedFiles[0])
    }
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Make Payment
        </CardTitle>
        <CardDescription>Submit your payment details for verification</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Payment Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tuition">Tuition Fees</SelectItem>
                <SelectItem value="hostel">Hostel Fees</SelectItem>
                <SelectItem value="library">Library Fines</SelectItem>
                <SelectItem value="other">Other Payments</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
          </div>

          {paymentSuggestions && paymentSuggestions.length > 0 && (
            <div className="space-y-2">
              <Label>Payment Suggestions</Label>
              <div className="flex flex-wrap gap-2">
                {paymentSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion.label}
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData((prev) => ({ ...prev, amount: suggestion.value.toFixed(2) }))}
                  >
                    {suggestion.label} ({formatCurrency(suggestion.value)})
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
            />
            {outstandingBalance && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Outstanding Balance: {formatCurrency(outstandingBalance)}</p>
                <div className="flex space-x-2 mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData((prev) => ({ ...prev, amount: outstandingBalance.toFixed(2) }))}
                  >
                    Pay Full Balance
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData((prev) => ({ ...prev, amount: (outstandingBalance / 2).toFixed(2) }))}
                  >
                    Pay Half Balance
                  </Button>
                </div>
              </div>
            )}
            {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="method">Payment Method *</Label>
            <Select
              value={formData.method}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, method: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Bank Transfer
                  </div>
                </SelectItem>
                <SelectItem value="momo">
                  <div className="flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Mobile Money
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.method && <p className="text-sm text-red-600">{errors.method}</p>}
            {paymentInstructions && <p className="text-sm text-gray-500 mt-2">{paymentInstructions}</p>}
          </div>

          {/* Payment Reference */}
          <div className="space-y-2">
            <Label htmlFor="reference">Payment Reference/Transaction ID *</Label>
            <Input
              id="reference"
              placeholder="Enter transaction reference number"
              value={formData.reference}
              onChange={(e) => setFormData((prev) => ({ ...prev, reference: e.target.value }))}
            />
            {errors.reference && <p className="text-sm text-red-600">{errors.reference}</p>}
          </div>

          {/* Receipt Upload */}
          <div className="space-y-2">
            <Label htmlFor="receipt">Payment Receipt *</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer ${isDragActive ? "border-blue-500 bg-blue-50" : ""}`}
            >
              <input
                {...getInputProps()}
                id="receipt"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
              />
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                {isDragActive ? "Drop the file here..." : "Upload your payment receipt (PDF, JPEG, PNG)"}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("receipt")?.click()}
                disabled={isDragActive}
              >
                Choose File
              </Button>
              {formData.receipt && <p className="text-sm text-green-600 mt-2">Selected: {formData.receipt.name}</p>}
              {filePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">File Preview:</p>
                  {formData.receipt.type.startsWith("image") ? (
                    <img
                      src={filePreview || "/placeholder.svg"}
                      alt="Receipt Preview"
                      className="max-h-40 mx-auto rounded-md"
                    />
                  ) : (
                    <div className="flex items-center justify-center">
                      <File className="h-6 w-6 mr-2" />
                      <p className="text-sm text-gray-600">PDF File Attached</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            {errors.receipt && <p className="text-sm text-red-600">{errors.receipt}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about this payment..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Important Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your payment will be verified within 1-2 business days. You will receive a notification once verified.
              Please ensure all details are correct before submitting.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Payment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
