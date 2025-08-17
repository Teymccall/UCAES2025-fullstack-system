import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Calendar, AlertTriangle } from "lucide-react"
import type { FeesData } from "@/lib/types"

interface AccountBalanceCardProps {
  feesData: FeesData
}

export function AccountBalanceCard({ feesData }: AccountBalanceCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const paymentProgress = (feesData.paidAmount / feesData.totalTuition) * 100

  return (
    <Card className="border-l-4 border-l-green-600">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Account Balance
          </span>
          <Badge className={getStatusColor(feesData.status)}>
            {feesData.status.charAt(0).toUpperCase() + feesData.status.slice(1)}
          </Badge>
        </CardTitle>
        <CardDescription>Your current fee status and payment progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Summary */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total Fees</p>
            <p className="text-lg font-bold text-gray-900">${feesData.totalTuition.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Paid Amount</p>
            <p className="text-lg font-bold text-green-600">${feesData.paidAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Outstanding</p>
            <p className="text-lg font-bold text-red-600">${feesData.outstandingBalance.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Payment Progress</span>
            <span>{Math.round(paymentProgress)}%</span>
          </div>
          <Progress value={paymentProgress} className="h-2" />
        </div>

        {/* Due Date */}
        {feesData.status !== "paid" && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-sm font-medium">Due Date</span>
            </div>
            <div className="flex items-center">
              {feesData.status === "overdue" && <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />}
              <span
                className={`text-sm font-semibold ${feesData.status === "overdue" ? "text-red-600" : "text-gray-900"}`}
              >
                {feesData.dueDate}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
