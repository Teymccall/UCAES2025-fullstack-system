import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Home, BookOpen, CreditCard } from "lucide-react"
import type { PaymentCategory } from "@/lib/types"

interface PaymentCategoriesCardProps {
  categories: PaymentCategory[]
}

export function PaymentCategoriesCard({ categories }: PaymentCategoriesCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "tuition":
        return <GraduationCap className="h-5 w-5" />
      case "hostel":
        return <Home className="h-5 w-5" />
      case "library":
        return <BookOpen className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const getStatusColor = (balance: number) => {
    if (balance === 0) return "bg-green-100 text-green-800 border-green-200"
    if (balance > 0) return "bg-red-100 text-red-800 border-red-200"
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Categories</CardTitle>
        <CardDescription>Breakdown of fees by category</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category, index) => (
          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg text-green-600">{getCategoryIcon(category.name)}</div>
              <div>
                <p className="font-medium">{category.name} Fees</p>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">${category.balance.toLocaleString()}</p>
              <Badge className={getStatusColor(category.balance)}>
                {category.balance === 0 ? "Paid" : "Outstanding"}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
