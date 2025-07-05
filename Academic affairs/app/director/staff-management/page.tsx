"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-context"
import { UserData } from "@/components/firebase-auth"
import { createUser } from "@/components/firebase-auth"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { AlertCircle, Check, Plus, RefreshCw, UserPlus, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface StaffUser extends UserData {}

export default function StaffManagement() {
  const { user } = useAuth()
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  
  // New staff form state
  const [newUserForm, setNewUserForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "staff" as const,
    department: "",
    position: "",
    status: "active" as const,
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      setError("")
      
      try {
        const q = query(collection(db, "users"), where("role", "!=", "director"))
        const querySnapshot = await getDocs(q)
        const users = querySnapshot.docs.map(doc => doc.data() as StaffUser)
        
        setStaffUsers(users)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to load staff users. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUsers()
  }, [])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewUserForm(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setNewUserForm(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleCreateUser = async () => {
    setIsSubmitting(true)
    setFormError("")
    
    try {
      // Validate form
      if (!newUserForm.username || !newUserForm.name || !newUserForm.email || !newUserForm.password) {
        setFormError("Please fill in all required fields")
        return
      }
      
      // Check if username already exists
      const usernameQuery = query(
        collection(db, "users"), 
        where("username", "==", newUserForm.username)
      )
      const usernameSnapshot = await getDocs(usernameQuery)
      
      if (!usernameSnapshot.empty) {
        setFormError("Username already exists")
        return
      }
      
      // Check if email already exists
      const emailQuery = query(
        collection(db, "users"), 
        where("email", "==", newUserForm.email)
      )
      const emailSnapshot = await getDocs(emailQuery)
      
      if (!emailSnapshot.empty) {
        setFormError("Email already exists")
        return
      }
      
      // Create new user
      const newUser = await createUser(
        newUserForm.email,
        newUserForm.password,
        {
          username: newUserForm.username,
          name: newUserForm.name,
          email: newUserForm.email,
          role: newUserForm.role,
          department: newUserForm.department,
          position: newUserForm.position,
          permissions: ["course_management", "result_entry", "daily_reports"],
          status: newUserForm.status
        }
      )
      
      // Add user to the list
      setStaffUsers(prev => [...prev, newUser])
      
      // Reset form
      setNewUserForm({
        username: "",
        name: "",
        email: "",
        password: "",
        role: "staff",
        department: "",
        position: "",
        status: "active",
      })
      
      toast.success("Staff user created successfully")
      
      // Close dialog (must be done via DOM since we're using DialogClose)
      document.querySelector('[data-dialog-close="true"]')?.click()
      
    } catch (err) {
      console.error("Error creating user:", err)
      setFormError("Failed to create user. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const toggleUserStatus = async (user: StaffUser) => {
    try {
      const newStatus = user.status === "active" ? "suspended" : "active"
      
      // Update in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      
      // Update local state
      setStaffUsers(prev => 
        prev.map(u => 
          u.uid === user.uid 
            ? { ...u, status: newStatus, updatedAt: new Date().toISOString() } 
            : u
        )
      )
      
      toast.success(`User ${user.name} ${newStatus === "active" ? "activated" : "suspended"} successfully`)
    } catch (err) {
      console.error("Error updating user status:", err)
      toast.error("Failed to update user status")
    }
  }
  
  if (!user || user.role !== "director") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You do not have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage staff accounts and permissions</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={newUserForm.username}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={newUserForm.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newUserForm.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={newUserForm.password}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Department
                </Label>
                <Input
                  id="department"
                  name="department"
                  value={newUserForm.department}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="position" className="text-right">
                  Position
                </Label>
                <Input
                  id="position"
                  name="position"
                  value={newUserForm.position}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select 
                  name="status"
                  value={newUserForm.status} 
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild data-dialog-close="true">
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateUser} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Staff
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Staff Users</CardTitle>
          <CardDescription>
            {isLoading ? "Loading staff users..." : `${staffUsers.length} staff members found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : staffUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No staff users found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffUsers.map((staffUser, index) => (
                  <TableRow key={staffUser.uid || `staff-${index}`}>
                    <TableCell className="font-medium">{staffUser.name}</TableCell>
                    <TableCell>{staffUser.username}</TableCell>
                    <TableCell>{staffUser.email}</TableCell>
                    <TableCell>{staffUser.department || "-"}</TableCell>
                    <TableCell>{staffUser.position || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          staffUser.status === "active"
                            ? "success"
                            : staffUser.status === "inactive"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {staffUser.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={staffUser.status === "active" ? "destructive" : "outline"}
                          onClick={() => toggleUserStatus(staffUser)}
                        >
                          {staffUser.status === "active" ? (
                            <>
                              <XCircle className="mr-1 h-4 w-4" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <Check className="mr-1 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
