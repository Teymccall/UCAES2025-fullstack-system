"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RouteGuard } from "@/components/route-guard"
import { useAuth } from "@/components/auth-context"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import { Users as UsersIcon, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StaffUser {
  id: string
  uid: string
  username: string
  name: string
  email: string
  role: string
  department?: string
  position?: string
  permissions: string[]
  status: "active" | "inactive" | "suspended"
}

function UsersContent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([])
  const [search, setSearch] = useState("")

  const scopePermissions = useMemo(() => {
    // Determine which permission(s) grant access to the current officer's page
    switch (user?.role) {
      case "finance_officer":
        return ["finance_management"]
      case "exam_officer":
        return ["exam_management", "results_approval"]
      case "admissions_officer":
        return ["admission_review", "admission_approval"]
      case "registrar":
        return ["registration_management", "registration_approval"]
      case "Lecturer":
      case "staff":
        return ["course_management", "result_entry"]
      default:
        // Fallback to show staff-type users if unknown role
        return ["daily_reports"]
    }
  }, [user?.role])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError("")

        const usersRef = collection(db, "users")
        const results: StaffUser[] = []

        // Query by each scope permission and merge (Firestore supports array-contains but a single value per query)
        for (const perm of scopePermissions) {
          if (!perm) continue
          try {
            const q = query(usersRef, where("permissions", "array-contains", perm))
            const snap = await getDocs(q)
            snap.forEach((docSnap) => {
              const data = docSnap.data() as any
              results.push({ id: docSnap.id, ...data })
            })
          } catch (err) {
            console.warn("Permission query failed:", perm, err)
          }
        }

        // If no one found (older records may not have permissions), fall back to same-role users
        if (results.length === 0 && user?.role) {
          const qByRole = query(usersRef, where("role", "==", user.role as string))
          const snapByRole = await getDocs(qByRole)
          snapByRole.forEach((docSnap) => results.push({ id: docSnap.id, ...(docSnap.data() as any) }))
        }

        // De-duplicate by id
        const unique = new Map<string, StaffUser>()
        for (const u of results) unique.set(u.id, u as StaffUser)

        setStaffUsers(Array.from(unique.values()))
      } catch (err: any) {
        console.error("Error loading users:", err)
        setError("Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [scopePermissions, user?.role])

  const filtered = staffUsers.filter((u) => {
    const s = search.toLowerCase()
    return (
      u.name?.toLowerCase().includes(s) ||
      u.username?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.role?.toLowerCase().includes(s)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Users</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Test button to update registrar permissions */}
          {user?.role === 'director' && (
            <Button 
              onClick={async () => {
                try {
                  const response = await fetch('/api/update-registrar-permissions', { method: 'POST' })
                  const result = await response.json()
                  if (result.success) {
                    alert('Registrar permissions updated! Refresh the page to see changes.')
                    window.location.reload()
                  } else {
                    alert('Failed: ' + result.message)
                  }
                } catch (error) {
                  alert('Error: ' + error.message)
                }
              }}
              variant="outline"
              size="sm"
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
            >
              Update Registrar Permissions
            </Button>
          )}
          <Badge variant="secondary">Scope: {user?.role || "staff"}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users with access to your pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, username, email, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Badge>{filtered.length} user{filtered.length !== 1 ? "s" : ""}</Badge>
          </div>

          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Permissions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No users found for your scope.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name || u.username}</TableCell>
                      <TableCell>{u.username}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "Lecturer" ? "outline" : "secondary"}>{u.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.status === "active" ? "default" : u.status === "suspended" ? "destructive" : "secondary"}>
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{u.department || "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[28rem]">
                          {(u.permissions || []).slice(0, 6).map((p) => (
                            <Badge key={`${u.id}-${p}`} variant="outline">{p}</Badge>
                          ))}
                          {(u.permissions || []).length > 6 && (
                            <Badge variant="outline">+{(u.permissions || []).length - 6}</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function StaffUsersPage() {
  return (
    <RouteGuard requiredRole="staff">
      <UsersContent />
    </RouteGuard>
  )
}


