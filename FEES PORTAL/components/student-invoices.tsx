'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, FileText, Calendar, CreditCard, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { formatDate } from '@/lib/utils'

interface StudentInvoice {
  id: string
  invoiceNumber: string
  items: Array<{
    description: string
    amount: number
    quantity: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  dueDate: string
  createdAt: string
  createdBy: string
  paidAt?: string
  paymentReference?: string
  notes?: string
}

export function StudentInvoices() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<StudentInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [payingInvoice, setPayingInvoice] = useState<string | null>(null)

  useEffect(() => {
    if (user?.studentId) {
      fetchStudentInvoices()
    }
  }, [user?.studentId])

  const fetchStudentInvoices = async () => {
    try {
      setLoading(true)
      
      // Note: This would typically call an API endpoint
      // For now, we'll simulate with empty data since the service needs to be server-side
      console.log('📄 Simulating invoice fetch for student:', user?.studentId)
      setInvoices([]) // Will be implemented with proper API endpoint
    } catch (error) {
      console.error('❌ Error fetching student invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayInvoice = async (invoice: StudentInvoice) => {
    try {
      setPayingInvoice(invoice.id)
      
      // Note: This would typically call an API endpoint for invoice payment
      // For now, we'll simulate the payment process
      console.log('💳 Simulating invoice payment for:', invoice.id)
      alert('Invoice payment feature will be available when connected to payment API')
      
      // This would be replaced with actual API calls like:
      // const response = await fetch('/api/pay-invoice', { method: 'POST', body: ... })
      // const result = await response.json()
      // if (result.success) { ... }
    } catch (error) {
      console.error('❌ Error processing invoice payment:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setPayingInvoice(null)
    }
  }

  const getStatusBadge = (status: string, dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const isOverdue = now > due && status === 'pending'
    
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'overdue':
      case (isOverdue ? 'pending' : ''):
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>
    }
  }

  const pendingInvoices = invoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue')
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const overdueInvoices = invoices.filter(inv => {
    const now = new Date()
    const due = new Date(inv.dueDate)
    return (now > due && inv.status === 'pending') || inv.status === 'overdue'
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Student Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Invoice Summary */}
      {totalPending > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-800">Outstanding Invoices</h3>
                <p className="text-sm text-orange-700">
                  You have {pendingInvoices.length} pending invoice(s) totaling ¢{totalPending.toLocaleString()}
                  {overdueInvoices.length > 0 && (
                    <span className="block mt-1 font-medium">
                      {overdueInvoices.length} invoice(s) are overdue
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Student Invoices ({invoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No invoices found</p>
              <p className="text-sm">You have no invoices from the Finance Office</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="border rounded-lg p-4 space-y-3">
                  {/* Invoice Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{invoice.invoiceNumber}</h4>
                      <p className="text-sm text-gray-600">
                        Created by {invoice.createdBy} on {formatDate(invoice.createdAt)}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      {getStatusBadge(invoice.status, invoice.dueDate)}
                      <p className="text-lg font-bold">¢{invoice.total.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Invoice Items */}
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-700">Items:</h5>
                    {invoice.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                        <span>{item.description} (x{item.quantity})</span>
                        <span>¢{item.total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Invoice Footer */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4" />
                        Due: {formatDate(invoice.dueDate)}
                      </div>
                      {invoice.paidAt && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Paid on {formatDate(invoice.paidAt)}
                        </div>
                      )}
                    </div>

                    {/* Payment Actions */}
                    {invoice.status === 'pending' && (
                      <Button 
                        onClick={() => handlePayInvoice(invoice)}
                        disabled={payingInvoice === invoice.id}
                        className="flex items-center gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        {payingInvoice === invoice.id ? 'Processing...' : 'Pay Now'}
                      </Button>
                    )}

                    {invoice.status === 'paid' && invoice.paymentReference && (
                      <div className="text-sm text-gray-600">
                        Reference: {invoice.paymentReference}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {invoice.notes && (
                    <div className="bg-blue-50 p-3 rounded text-sm">
                      <strong>Note:</strong> {invoice.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
