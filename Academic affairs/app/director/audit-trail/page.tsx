"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FileText, Shield, User, Clock } from "lucide-react"

export default function AuditTrail() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterAction, setFilterAction] = useState("all")
  const [filterRole, setFilterRole] = useState("all")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })

  // Mock audit data - in real app, this would come from the audit context
  const auditLogs = [
    {
      id: "1",
      action: "COURSE_ADDED",
      performedBy: "Prof. Michael Chen",
      performedByRole: "staff",
      targetStudentId: "ST001",
      details: "Added course CS 301 to student registration",
      timestamp: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      action: "STUDENT_SEARCH",
      performedBy: "Dr. Sarah Johnson",
      performedByRole: "director",
      targetStudentId: "SYSTEM",
      details: 'Searched for students with query: "John", filters: program=Computer Science',
      timestamp: "2024-01-15T09:15:00Z",
    },
    {
      id: "3",
      action: "COURSE_REMOVED",
      performedBy: "Dr. Sarah Johnson",
      performedByRole: "director",
      targetStudentId: "ST002",
      details: "Removed course MATH 201 from student registration",
      timestamp: "2024-01-14T16:45:00Z",
    },
    {
      id: "4",
      action: "STUDENT_CREATED",
      performedBy: "Dr. Sarah Johnson",
      performedByRole: "director",
      targetStudentId: "ST006",
      details: "Created new student record for Alice Cooper",
      timestamp: "2024-01-14T14:20:00Z",
    },
    {
      id: "5",
      action: "BULK_COURSE_REGISTRATION",
      performedBy: "Dr. Sarah Johnson",
      performedByRole: "director",
      targetStudentId: "ST003",
      details: "Bulk registered for course CS 401",
      timestamp: "2024-01-13T11:00:00Z",
    },
  ]

  const actionTypes = [
    "COURSE_ADDED",
    "COURSE_REMOVED",
    "STUDENT_CREATED",
    "STUDENT_UPDATED",
    "STUDENT_SEARCH",
    "BULK_COURSE_REGISTRATION",
  ]

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case "COURSE_ADDED":
      case "STUDENT_CREATED":
        return "default"
      case "COURSE_REMOVED":
        return "destructive"
      case "STUDENT_UPDATED":
        return "secondary"
      case "STUDENT_SEARCH":
        return "outline"
      case "BULK_COURSE_REGISTRATION":
        return "default"
      default:
        return "outline"
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    return role === "director" ? "default" : "secondary"
  }

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetStudentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesAction = filterAction === "all" || log.action === filterAction
    const matchesRole = filterRole === "all" || log.performedByRole === filterRole

    return matchesSearch && matchesAction && matchesRole
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Trail</h1>
        <p className="text-muted-foreground">Track all student management activities and system access</p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
            <p className="text-xs text-muted-foreground">All time activities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Actions</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter((log) => log.performedByRole === "staff").length}
            </div>
            <p className="text-xs text-muted-foreground">By staff members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Director Actions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter((log) => log.performedByRole === "director").length}
            </div>
            <p className="text-xs text-muted-foreground">By director</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Actions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                auditLogs.filter((log) => {
                  const logDate = new Date(log.timestamp).toDateString()
                  const today = new Date().toDateString()
                  return logDate === today
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Actions today</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Audit Log Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="search-audit">Search</Label>
              <Input
                id="search-audit"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by user, student ID, or details..."
              />
            </div>
            <div>
              <Label htmlFor="filter-action">Action Type</Label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actionTypes.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-role">User Role</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date-range">Date Range</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log ({filteredLogs.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action)}>{log.action.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.performedBy}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(log.performedByRole)}>{log.performedByRole}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">{log.targetStudentId}</TableCell>
                  <TableCell className="max-w-md truncate">{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No audit logs found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterAction !== "all" || filterRole !== "all"
                  ? "Try adjusting your search criteria"
                  : "No activities have been logged yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
