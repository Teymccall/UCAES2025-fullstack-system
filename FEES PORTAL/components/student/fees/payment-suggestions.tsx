"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, DollarSign, TrendingDown } from "lucide-react"
import type { FeesData } from "@/lib/types"

interface PaymentSuggestionsProps {
  feesData: FeesData
  onSelectAmount: (amount: number, category: string) => void
}

export function PaymentSuggestions({ feesData, onSelectAmount }: PaymentSuggestionsProps) {
  if (feesData.status === "paid") return null

  const suggestions = [
    {
      title: "Pay Full Balance",
      amount: feesData.outstandingBalance,
      description: "Clear all outstanding fees",
      category: "full",
      priority: "high",
      savings: "Avoid late fees",
    },
    {
      title: "Pay Half Balance",
      amount: Math.round(feesData.outstandingBalance / 2),
      description: "Reduce your balance significantly",
      category: "partial",
      priority: "medium",
      savings: "Show payment commitment",
    },
    {
      title: "Minimum Payment",
      amount: Math.min(500, feesData.outstandingBalance),
      description: "Keep your account active",
      category: "minimum",
      priority: "low",
      savings: "Prevent account suspension",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
          Payment Suggestions
        </CardTitle>
        <CardDescription>Smart payment options based on your current balance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium">{suggestion.title}</h4>
                <Badge className={getPriorityColor(suggestion.priority)}>{suggestion.priority}</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />${suggestion.amount.toLocaleString()}
                </span>
                <span className="flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {suggestion.savings}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectAmount(suggestion.amount, suggestion.category)}
              className="ml-4"
            >
              Select
            </Button>
          </div>
        ))}

        {/* Payment Plan Option */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">Need a Payment Plan?</h4>
              <p className="text-sm text-blue-700">Contact the finance office to set up installment payments</p>
            </div>
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
              Contact Office
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
