import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Megaphone, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Announcement } from "@/lib/types"

interface AnnouncementsPreviewProps {
  announcements: Announcement[]
}

export function AnnouncementsPreview({ announcements }: AnnouncementsPreviewProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "important":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Megaphone className="h-5 w-5" />
          Recent Announcements
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/lecturer/announcements" className="text-green-600 hover:text-green-700">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No recent announcements</p>
          ) : (
            announcements.slice(0, 3).map((announcement) => (
              <div
                key={announcement.id}
                className="p-3 rounded-lg border border-green-100 hover:bg-green-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-medium text-green-800 text-sm line-clamp-1">{announcement.title}</h4>
                  <Badge className={getUrgencyColor(announcement.urgency)}>{announcement.urgency}</Badge>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{announcement.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>By {announcement.authorName}</span>
                  <span>{formatDate(announcement.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
