"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { FileText, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Loader } from "@/components/ui/loader"
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useSystemConfig } from "@/components/system-config-provider"

export default function DeferProgramPage() {
  const { student, loading, error } = useAuth();
  const { toast } = useToast();
  const { currentAcademicYear, currentSemester } = useSystemConfig();
  const [reason, setReason] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingDeferment, setExistingDeferment] = useState(null);
  const [isLoadingDeferment, setIsLoadingDeferment] = useState(true);
  const [defermentHistory, setDefermentHistory] = useState([]);
  const [showDefermentForm, setShowDefermentForm] = useState(false);

  // Check for existing deferment requests
  useEffect(() => {
    const checkExistingDeferment = async () => {
      if (!student?.id) return;
      
      setIsLoadingDeferment(true);
      try {
        // Check deferment requests
        const defermentQuery = query(
          collection(db, "deferment-requests"),
          where("studentId", "==", student.id),
          orderBy("createdAt", "desc")
        );
        const defermentSnapshot = await getDocs(defermentQuery);
        
        if (!defermentSnapshot.empty) {
          const allRequests = defermentSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            submittedAt: doc.data().submittedAt?.toDate?.() || new Date()
          }));
          
          // Set the latest request as existing deferment
          const latestRequest = allRequests[0];
          setExistingDeferment(latestRequest);
          
          // Set all requests as history
          setDefermentHistory(allRequests);
        }

        // Also check student registration for deferment status
        const studentDoc = await getDoc(doc(db, "student-registrations", student.id));
        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          if (studentData.defermentStatus === "deferred") {
            setExistingDeferment(prev => ({
              ...prev,
              status: "approved",
              defermentStatus: "deferred",
              defermentPeriod: studentData.defermentPeriod,
              defermentReason: studentData.defermentReason,
              defermentApprovedAt: studentData.defermentApprovedAt
            }));
          } else if (studentData.defermentStatus === "reactivated") {
            setExistingDeferment(prev => ({
              ...prev,
              status: "reactivated",
              defermentStatus: "reactivated",
              reactivationDate: studentData.reactivationDate,
              returnSemester: studentData.returnSemester,
              returnAcademicYear: studentData.returnAcademicYear,
              reactivationNotes: studentData.reactivationNotes
            }));
          }
        }
      } catch (error) {
        console.error("Error checking existing deferment:", error);
      } finally {
        setIsLoadingDeferment(false);
      }
    };

    checkExistingDeferment();
  }, [student?.id]);

  if (loading || isLoadingDeferment) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (!student) {
    return <div className="p-4 text-yellow-600">No student information found. Please log in.</div>;
  }

  // Determine current semester and academic year from system config
  const currentSemesterName = currentSemester ? 
    (currentSemester.includes("First") ? "First" : 
     currentSemester.includes("Second") ? "Second" : 
     currentSemester.includes("Third") ? "Third" : "First") : "First";
  
  const academicYear = currentAcademicYear || "2024/2025";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for deferment.",
        variant: "destructive"
      });
      return;
    }

    if (!isChecked) {
      toast({
        title: "Error",
        description: "Please confirm that the information provided is valid.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit deferment request to Firebase
      const defermentData = {
        studentId: student.id,
        regNumber: student.registrationNumber || student.studentIndexNumber || "N/A",
        name: `${student.surname} ${student.otherNames}`,
        reason: reason.trim(),
        period: `${currentSemesterName} semester of ${academicYear}`,
        academicYear: academicYear,
        semester: currentSemesterName,
        level: student.currentLevel || "100",
        program: student.programme || "N/A",
        status: "pending",
        type: "student_request",
        createdAt: serverTimestamp(),
        submittedAt: serverTimestamp()
      };

      await addDoc(collection(db, "deferment-requests"), defermentData);
      
      toast({
        title: "Deferment Request Submitted Successfully! ✅",
        description: "Your deferment request has been submitted for review. You will be notified about the status within 5-7 business days.",
      });
      
      // Reset form and refresh deferment status
      setReason("");
      setIsChecked(false);
      setShowDefermentForm(false);
      
      // Refresh deferment history
      const defermentQuery = query(
        collection(db, "deferment-requests"),
        where("studentId", "==", student.id),
        orderBy("createdAt", "desc")
      );
      const defermentSnapshot = await getDocs(defermentQuery);
      
      if (!defermentSnapshot.empty) {
        const allRequests = defermentSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          submittedAt: doc.data().submittedAt?.toDate?.() || new Date()
        }));
        
        // Set the latest request as existing deferment
        const latestRequest = allRequests[0];
        setExistingDeferment(latestRequest);
        
        // Set all requests as history
        setDefermentHistory(allRequests);
      }
    } catch (error) {
      console.error("Error submitting deferment request:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "approved") {
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    } else if (status === "pending") {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
    } else if (status === "declined") {
      return <Badge className="bg-red-100 text-red-800">Declined</Badge>;
    } else if (status === "reactivated") {
      return <Badge className="bg-blue-100 text-blue-800">Reactivated</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const dateObj = date?.toDate?.() || new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-blue-100 flex items-center justify-center">
          <FileText className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Defer Program</h1>
          <p className="text-sm md:text-base text-gray-600">Submit a request to defer your academic program</p>
        </div>
      </div>

      {/* Show existing deferment status */}
      {existingDeferment && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              {existingDeferment.status === "approved" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : existingDeferment.status === "pending" ? (
                <Clock className="h-5 w-5 text-yellow-600" />
              ) : existingDeferment.status === "reactivated" ? (
                <CheckCircle className="h-5 w-5 text-blue-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <CardTitle className="text-lg">Current Deferment Status</CardTitle>
              {getStatusBadge(existingDeferment.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Period</p>
                <p className="text-base">{existingDeferment.period || existingDeferment.defermentPeriod}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Submitted</p>
                <p className="text-base">{formatDate(existingDeferment.submittedAt || existingDeferment.createdAt)}</p>
              </div>
              {existingDeferment.status === "approved" && (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-base">{formatDate(existingDeferment.defermentApprovedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reason</p>
                    <p className="text-base">{existingDeferment.reason || existingDeferment.defermentReason}</p>
                  </div>
                </>
              )}
              {existingDeferment.status === "reactivated" && (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reactivated</p>
                    <p className="text-base">{formatDate(existingDeferment.reactivationDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Return Period</p>
                    <p className="text-base">{existingDeferment.returnSemester} Semester, {existingDeferment.returnAcademicYear}</p>
                  </div>
                  {existingDeferment.reactivationNotes && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-600">Notes</p>
                      <p className="text-base">{existingDeferment.reactivationNotes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            {existingDeferment.status === "approved" && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Your deferment has been approved!</strong> You are currently deferred for this period. 
                  You will need to re-register when you return to continue your studies.
                </p>
                <div className="mt-3 space-y-2 text-xs text-green-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    <span>Academic records paused - no GPA/CQPA affected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    <span>Academic timeline shifted forward</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    <span>No classes, exams, or assessments during deferment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    <span>Student status: Deferred (not withdrawn)</span>
                  </div>
                </div>
              </div>
            )}
            {existingDeferment.status === "pending" && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Your deferment request is under review.</strong> You will be notified once a decision has been made.
                </p>
                <div className="mt-3 space-y-2 text-xs text-yellow-700">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Request submitted to Academic Affairs Office</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Decision expected within 5-7 business days</span>
                  </div>
                </div>
              </div>
            )}
            {existingDeferment.status === "reactivated" && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>You have been reactivated!</strong> Your deferment has been lifted and you can now register for 
                  {existingDeferment.returnSemester} semester of {existingDeferment.returnAcademicYear}. 
                  You can proceed with course registration.
                </p>
                <div className="mt-3 space-y-2 text-xs text-blue-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    <span>Academic timeline resumed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    <span>Academic activities restored</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    <span>Course registration required for return semester</span>
                  </div>
                  {existingDeferment.reactivationNotes && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      <span>Notes: {existingDeferment.reactivationNotes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Deferment History Section */}
      {defermentHistory.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Deferment History
            </CardTitle>
            <CardDescription>Your previous deferment requests and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {defermentHistory.map((request, index) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        request.status === "approved" ? "default" :
                        request.status === "pending" ? "outline" :
                        request.status === "declined" ? "destructive" :
                        request.status === "reactivated" ? "secondary" : "outline"
                      }>
                        {request.status === "approved" ? "Approved" :
                         request.status === "pending" ? "Pending Review" :
                         request.status === "declined" ? "Declined" :
                         request.status === "reactivated" ? "Reactivated" : request.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(request.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Period:</strong> {request.period}
                    </div>
                    <div>
                      <strong>Reason:</strong> {request.reason}
                    </div>
                    <div>
                      <strong>Type:</strong> {request.type === "student_request" ? "Student Request" : "Manual"}
                    </div>
                    {request.processedAt && (
                      <div>
                        <strong>Processed:</strong> {new Date(request.processedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Deferment Request Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submit New Deferment Request
          </CardTitle>
          <CardDescription>
            You can submit a new deferment request even if you are currently active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Submit a new deferment request for the current academic period
              </p>
              <Button 
                onClick={() => setShowDefermentForm(!showDefermentForm)}
                variant={showDefermentForm ? "outline" : "default"}
              >
                {showDefermentForm ? "Cancel" : "Submit New Request"}
              </Button>
            </div>

            {showDefermentForm && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-base md:text-lg">
                      I, <span className="font-semibold uppercase">{student.surname} {student.otherNames}</span>, 
                      a Level <span className="font-semibold">{student.currentLevel}</span> student pursuing 
                      a <span className="font-semibold">{student.programme}</span> request to defer 
                      <span className="font-semibold"> {currentSemesterName} </span> 
                      semester of the <span className="font-semibold">{academicYear}</span> academic year.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                      Reason for deferment:
                    </label>
                    <Textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Please provide detailed reasons for your deferment request..."
                      className="min-h-[150px]"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="declaration" 
                      checked={isChecked}
                      onCheckedChange={(checked) => setIsChecked(checked as boolean)}
                    />
                    <label
                      htmlFor="declaration"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I declare that the information provided above in support of my request is valid.
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !reason.trim() || !isChecked}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Submit Deferment Request
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 