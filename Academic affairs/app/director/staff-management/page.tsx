"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc, query, where, deleteDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-context"
import { UserData } from "@/components/firebase-auth"
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
  DialogDescription, 
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
import { 
  MoreHorizontal, 
  Pencil, 
  KeyRound, 
  XCircle, 
  Check, 
  Plus, 
  RefreshCw, 
  UserPlus, 
  AlertCircle,
  Trash2,
  AlertTriangle,
  Mail,
  Key
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { sendPasswordResetEmail, deleteUser } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getPermissionsByRole, ROLE_LABELS, ROLE_DESCRIPTIONS, type UserRole } from "@/lib/permissions"

interface StaffUser extends UserData {}

export default function StaffManagement() {
  const { user } = useAuth()
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false)
  const [selectedUserToDelete, setSelectedUserToDelete] = useState<StaffUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isClearingAll, setIsClearingAll] = useState(false)
  
  // New staff form state
  const [newUserForm, setNewUserForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "staff" as UserRole,
    department: "",
    position: "",
    status: "active" as const,
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  
  // Add state for password reset dialog
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [selectedUserForReset, setSelectedUserForReset] = useState<StaffUser | null>(null)
  const [resetEmail, setResetEmail] = useState("")
  const [isResetting, setIsResetting] = useState(false)

    const fetchUsers = async () => {
      setIsLoading(true)
      setError("")
      
      try {
        const q = query(collection(db, "users"), where("role", "!=", "director"))
        const querySnapshot = await getDocs(q)
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id, // Store the document ID
        ...doc.data() as StaffUser
      }))
        
        setStaffUsers(users)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to load staff users. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    
  useEffect(() => {
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
      
      // Create new user via API
      const response = await fetch('/api/auth/create-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUserForm.username,
          name: newUserForm.name,
          email: newUserForm.email,
          password: newUserForm.password,
          role: newUserForm.role,
          department: newUserForm.department,
          position: newUserForm.position,
          permissions: getPermissionsByRole(newUserForm.role),
          status: newUserForm.status
        })
      })

      const result = await response.json()

      if (!result.success) {
        setFormError(result.error || "Failed to create user")
        return
      }

      const newUser = result.user
      
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
  
  // Update the toggleUserStatus function to handle status changes and trigger logout
  const toggleUserStatus = async (user: StaffUser) => {
    try {
      const newStatus = user.status === "active" ? "suspended" : "active"
      
      // Update in Firestore - this will automatically trigger logout for the user if suspended
      await updateDoc(doc(db, "users", user.id), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      
      // Update local state
      setStaffUsers(prev => 
        prev.map(u => 
          u.id === user.id 
            ? { ...u, status: newStatus, updatedAt: new Date().toISOString() } 
            : u
        )
      )
      
      const actionType = newStatus === "active" ? "activated" : "suspended"
      toast.success(`${user.name || user.username} has been ${actionType}`, {
        description: newStatus === "suspended" 
          ? "User will be logged out immediately if they are currently logged in." 
          : "User can now login to the system again."
      })
    } catch (err) {
      console.error("Error updating user status:", err)
      toast.error("Failed to update user status")
    }
  }

  const handleEditUser = (user: StaffUser) => {
    // Set the form with current user values for editing
    setNewUserForm({
      username: user.username || "",
      name: user.name || "",
      email: user.email || "",
      password: "", // Empty for editing
      role: (user.role as "staff" | "Lecturer") || "staff",
      department: user.department || "",
      position: user.position || "",
      status: (user.status as "active" | "inactive" | "suspended") || "active",
    })
    
    // Open the dialog (needs to be done programmatically)
    document.getElementById("edit-user-trigger")?.click()
  }
  
  // Update the reset password function to log out the user when password is changed
  const handleResetPassword = (user: StaffUser) => {
    setSelectedUserForReset(user)
    setResetEmail(user.email || '')
    setIsResetDialogOpen(true)
  }

  // Send password reset email for all user types
  const sendPasswordReset = async () => {
    if (!selectedUserForReset || !resetEmail.trim()) {
      toast.error("Email address is required")
      return
    }

    setIsResetting(true)
    try {
      // Check if this user has a stored password hash (new API-created users)
      // or if they're Firebase Auth users (old lecturer accounts)
      const userRef = doc(db, "users", selectedUserForReset.id)
      const userDoc = await getDoc(userRef)
      const userData = userDoc.data()
      
      if (userData?.password) {
        // This is an API-created user with hashed password - use our email reset system
        console.log("Sending password reset email for API-created user")
        
        // Call our email reset API
        const response = await fetch('/api/auth/send-reset-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: selectedUserForReset.id,
            email: resetEmail
          })
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "Failed to send reset email")
        }

        // Handle email success or fallback
        if (result.emailError) {
          // Email failed, show the reset link for manual sharing
          toast.success(`Password reset link generated!`, {
            description: `Email failed. Copy this link and send to user: ${result.resetLink}`,
            duration: 10000 // Show longer for copying
          })
        } else if (result.resetLink) {
          // Development mode - show the reset link for testing
          toast.success(`Password reset email sent to ${resetEmail}!`, {
            description: `✅ Email sent successfully. For testing: ${result.resetLink}`,
            duration: 8000
          })
        } else {
          // Email sent successfully
          toast.success(`Password reset email sent to ${resetEmail}`, {
            description: "User will receive an email with a link to set their new password."
          })
        }
      } else {
        // This is a Firebase Auth user - use Firebase password reset
        console.log("Sending Firebase Auth password reset email")
        await sendPasswordResetEmail(auth, resetEmail)
        
        // Update a flag in the user document to indicate password was reset
        await updateDoc(doc(db, "users", selectedUserForReset.id), {
          passwordResetAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          email: resetEmail // Update email if it was changed
        })
        
        toast.success(`Password reset email sent to ${resetEmail}`, {
          description: "User will receive an email to reset their password."
        })
      }
      
      setIsResetDialogOpen(false)
      
      // Update the email in our local state if it was changed
      if (resetEmail !== selectedUserForReset.email) {
        setStaffUsers(prev => prev.map(u => 
          u.id === selectedUserForReset.id 
            ? { ...u, email: resetEmail, updatedAt: new Date().toISOString() } 
            : u
        ))
      }
    } catch (err) {
      console.error("Error sending reset email:", err)
      toast.error("Failed to send password reset email")
    } finally {
      setIsResetting(false)
    }
  }
  
  // Update the delete user function to ensure users are properly logged out when deleted
  const deleteStaffUser = async (staffUser: StaffUser) => {
    console.log("🗑️ Attempting to delete user:", {
      id: staffUser.id,
      name: staffUser.name,
      username: staffUser.username,
      role: staffUser.role,
      hasId: !!staffUser.id
    })
    
    if (!staffUser.id) {
      console.error("❌ No ID found for user:", staffUser)
      toast.error("Cannot delete user: Missing document ID")
      return
    }
    
    setIsDeleting(true)
    try {
      console.log("🔥 Deleting user from Firestore with ID:", staffUser.id)
      
      // Delete from Firestore - this will automatically trigger logout for the user
      await deleteDoc(doc(db, "users", staffUser.id))
      
      console.log("✅ User deleted from Firestore, updating local state")
      
      // Remove from local state
      setStaffUsers(prevUsers => prevUsers.filter(u => u.id !== staffUser.id))
      
      toast.success(`${staffUser.name || staffUser.username} has been deleted successfully`, {
        description: "User will be logged out immediately if they are currently logged in."
      })
      setDeleteDialogOpen(false)
      setSelectedUserToDelete(null)
      
      console.log("✅ Delete operation completed successfully")
    } catch (error) {
      console.error("❌ Error deleting user:", error)
      console.error("❌ Error details:", {
        message: error.message,
        code: error.code,
        userId: staffUser.id
      })
      toast.error(`Failed to delete user: ${error.message || "Unknown error"}`)
    } finally {
      setIsDeleting(false)
    }
  }
  
  // Add clear all function
  const clearAllStaffUsers = async () => {
    setIsClearingAll(true)
    try {
      // Get all non-director users
      const q = query(collection(db, "users"), where("role", "!=", "director"))
      const querySnapshot = await getDocs(q)
      
      // Delete each user document
      const deletePromises = querySnapshot.docs.map(docSnapshot => {
        return deleteDoc(doc(db, "users", docSnapshot.id))
      })
      
      await Promise.all(deletePromises)
      
      // Clear local state
      setStaffUsers([])
      setClearAllDialogOpen(false)
      
      toast.success("All staff accounts have been cleared successfully")
    } catch (error) {
      console.error("Error clearing users:", error)
      toast.error("Failed to clear all users. Please try again.")
    } finally {
      setIsClearingAll(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage staff accounts and permissions</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Clear All Button with Alert Dialog */}
          <AlertDialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={staffUsers.length === 0 || isLoading}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Staff
            </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Staff Accounts</AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="flex items-start gap-2 mt-2 text-red-500">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>
                      This action cannot be undone. This will permanently delete all staff and lecturer accounts from the system.
                      Your account as director will remain untouched.
                    </span>
              </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={clearAllStaffUsers}
                  disabled={isClearingAll}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isClearingAll ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Clearing...
                  </>
                ) : (
                  <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear All Staff
                  </>
                )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Existing Add New Staff Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Staff or Lecturer</DialogTitle>
            </DialogHeader>
            
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select 
                  name="role"
                  value={newUserForm.role} 
                  onValueChange={(value) => handleSelectChange("role", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff Member</SelectItem>
                    <SelectItem value="Lecturer">Lecturer</SelectItem>
                    <SelectItem value="finance_officer">Finance Officer</SelectItem>
                    <SelectItem value="exam_officer">Exam Officer</SelectItem>
                    <SelectItem value="admissions_officer">Admissions Officer</SelectItem>
                    <SelectItem value="registrar">Registrar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                    Create {ROLE_LABELS[newUserForm.role] || newUserForm.role}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
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
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffUsers.map((staffUser, index) => (
                  <TableRow key={staffUser.id || `staff-${index}`}>
                    <TableCell className="font-medium">{staffUser.name}</TableCell>
                    <TableCell>{staffUser.username}</TableCell>
                    <TableCell>{staffUser.email}</TableCell>
                    <TableCell>{staffUser.department || "-"}</TableCell>
                    <TableCell>{staffUser.position || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={staffUser.role === "Lecturer" ? "outline" : "secondary"}>
                        {ROLE_LABELS[staffUser.role as UserRole] || staffUser.role}
                      </Badge>
                    </TableCell>
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
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditUser(staffUser)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetPassword(staffUser)}>
                              <KeyRound className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUserToDelete(staffUser);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUserToDelete?.name || selectedUserToDelete?.username}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedUserToDelete && deleteStaffUser(selectedUserToDelete)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Reset Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password for {selectedUserForReset?.name || selectedUserForReset?.username}</DialogTitle>
            <DialogDescription>
              Enter the email address for {selectedUserForReset?.name || selectedUserForReset?.username}.
              A password reset link will be sent to this email address.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reset-email" className="text-right">
                Email Address
              </Label>
              <Input
                id="reset-email"
                name="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild data-dialog-close="true">
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={sendPasswordReset} disabled={isResetting}>
              {isResetting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Send Reset Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
