"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, addDoc, query, where, orderBy, getDoc, writeBatch, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Calendar, User, FileText, Clock, RotateCcw, CheckCircle, Trash2, Loader2 } from "lucide-react";

export default function DefermentPage() {
  const [requests, setRequests] = useState([]);
  const [deferredStudents, setDeferredStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearingData, setIsClearingData] = useState(false);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentAcademicPeriod, setCurrentAcademicPeriod] = useState(null);
  const [manualForm, setManualForm] = useState({
    regNumber: "",
    name: "",
    reason: "",
    period: "",
  });
  const [reactivateForm, setReactivateForm] = useState({
    returnSemester: "",
    returnAcademicYear: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current academic period
  useEffect(() => {
    const fetchCurrentPeriod = async () => {
      try {
        const configDoc = await getDoc(doc(db, "systemConfig", "academicPeriod"));
        if (configDoc.exists()) {
          const data = configDoc.data();
          setCurrentAcademicPeriod({
            currentAcademicYear: data.currentAcademicYear,
            currentSemester: data.currentSemester
          });
        }
      } catch (error) {
        console.error("Error fetching current academic period:", error);
      }
    };
    fetchCurrentPeriod();
  }, []);

  // Fetch deferment requests and deferred students
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch deferment requests
        const requestsQuery = query(
          collection(db, "deferment-requests"), 
          orderBy("createdAt", "desc")
        );
        const requestsSnapshot = await getDocs(requestsQuery);
        const requestsData = requestsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          submittedAt: doc.data().submittedAt?.toDate?.() || new Date()
        }));
        setRequests(requestsData);

        // Fetch deferred students
        const deferredQuery = query(
          collection(db, "student-registrations"),
          where("defermentStatus", "==", "deferred")
        );
        const deferredSnapshot = await getDocs(deferredQuery);
        const deferredData = deferredSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDeferredStudents(deferredData);

        console.log("Fetched deferment requests:", requestsData);
        console.log("Fetched deferred students:", deferredData);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load deferment data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Add compliance check function
  async function checkDefermentCompliance(studentId) {
    try {
      // Check fee status
      const feeQuery = query(
        collection(db, "feeAccounts"),
        where("studentId", "==", studentId),
        where("balance", "==", 0)
      );
      const feeSnapshot = await getDocs(feeQuery);
      if (feeSnapshot.empty) {
        return { compliant: false, reason: "Outstanding fees" };
      }
  
      // Check academic status (e.g., no probation)
      const recordQuery = query(
        collection(db, "academic-records"),
        where("studentId", "==", studentId),
        where("recordType", "==", "probation"),
        where("status", "==", "active")
      );
      const recordSnapshot = await getDocs(recordQuery);
      if (!recordSnapshot.empty) {
        return { compliant: false, reason: "Active academic probation" };
      }
  
      // Additional compliance checks can be added here
      return { compliant: true };
    } catch (error) {
      console.error("Compliance check error:", error);
      return { compliant: false, reason: "System error" };
    }
  }

  // Approve or decline a request
  const handleStatusChange = async (id, status) => {
    try {
      const request = requests.find(r => r.id === id);
      if (!request) {
        toast.error("Request not found");
        return;
      }

      if (status === "approved") {
        const compliance = await checkDefermentCompliance(request.studentId);
        if (!compliance.compliant) {
          toast.error(`Cannot approve: ${compliance.reason}`);
          return;
        }
      }

      // Update the deferment request status
      await updateDoc(doc(db, "deferment-requests", id), { 
        status,
        processedAt: new Date().toISOString(),
        processedBy: "director" // Could be enhanced with actual director info
      });

      // If approved, handle student deferment
      if (status === "approved") {
        await handleStudentDeferment(request);
      }

      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast.success(`Request ${status}`);
    } catch (error) {
      console.error("Error updating request status:", error);
      toast.error("Failed to update request");
    }
  };

  // Handle student deferment when approved
  const handleStudentDeferment = async (request) => {
    try {
      console.log("Processing deferment for student:", request.studentId);
      
      // Validate request data
      if (!request.studentId || !request.period || !request.reason) {
        throw new Error("Missing required deferment information");
      }

      // 1. Update student registration status
      const studentRef = doc(db, "student-registrations", request.studentId);
      const studentDoc = await getDoc(studentRef);
      
      if (!studentDoc.exists()) {
        throw new Error("Student registration not found");
      }

      const studentData = studentDoc.data();
      const originalExpectedCompletion = studentData.expectedCompletionYear || 
        (parseInt(studentData.yearOfEntry || "2024") + 4).toString();

      await updateDoc(studentRef, {
        defermentStatus: "deferred",
        defermentPeriod: request.period,
        defermentReason: request.reason,
        defermentApprovedAt: new Date().toISOString(),
        academicStatus: "deferred",
        // Pause academic timeline
        academicTimelinePaused: true,
        pauseStartDate: new Date().toISOString(),
        // Store original expected completion for reference
        originalExpectedCompletion: originalExpectedCompletion
      });

      console.log("✅ Student registration updated");

      // 2. Create comprehensive deferment record in academic records
      const academicRecordData = {
        studentId: request.studentId,
        studentName: request.name,
        regNumber: request.regNumber,
        recordType: "deferment",
        academicYear: request.academicYear,
        semester: request.semester,
        period: request.period,
        reason: request.reason,
        status: "approved",
        approvedAt: new Date().toISOString(),
        approvedBy: "director",
        createdAt: new Date().toISOString(),
        // Academic impact tracking
        academicImpact: {
          gpaUnaffected: true,
          gradesPaused: true,
          timelineShifted: true,
          expectedCompletionExtended: true
        },
        // Tuition fee status
        tuitionStatus: {
          feesPaid: request.feesPaid || false,
          refundEligible: request.refundEligible || false,
          refundAmount: request.refundAmount || 0,
          feesRolledOver: request.feesRolledOver || false
        }
      };

      await addDoc(collection(db, "academic-records"), academicRecordData);
      console.log("✅ Academic record created");

      // 3. Update course registrations if they exist
      try {
        const courseRegQuery = query(
          collection(db, "course-registrations"),
          where("studentId", "==", request.studentId),
          where("academicYear", "==", request.academicYear),
          where("semester", "==", request.semester)
        );
        const courseRegSnapshot = await getDocs(courseRegQuery);
        
        if (!courseRegSnapshot.empty) {
          const updatePromises = courseRegSnapshot.docs.map(async (doc) => {
            await updateDoc(doc.ref, {
              status: "deferred",
              defermentReason: request.reason,
              defermentApprovedAt: new Date().toISOString(),
              // Pause academic activities
              academicActivitiesPaused: true,
              noClasses: true,
              noExams: true,
              noAssessments: true
            });
          });
          
          await Promise.all(updatePromises);
          console.log(`✅ Updated ${courseRegSnapshot.size} course registration(s)`);
        } else {
          console.log("ℹ️ No course registrations found to update");
        }
      } catch (error) {
        console.warn("⚠️ Error updating course registrations:", error);
      }

      // 4. Handle tuition fees (if applicable)
      try {
        const feeAccountQuery = query(
          collection(db, "feeAccounts"),
          where("studentId", "==", request.studentId),
          where("academicYear", "==", request.academicYear)
        );
        const feeAccountSnapshot = await getDocs(feeAccountQuery);
        
        if (!feeAccountSnapshot.empty) {
          const feeAccount = feeAccountSnapshot.docs[0];
          const feeData = feeAccount.data();
          
          // Update fee account with deferment status
          await updateDoc(doc(db, "feeAccounts", feeAccount.id), {
            defermentStatus: "deferred",
            defermentDate: new Date().toISOString(),
            // Handle fee policies
            refundEligible: feeData.totalPaid > 0 && request.earlyDeferment,
            refundAmount: feeData.totalPaid > 0 && request.earlyDeferment ? feeData.totalPaid : 0,
            feesRolledOver: !request.earlyDeferment,
            rolloverAmount: !request.earlyDeferment ? feeData.totalPaid : 0
          });
          console.log("✅ Fee account updated");
        } else {
          console.log("ℹ️ No fee account found to update");
        }
      } catch (error) {
        console.warn("⚠️ Error updating fee account:", error);
      }

      // 5. Create comprehensive notification for student
      const notificationData = {
        studentId: request.studentId,
        title: "Deferment Request Approved",
        message: `Your deferment request for ${request.period} has been approved. You are now deferred for this period. Academic activities are paused and you will resume in a future semester.`,
        type: "deferment_approved",
        read: false,
        createdAt: new Date().toISOString(),
        data: {
          defermentId: request.id,
          period: request.period,
          reason: request.reason,
          academicImpact: "Academic records paused, no GPA/CQPA affected",
          tuitionStatus: request.feesPaid ? "Fees may be rolled over to next semester" : "No tuition refund applicable",
          returnInstructions: "You will need to re-register when you return to continue your studies"
        }
      };

      await addDoc(collection(db, "notifications"), notificationData);
      console.log("✅ Notification created");

      // 6. Create audit trail entry
      const auditTrailData = {
        action: "student_deferment_approved",
        studentId: request.studentId,
        studentName: request.name,
        performedBy: "director",
        performedAt: new Date().toISOString(),
        details: {
          defermentPeriod: request.period,
          reason: request.reason,
          academicStatus: "deferred",
          tuitionHandling: request.feesPaid ? "fees_rolled_over" : "no_refund",
          academicRecordsPaused: true
        },
        impact: {
          academicTimeline: "paused",
          gpaCalculation: "unaffected",
          tuitionFees: "handled_according_to_policy",
          studentStatus: "deferred_not_withdrawn"
        }
      };

      await addDoc(collection(db, "audit-trail"), auditTrailData);
      console.log("✅ Audit trail entry created");

      console.log("🎯 Student deferment processed successfully:", request.studentId);
      toast.success("Student deferment processed successfully");
    } catch (error) {
      console.error("❌ Error processing student deferment:", error);
      toast.error(`Failed to process deferment: ${error.message}`);
      throw error;
    }
  };

  // Calculate recommended return period based on deferment details
  const calculateReturnPeriod = (defermentPeriod, defermentApprovedAt) => {
    try {
      // Extract semester and academic year from deferment period
      const periodMatch = defermentPeriod.match(/(First|Second|Third)\s+semester\s+of\s+(\d{4}\/\d{4})/);
      if (!periodMatch) {
        return { semester: "", academicYear: "" };
      }

      const deferredSemester = periodMatch[1];
      const deferredAcademicYear = periodMatch[2];
      
      // Parse the academic year
      const [startYear, endYear] = deferredAcademicYear.split('/').map(Number);
      
      // Get current academic period
      const currentYear = currentAcademicPeriod?.currentAcademicYear || "2024/2025";
      const currentSemester = currentAcademicPeriod?.currentSemester || "Second Semester";
      
      // Extract current semester name
      const currentSemesterName = currentSemester.includes("First") ? "First" : 
                                  currentSemester.includes("Second") ? "Second" : 
                                  currentSemester.includes("Third") ? "Third" : "Second";
      
      // Calculate the logical next semester after deferment
      let nextSemester, nextAcademicYear;
      
      if (deferredSemester === "First") {
        nextSemester = "Second";
        nextAcademicYear = deferredAcademicYear;
      } else if (deferredSemester === "Second") {
        nextSemester = "Third";
        nextAcademicYear = deferredAcademicYear;
      } else if (deferredSemester === "Third") {
        nextSemester = "First";
        nextAcademicYear = `${endYear}/${endYear + 1}`;
      }
      
      // Check if we should recommend the current academic period instead
      const defermentDate = new Date(defermentApprovedAt);
      const currentDate = new Date();
      const monthsPassed = (currentDate.getFullYear() - defermentDate.getFullYear()) * 12 + 
                           (currentDate.getMonth() - defermentDate.getMonth());
      
      // If more than 3 months have passed, recommend current academic period
      if (monthsPassed > 3) {
        // Use current academic period as the recommended return period
        return {
          semester: currentSemesterName,
          academicYear: currentYear
        };
      }
      
      // Otherwise, use the logical next semester
      return {
        semester: nextSemester,
        academicYear: nextAcademicYear
      };
    } catch (error) {
      console.error("Error calculating return period:", error);
      // Fallback to current academic period
      return {
        semester: currentAcademicPeriod?.currentSemester?.includes("First") ? "First" : 
                  currentAcademicPeriod?.currentSemester?.includes("Second") ? "Second" : 
                  currentAcademicPeriod?.currentSemester?.includes("Third") ? "Third" : "Second",
        academicYear: currentAcademicPeriod?.currentAcademicYear || "2024/2025"
      };
    }
  };

  // Open reactivation dialog and pre-fill form
  const handleOpenReactivateDialog = (student) => {
    setSelectedStudent(student);
    
    // Calculate recommended return period
    const recommended = calculateReturnPeriod(student.defermentPeriod, student.defermentApprovedAt);
    
    console.log("Student deferment details:", {
      defermentPeriod: student.defermentPeriod,
      defermentApprovedAt: student.defermentApprovedAt,
      calculatedReturn: recommended
    });
    
    // Set form with recommended values, ensuring correct format
    setReactivateForm({
      returnSemester: recommended.semester || "",
      returnAcademicYear: recommended.academicYear || "",
      notes: ""
    });
    
    setReactivateDialogOpen(true);
  };

  // Validate reactivation form data
  const validateReactivationData = (formData) => {
    const errors = [];
    
    if (!formData.returnSemester || !formData.returnSemester.trim()) {
      errors.push("Return semester is required");
    } else if (!["First", "Second", "Third"].includes(formData.returnSemester.trim())) {
      errors.push("Return semester must be First, Second, or Third");
    }
    
    if (!formData.returnAcademicYear || !formData.returnAcademicYear.trim()) {
      errors.push("Return academic year is required");
    } else {
      // Accept both formats: YYYY-YYYY and YYYY/YYYY
      const yearFormat = /^\d{4}[-/]\d{4}$/;
      if (!yearFormat.test(formData.returnAcademicYear.trim())) {
        errors.push("Academic year must be in format YYYY-YYYY or YYYY/YYYY (e.g., 2024/2025 or 2024-2025)");
      }
    }
    
    return errors;
  };

  // Reactivate a deferred student
  const handleReactivateStudent = async () => {
    console.log("🔍 Reactivate button clicked!");
    console.log("Selected student:", selectedStudent);
    console.log("Reactivate form:", reactivateForm);
    
    // Validate the form data
    const validationErrors = validateReactivationData(reactivateForm);
    if (validationErrors.length > 0) {
      console.log("❌ Validation errors:", validationErrors);
      toast.error(`Validation errors: ${validationErrors.join(", ")}`);
      return;
    }

    if (!selectedStudent) {
      console.log("❌ No student selected");
      toast.error("No student selected");
      return;
    }

    console.log("✅ Starting reactivation process...");
    setIsSubmitting(true);
    
    try {
      console.log("📝 Updating student registration...");
      // 1. Update student registration status
      const studentRef = doc(db, "student-registrations", selectedStudent.id);
      await updateDoc(studentRef, {
        defermentStatus: "reactivated",
        academicStatus: "active",
        reactivationDate: new Date().toISOString(),
        returnSemester: reactivateForm.returnSemester.trim(),
        returnAcademicYear: reactivateForm.returnAcademicYear.trim(),
        reactivationNotes: reactivateForm.notes.trim(),
        // Resume academic timeline
        academicTimelinePaused: false,
        pauseEndDate: new Date().toISOString(),
        // Calculate new expected completion
        newExpectedCompletion: calculateNewExpectedCompletion(selectedStudent, reactivateForm.returnAcademicYear)
      });

      console.log("📝 Creating academic record...");
      // 2. Create comprehensive reactivation record in academic records
      await addDoc(collection(db, "academic-records"), {
        studentId: selectedStudent.id,
        studentName: selectedStudent.surname + " " + selectedStudent.otherNames,
        regNumber: selectedStudent.registrationNumber || selectedStudent.studentIndexNumber,
        recordType: "reactivation",
        academicYear: reactivateForm.returnAcademicYear.trim(),
        semester: reactivateForm.returnSemester.trim(),
        notes: reactivateForm.notes.trim(),
        status: "approved",
        approvedAt: new Date().toISOString(),
        approvedBy: "director",
        createdAt: new Date().toISOString(),
        // Academic impact tracking
        academicImpact: {
          timelineResumed: true,
          academicActivitiesRestored: true,
          newExpectedCompletion: calculateNewExpectedCompletion(selectedStudent, reactivateForm.returnAcademicYear),
          timelineExtension: calculateTimelineExtension(selectedStudent)
        },
        // Tuition fee status
        tuitionStatus: {
          feesRestored: true,
          rolloverApplied: selectedStudent.feesRolledOver || false,
          newSemesterFees: "to_be_paid"
        }
      });

      console.log("📝 Restoring course registrations...");
      // 3. Restore course registrations if they exist
      try {
        const courseRegQuery = query(
          collection(db, "course-registrations"),
          where("studentId", "==", selectedStudent.id),
          where("status", "==", "deferred")
        );
        const courseRegSnapshot = await getDocs(courseRegQuery);
        
        courseRegSnapshot.forEach(async (doc) => {
          await updateDoc(doc.ref, {
            status: "active",
            reactivationDate: new Date().toISOString(),
            // Resume academic activities
            academicActivitiesPaused: false,
            noClasses: false,
            noExams: false,
            noAssessments: false
          });
        });
      } catch (error) {
        console.warn("No deferred course registrations found to restore:", error);
      }

      console.log("📝 Handling tuition fees...");
      // 4. Handle tuition fees restoration
      try {
        const feeAccountQuery = query(
          collection(db, "feeAccounts"),
          where("studentId", "==", selectedStudent.id),
          where("defermentStatus", "==", "deferred")
        );
        const feeAccountSnapshot = await getDocs(feeAccountQuery);
        
        if (!feeAccountSnapshot.empty) {
          const feeAccount = feeAccountSnapshot.docs[0];
          const feeData = feeAccount.data();
          
          // Update fee account with reactivation status
          await updateDoc(doc(db, "feeAccounts", feeAccount.id), {
            defermentStatus: "reactivated",
            reactivationDate: new Date().toISOString(),
            // Handle fee restoration
            rolloverApplied: feeData.feesRolledOver || false,
            rolloverAmount: feeData.rolloverAmount || 0,
            newSemesterFeesRequired: true
          });
        }
      } catch (error) {
        console.warn("No fee account found to update:", error);
      }

      console.log("📝 Creating notification...");
      // 5. Create comprehensive notification for student
      await addDoc(collection(db, "notifications"), {
        studentId: selectedStudent.id,
        title: "Student Reactivation",
        message: `Your deferment has been lifted. You are now reactivated and can register for ${reactivateForm.returnSemester.trim()} semester of ${reactivateForm.returnAcademicYear.trim()}. Academic activities have been restored.`,
        type: "student_reactivation",
        read: false,
        createdAt: new Date().toISOString(),
        data: {
          returnSemester: reactivateForm.returnSemester.trim(),
          returnAcademicYear: reactivateForm.returnAcademicYear.trim(),
          notes: reactivateForm.notes.trim(),
          academicImpact: "Academic timeline resumed, activities restored",
          tuitionStatus: "Fees rolled over, new semester fees to be paid",
          registrationRequired: "You must register for courses in the return semester"
        }
      });

      console.log("📝 Creating audit trail...");
      // 6. Create audit trail entry
      await addDoc(collection(db, "audit-trail"), {
        action: "student_reactivation_approved",
        studentId: selectedStudent.id,
        studentName: selectedStudent.surname + " " + selectedStudent.otherNames,
        performedBy: "director",
        performedAt: new Date().toISOString(),
        details: {
          returnPeriod: `${reactivateForm.returnSemester.trim()} semester of ${reactivateForm.returnAcademicYear.trim()} `,
          notes: reactivateForm.notes.trim(),
          academicStatus: "active",
          tuitionHandling: "fees_restored",
          academicActivitiesRestored: true
        },
        impact: {
          academicTimeline: "resumed",
          gpaCalculation: "resumed",
          tuitionFees: "restored_with_rollover",
          studentStatus: "active"
        }
      });

      console.log("✅ Reactivation completed successfully!");
      toast.success("Student reactivated successfully");
      setReactivateDialogOpen(false);
      setSelectedStudent(null);
      setReactivateForm({ returnSemester: "", returnAcademicYear: "", notes: "" });
      
      // Refresh the data
      const deferredQuery = query(
        collection(db, "student-registrations"),
        where("defermentStatus", "==", "deferred")
      );
      const deferredSnapshot = await getDocs(deferredQuery);
      const deferredData = deferredSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDeferredStudents(deferredData);
    } catch (error) {
      console.error("❌ Error reactivating student:", error);
      toast.error("Failed to reactivate student");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate new expected completion date
  const calculateNewExpectedCompletion = (student, returnAcademicYear) => {
    try {
      const originalCompletion = student.originalExpectedCompletion;
      if (originalCompletion) {
        // Add deferment duration to original completion
        const defermentDate = new Date(student.defermentApprovedAt);
        const reactivationDate = new Date();
        const defermentDuration = Math.ceil((reactivationDate - defermentDate) / (1000 * 60 * 60 * 24 * 365));
        
        const originalYear = parseInt(originalCompletion);
        return (originalYear + defermentDuration).toString();
      }
      
      // Use end year of return period - handle both dash and slash formats
      if (returnAcademicYear && returnAcademicYear.includes('-')) {
        return returnAcademicYear.split('-')[1]; // For "2025-2026" format
      } else if (returnAcademicYear && returnAcademicYear.includes('/')) {
        return returnAcademicYear.split('/')[1]; // For "2025/2026" format
      } else {
        // Fallback: extract year from current date + 1 year
        const currentYear = new Date().getFullYear();
        return (currentYear + 1).toString();
      }
    } catch (error) {
      console.error("Error calculating new expected completion:", error);
      // Fallback: extract year from current date + 1 year
      const currentYear = new Date().getFullYear();
      return (currentYear + 1).toString();
    }
  };

  // Calculate timeline extension
  const calculateTimelineExtension = (student) => {
    try {
      const defermentDate = new Date(student.defermentApprovedAt);
      const reactivationDate = new Date();
      const monthsExtension = Math.ceil((reactivationDate - defermentDate) / (1000 * 60 * 60 * 24 * 30));
      
      return {
        months: monthsExtension,
        years: Math.floor(monthsExtension / 12),
        description: `${monthsExtension} months added to academic timeline`
      };
    } catch (error) {
      console.error("Error calculating timeline extension:", error);
      return { months: 0, years: 0, description: "Timeline extension calculated" };
    }
  };

  // Manual deferment
  const handleManualDefer = async () => {
    if (!manualForm.regNumber || !manualForm.reason || !manualForm.period) {
      toast.error("All fields are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "deferment-requests"), {
        ...manualForm,
        status: "approved",
        type: "manual",
        createdAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        processedBy: "director"
      });
      toast.success("Student deferred successfully");
      setManualDialogOpen(false);
      setManualForm({ regNumber: "", name: "", reason: "", period: "" });
      // Refresh the requests list
      const q = query(collection(db, "deferment-requests"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const requestsData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        submittedAt: doc.data().submittedAt?.toDate?.() || new Date()
      }));
      setRequests(requestsData);
    } catch (error) {
      console.error("Error creating manual deferment:", error);
      toast.error("Failed to defer student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAllDefermentData = async () => {
    try {
      setIsClearingData(true);
      
      // Get all deferment-related collections
      const collections = [
        "deferment-requests",
        "audit-trail", // Clear deferment-related audit trails
        "notifications" // Clear deferment-related notifications
      ];
      
      let totalDeleted = 0;
      const batch = writeBatch(db);
      
      // Clear deferment requests
      const requestsSnapshot = await getDocs(collection(db, "deferment-requests"));
      requestsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      totalDeleted += requestsSnapshot.size;
      
      // Clear deferment-related audit trails
      const auditQuery = query(
        collection(db, "audit-trail"),
        where("action", "in", ["student_deferment_approved", "student_reactivation_approved", "manual_deferment"])
      );
      const auditSnapshot = await getDocs(auditQuery);
      auditSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      totalDeleted += auditSnapshot.size;
      
      // Clear deferment-related notifications
      const notificationQuery = query(
        collection(db, "notifications"),
        where("type", "in", ["deferment_approved", "student_reactivation"])
      );
      const notificationSnapshot = await getDocs(notificationQuery);
      notificationSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      totalDeleted += notificationSnapshot.size;
      
      // Reset deferment status in student-registrations
      const deferredStudentsQuery = query(
        collection(db, "student-registrations"),
        where("defermentStatus", "in", ["deferred", "reactivated"])
      );
      const deferredStudentsSnapshot = await getDocs(deferredStudentsQuery);
      deferredStudentsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          defermentStatus: null,
          academicStatus: "active",
          academicTimelinePaused: false,
          pauseStartDate: null,
          pauseEndDate: null,
          originalExpectedCompletion: null,
          newExpectedCompletion: null,
          reactivationDate: null,
          returnSemester: null,
          returnAcademicYear: null,
          reactivationNotes: null
        });
      });
      
      // Reset course registrations for deferred students
      const deferredCoursesQuery = query(
        collection(db, "course-registrations"),
        where("academicActivitiesPaused", "==", true)
      );
      const deferredCoursesSnapshot = await getDocs(deferredCoursesQuery);
      deferredCoursesSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          status: "active",
          academicActivitiesPaused: false,
          noClasses: false,
          noExams: false,
          noAssessments: false
        });
      });
      
      // Reset fee accounts for deferred students
      const deferredFeesQuery = query(
        collection(db, "feeAccounts"),
        where("defermentStatus", "in", ["deferred", "reactivated"])
      );
      const deferredFeesSnapshot = await getDocs(deferredFeesQuery);
      deferredFeesSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          defermentStatus: null,
          refundEligible: false,
          refundAmount: 0,
          feesRolledOver: false,
          rolloverAmount: 0,
          newSemesterFeesRequired: false
        });
      });
      
      // Commit all changes
      await batch.commit();
      
      toast.success(`Successfully cleared ${totalDeleted} deferment records and reset ${deferredStudentsSnapshot.size} student statuses`);
      
      // Refresh the data
      window.location.reload();
      
    } catch (error) {
      console.error("Error clearing deferment data:", error);
      toast.error("Failed to clear deferment data. Please try again.");
    } finally {
      setIsClearingData(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "outline",
      approved: "default",
      declined: "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deferment Management</h1>
          <p className="text-muted-foreground">Manage student deferment requests and defer students manually</p>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isClearingData}>
                {isClearingData ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Clear All Deferment Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Deferment Data</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all deferment-related data from Firebase including:
                  <br />• All deferment requests
                  <br />• Deferment audit trails
                  <br />• Deferment notifications
                  <br />• Reset all student deferment statuses to active
                  <br />• Reset all course registration statuses
                  <br />• Reset all fee account deferment statuses
                  <br /><br />
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearAllDefermentData}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Clear All Deferment Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
            <DialogTrigger asChild>
              <Button>Defer Student Manually</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Defer a Student</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="regNumber" className="text-right">Reg Number</Label>
                  <Input id="regNumber" value={manualForm.regNumber} onChange={e => setManualForm(f => ({ ...f, regNumber: e.target.value }))} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" value={manualForm.name} onChange={e => setManualForm(f => ({ ...f, name: e.target.value }))} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reason" className="text-right">Reason</Label>
                  <Input id="reason" value={manualForm.reason} onChange={e => setManualForm(f => ({ ...f, reason: e.target.value }))} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="period" className="text-right">Period</Label>
                  <Input id="period" value={manualForm.period} onChange={e => setManualForm(f => ({ ...f, period: e.target.value }))} className="col-span-3" required />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleManualDefer} disabled={isSubmitting}>
                  {isSubmitting ? "Deferring..." : "Defer Student"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Deferred Students Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Deferred Students
          </CardTitle>
          <CardDescription>Reactivate students who have been deferred</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : deferredStudents.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No deferred students found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Info</TableHead>
                  <TableHead>Deferment Details</TableHead>
                  <TableHead>Deferred Since</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deferredStudents.map(student => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{student.surname} {student.otherNames}</div>
                        <div className="text-sm text-muted-foreground">
                          {student.registrationNumber || student.studentIndexNumber} • Level {student.currentLevel}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {student.programme}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{student.defermentPeriod}</div>
                        <div className="text-sm text-muted-foreground">
                          Reason: {student.defermentReason}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(student.defermentApprovedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setSelectedStudent(student);
                          handleOpenReactivateDialog(student);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Reactivate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Deferment Requests Section */}
      <Card>
        <CardHeader>
          <CardTitle>Deferment Requests</CardTitle>
          <CardDescription>Review and manage student deferment requests</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No deferment requests found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Info</TableHead>
                  <TableHead>Request Details</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{req.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {req.regNumber} • Level {req.level}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {req.program}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {req.type === "student_request" ? "Student Request" : "Manual"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm">{req.reason}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{req.period}</div>
                        <div className="text-sm text-muted-foreground">
                          {req.academicYear} • {req.semester} Semester
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(req.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(req.submittedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {req.status === "pending" && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleStatusChange(req.id, "approved")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleStatusChange(req.id, "declined")}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                      {req.status !== "pending" && (
                        <div className="text-sm text-muted-foreground">
                          {req.status === "approved" ? "Approved" : "Declined"}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reactivate Student Dialog */}
      <Dialog open={reactivateDialogOpen} onOpenChange={setReactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reactivate Student</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedStudent && (
              <div className="p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium mb-2">Student Information</h4>
                <p className="text-sm">
                  <strong>Name:</strong> {selectedStudent.surname} {selectedStudent.otherNames}<br />
                  <strong>Reg Number:</strong> {selectedStudent.registrationNumber || selectedStudent.studentIndexNumber}<br />
                  <strong>Program:</strong> {selectedStudent.programme}<br />
                  <strong>Deferred Since:</strong> {formatDate(selectedStudent.defermentApprovedAt)}
                </p>
              </div>
            )}
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <strong>💡 Recommended Return Period:</strong> The system has automatically calculated where this student should continue based on their deferment period and current academic timeline. You can modify these values if needed.
              </p>
              {selectedStudent && (
                <div className="mt-2 p-2 bg-white rounded border">
                  <p className="text-xs text-gray-600">
                    <strong>Calculation Details:</strong><br />
                    Deferred: {selectedStudent.defermentPeriod}<br />
                    Deferred Since: {formatDate(selectedStudent.defermentApprovedAt)}<br />
                    Current Period: {currentAcademicPeriod?.currentSemester} {currentAcademicPeriod?.currentAcademicYear}<br />
                    Recommended: {reactivateForm.returnSemester} semester of {reactivateForm.returnAcademicYear}
                  </p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="returnSemester" className="text-right">Return Semester</Label>
              <Input 
                id="returnSemester" 
                value={reactivateForm.returnSemester} 
                onChange={e => setReactivateForm(f => ({ ...f, returnSemester: e.target.value }))} 
                className="col-span-3" 
                placeholder="e.g., First, Second, Third"
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="returnAcademicYear" className="text-right">Return Academic Year</Label>
              <Input 
                id="returnAcademicYear" 
                value={reactivateForm.returnAcademicYear} 
                onChange={e => setReactivateForm(f => ({ ...f, returnAcademicYear: e.target.value }))} 
                className="col-span-3" 
                placeholder="e.g., 2024/2025"
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
              <Input 
                id="notes" 
                value={reactivateForm.notes} 
                onChange={e => setReactivateForm(f => ({ ...f, notes: e.target.value }))} 
                className="col-span-3" 
                placeholder="Optional notes about reactivation"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleReactivateStudent} disabled={isSubmitting}>
              {isSubmitting ? "Reactivating..." : "Reactivate Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}