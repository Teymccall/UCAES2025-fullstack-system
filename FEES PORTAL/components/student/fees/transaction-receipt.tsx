'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Printer, Download, Eye } from 'lucide-react'
import { PaymentRecord } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'

interface TransactionReceiptProps {
  payment: PaymentRecord
  onPrint?: () => void
}

export function TransactionReceipt({ payment, onPrint }: TransactionReceiptProps) {
  const { user } = useAuth()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  // Log user data for troubleshooting if needed
  if (process.env.NODE_ENV === 'development') {
    console.log('TransactionReceipt - User data:', user)
    console.log('TransactionReceipt - Photo URLs:', {
      passportPhotoUrl: user?.passportPhotoUrl,
      profilePictureUrl: user?.profilePictureUrl
    })
  }
  
  // Check localStorage for user data
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const savedUser = localStorage.getItem("ucaes_user")
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          console.log('TransactionReceipt - localStorage user data:', parsedUser)
          console.log('TransactionReceipt - localStorage photo URLs:', {
            passportPhotoUrl: parsedUser.passportPhotoUrl,
            profilePictureUrl: parsedUser.profilePictureUrl
          })
        } catch (error) {
          console.error('Error parsing localStorage user:', error)
        }
      }
    }
  }, [])

  // Helper function to ensure photo URL is absolute
  const getPhotoUrl = (url?: string) => {
    if (!url) return null
    // If it's already an absolute URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    // If it's a relative path, try to make it absolute
    if (url.startsWith('/')) {
      return `${window.location.origin}${url}`
    }
    // If it's a Firebase Storage path, convert to download URL
    if (url.includes('firebasestorage.googleapis.com')) {
      return url
    }
    // For other cases, try to make it absolute
    return `${window.location.origin}/${url.replace(/^\/+/, '')}`
  }

  // Generate QR code data for verification
  const generateQRData = () => {
    return btoa(JSON.stringify({
      paymentId: payment.id,
      studentId: payment.studentId,
      amount: payment.amount,
      date: payment.date,
      status: payment.status,
      method: payment.method,
      reference: payment.reference,
      verificationCode: `UCAES-${payment.id.substring(0, 8).toUpperCase()}`
    }))
  }

  const formatCurrency = (amount: number) => {
    return `¢${amount.toLocaleString()}`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified'
    
    try {
      // Handle different possible date formats
      let date = new Date(dateString)
      
      // If invalid date, try parsing as ISO date
      if (isNaN(date.getTime())) {
        // Try different formats
        const formats = [
          dateString,
          dateString.replace(/\//g, '-'),
          dateString.replace(/\./g, '-')
        ]
        
        for (const format of formats) {
          date = new Date(format)
          if (!isNaN(date.getTime())) break
        }
      }
      
      // If still invalid, return formatted fallback
      if (isNaN(date.getTime())) {
        return dateString || 'Invalid Date'
      }
      
      return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error formatting date:', error, dateString)
      }
      return dateString || 'Invalid Date'
    }
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Not specified'
    
    try {
      // If it's already a time string (HH:MM), format it directly
      if (timeString.match(/^\d{2}:\d{2}$/)) {
        return timeString
      }
      
      // If it's a full datetime string, extract time
      const date = new Date(timeString)
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      // Fallback for time strings
      if (timeString.includes(':')) {
        const timeParts = timeString.split(':')
        if (timeParts.length >= 2) {
          const hours = timeParts[0].padStart(2, '0')
          const minutes = timeParts[1].padStart(2, '0')
          return `${hours}:${minutes}`
        }
      }
      
      return timeString
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error formatting time:', error, timeString)
      }
      return timeString || 'Not specified'
    }
  }

  const generateReceiptHTML = () => {
    const qrData = generateQRData()
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrData)}`
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${payment.reference}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.4;
            color: #333;
          }
          
          .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #166534;
            padding: 30px;
            background: white;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            position: relative;
            border-bottom: 2px solid #166534;
            padding-bottom: 20px;
          }
          
          .school-logo { 
            position: absolute; 
            top: 0; 
            left: 0; 
            width: 80px; 
            height: 80px; 
            object-fit: contain;
          }
          
          .student-photo { 
            position: absolute; 
            top: 0; 
            right: 0; 
            width: 100px; 
            height: 120px; 
            border: 2px solid #166534; 
            object-fit: cover;
            border-radius: 5px;
          }
          
          .photo-placeholder { 
            position: absolute; 
            top: 0; 
            right: 0; 
            width: 100px; 
            height: 120px; 
            border: 2px solid #ccc; 
            background-color: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            font-size: 11px;
            text-align: center;
            border-radius: 5px;
          }
          
          .school-name { 
            font-size: 24px; 
            font-weight: bold; 
            color: #166534; 
            margin: 5px 0;
          }
          
          .document-title { 
            font-size: 20px; 
            font-weight: bold; 
            margin: 10px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .subtitle { 
            font-size: 14px; 
            color: #666; 
            margin-bottom: 10px;
          }
          
          .verification-section {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
          }
          
          .qr-code {
            margin: 10px auto;
            display: block;
          }
          
          .verification-code {
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: bold;
            color: #166534;
            margin-top: 10px;
          }
          
          .payment-details {
            margin: 30px 0;
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
          }
          
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .detail-item {
            display: flex;
            flex-direction: column;
          }
          
          .detail-label {
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 5px;
          }
          
          .detail-value {
            font-size: 14px;
            color: #333;
            word-break: break-all;
          }
          
          .amount-section {
            background: #166534;
            color: white;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          
          .amount-label {
            font-size: 14px;
            margin-bottom: 5px;
          }
          
          .amount-value {
            font-size: 32px;
            font-weight: bold;
          }
          
          .verification-details {
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          
          .verification-title {
            font-size: 16px;
            font-weight: bold;
            color: #166534;
            margin-bottom: 15px;
            border-bottom: 1px solid #e9ecef;
            padding-bottom: 10px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .status-verified {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
          }
          
          .status-pending {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
          }
          
          .signatures {
            margin-top: 50px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
          
          .signature-box {
            text-align: center;
            padding: 20px;
          }
          
          .signature-line {
            border-top: 2px solid #333;
            margin-top: 40px;
            margin-bottom: 10px;
          }
          
          .signature-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            font-weight: bold;
          }
          
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            color: #666;
            border-top: 1px solid #e9ecef;
            padding-top: 20px;
          }
          
          .print-date {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 10px;
            color: #666;
          }
          
          @media print {
            body { margin: 0; }
            .receipt-container { border: none; }
            .print-date { display: block; }
          }
          
          @media screen {
            .print-date { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="print-date">
          Printed: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}
        </div>
        
        <div class="receipt-container">
          <div class="header">
            <img src="${window.location.origin}/logo.png" alt="UCAES Logo" class="school-logo" />
            <div class="school-name">UCAES</div>
            <div class="document-title">Payment Receipt</div>
            <div class="subtitle">University College of Agriculture and Environmental Studies</div>
            
            ${(user?.passportPhotoUrl || user?.profilePictureUrl) ? 
              `<img src="${getPhotoUrl(user.passportPhotoUrl || user?.profilePictureUrl)}" alt="Student Photo" class="student-photo" 
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
               <div class="photo-placeholder" style="display: none;">Student<br/>Photo</div>` :
              `<div class="photo-placeholder">Student<br/>Photo</div>`
            }
            

          </div>
          
          <div class="verification-section">
            <h3 style="margin: 0 0 10px 0; color: #166534;">Payment Verification</h3>
            <img src="${qrCodeUrl}" alt="Verification QR Code" class="qr-code" />
            <div class="verification-code">Verification Code: UCAES-${payment.id.substring(0, 8).toUpperCase()}</div>
            <div style="font-size: 11px; margin-top: 5px; color: #666;">
              Scan QR code or use verification code to validate this receipt
            </div>
          </div>
          
          <div class="payment-details">
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Student ID</div>
                <div class="detail-value">${payment.studentId}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Student Name</div>
                <div class="detail-value">${payment.studentName || user?.name || 'Not specified'}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Programme</div>
                <div class="detail-value">${user?.programme || 'Not specified'}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Current Level</div>
                <div class="detail-value">${user?.currentLevel || 'Not specified'}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Payment Date</div>
                <div class="detail-value">${formatDate(payment.paymentDate || payment.date || payment.submittedAt)}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Payment Time</div>
                <div class="detail-value">${formatTime(payment.paymentTime || payment.submittedAt)}</div>
              </div>
              
              ${payment.ghanaCardNumber ? `
                <div class="detail-item">
                  <div class="detail-label">Ghana Card Number</div>
                  <div class="detail-value">${payment.ghanaCardNumber}</div>
                </div>
              ` : ''}
              
              <div class="detail-item">
                <div class="detail-label">Payment Method</div>
                <div class="detail-value">${(payment.method || payment.paymentMethod || 'Not specified').toUpperCase()}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Reference Number</div>
                <div class="detail-value">${payment.reference || payment.referenceNumber || payment.id || 'Not specified'}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Category</div>
                <div class="detail-value">${payment.category}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Academic Year</div>
                <div class="detail-value">${payment.academicYear || '2025/2026'}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Semester</div>
                <div class="detail-value">${payment.semester || 'Not specified'}</div>
              </div>
            </div>
            
            ${payment.description ? `
              <div class="detail-item">
                <div class="detail-label">Description</div>
                <div class="detail-value">${payment.description}</div>
              </div>
            ` : ''}
          </div>
          
          <div class="amount-section">
            <div class="amount-label">Amount Paid</div>
            <div class="amount-value">${formatCurrency(payment.amount)}</div>
          </div>
          
          <div class="verification-details">
            <div class="verification-title">Verification Details</div>
            
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Payment Status</div>
                <div class="detail-value">
                  <span class="status-badge ${payment.status === 'verified' ? 'status-verified' : 'status-pending'}">
                    ${payment.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Verification Date</div>
                <div class="detail-value">${payment.reviewedAt ? formatDate(payment.reviewedAt) : 'Pending'}</div>
              </div>
              
              ${payment.bankName ? `
                <div class="detail-item">
                  <div class="detail-label">Bank Name</div>
                  <div class="detail-value">${payment.bankName}</div>
                </div>
              ` : ''}
              
              ${payment.bankReceiptNumber ? `
                <div class="detail-item">
                  <div class="detail-label">Bank Receipt Number</div>
                  <div class="detail-value">${payment.bankReceiptNumber}</div>
                </div>
              ` : ''}
              
              ${payment.tellerName ? `
                <div class="detail-item">
                  <div class="detail-label">Teller Name</div>
                  <div class="detail-value">${payment.tellerName}</div>
                </div>
              ` : ''}
              
              ${payment.branch ? `
                <div class="detail-item">
                  <div class="detail-label">Bank Branch</div>
                  <div class="detail-value">${payment.branch}</div>
                </div>
              ` : ''}
              
              ${payment.ghanaCardNumber ? `
                <div class="detail-item">
                  <div class="detail-label">Ghana Card Number</div>
                  <div class="detail-value">${payment.ghanaCardNumber}</div>
                </div>
              ` : ''}
            </div>
            
            ${payment.notes ? `
              <div class="detail-item" style="margin-top: 15px;">
                <div class="detail-label">Verification Notes</div>
                <div class="detail-value">${payment.notes}</div>
              </div>
            ` : ''}
          </div>
          
          <div class="signatures">
            <div class="signature-box">
              <div style="height: 60px; border: 1px dashed #ccc; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px;">
                Student Signature
              </div>
              <div class="signature-line"></div>
              <div class="signature-label">Student Signature</div>
              <div style="font-size: 10px; margin-top: 5px;">${payment.studentName}</div>
            </div>
            
            <div class="signature-box">
              <div style="height: 60px; border: 1px dashed #ccc; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px;">
                Director Signature
              </div>
              <div class="signature-line"></div>
              <div class="signature-label">Director Signature</div>
              <div style="font-size: 10px; margin-top: 5px;">UCAES Finance Director</div>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>UCAES Finance Department</strong></p>
            <p>This is an official payment receipt. Please keep this document for your records.</p>
            <p>For verification, visit: portal.ucaes.edu.gh or scan the QR code above</p>
            <p style="margin-top: 10px; font-size: 10px;">
              Receipt generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  const handlePrint = async () => {
    setIsPrinting(true)
    
    try {
      const printContent = generateReceiptHTML()
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(printContent)
        printWindow.document.close()
        
        // Wait for images to load before printing
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
            printWindow.close()
          }, 1000)
        }
      }
      
      onPrint?.()
    } catch (error) {
      console.error('Error printing receipt:', error)
    } finally {
      setIsPrinting(false)
    }
  }

  const handleDownload = () => {
    const printContent = generateReceiptHTML()
    const blob = new Blob([printContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${payment.reference}-${payment.date}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex gap-1">
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700 text-xs px-2 h-8">
            <Eye className="w-3 h-3 mr-1" />
            Preview
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Receipt Preview</DialogTitle>
            <DialogDescription>
              Preview your payment receipt before printing or downloading.
            </DialogDescription>
          </DialogHeader>
          <div 
            className="border rounded-lg p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: generateReceiptHTML() }}
          />
        </DialogContent>
      </Dialog>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handlePrint}
        disabled={isPrinting}
        className="text-green-600 hover:text-green-700 text-xs px-2 h-8"
      >
        <Printer className="w-3 h-3 mr-1" />
        {isPrinting ? 'Printing...' : 'Print'}
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDownload}
        className="text-purple-600 hover:text-purple-700 text-xs px-2 h-8"
      >
        <Download className="w-3 h-3 mr-1" />
        Download
      </Button>
    </div>
  )
}
