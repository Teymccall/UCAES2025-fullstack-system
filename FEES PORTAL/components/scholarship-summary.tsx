'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Award, TrendingDown, Gift } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { formatDate } from '@/lib/utils'

interface Scholarship {
  id: string
  name: string
  type: 'merit' | 'need' | 'sports' | 'academic' | 'other'
  amount: number
  status: 'awarded' | 'pending' | 'cancelled'
  year: string
  description: string
  awardedAt: string
  approvedBy: string
}

interface ScholarshipSummary {
  scholarships: Scholarship[]
  totalReduction: number
  appliedScholarships: Scholarship[]
}

export function ScholarshipSummary() {
  const { user } = useAuth()
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [scholarshipSummary, setScholarshipSummary] = useState<ScholarshipSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.studentId) {
      fetchScholarshipData()
    }
  }, [user?.studentId])

  const fetchScholarshipData = async () => {
    try {
      setLoading(true)
      
      // Note: This would typically call an API endpoint for scholarship calculations
      
      // Get all scholarships for this student
      const { collection, query, where, getDocs } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      const scholarshipsRef = collection(db, 'scholarships')
      const q = query(scholarshipsRef, where('studentId', '==', user?.studentId))
      const scholarshipSnapshot = await getDocs(q)
      
      const studentScholarships: Scholarship[] = []
      scholarshipSnapshot.forEach((doc) => {
        const data = doc.data()
        studentScholarships.push({
          id: doc.id,
          name: data.name,
          type: data.type || 'other',
          amount: data.amount || 0,
          status: data.status || 'pending',
          year: data.year || 'Unknown',
          description: data.description || '',
          awardedAt: data.awardedAt || data.createdAt || '',
          approvedBy: data.approvedBy || 'System'
        })
      })
      
      setScholarships(studentScholarships)
      
      // Calculate scholarship reduction for current fees
      const currentYear = '2025/2026' // Current academic year
      const dummyFeeAmount = 10000 // We'll use this to calculate percentage
      
      // Calculate simple total for now (would be replaced with API call)
      const totalReduction = studentScholarships
        .filter(s => s.status === 'awarded')
        .reduce((sum, s) => sum + s.amount, 0)
        
      setScholarshipSummary({
        scholarships: studentScholarships,
        totalReduction,
        appliedScholarships: studentScholarships.filter(s => s.status === 'awarded')
      })
      
      console.log('🎓 Fetched scholarship data:', {
        total: studentScholarships.length,
        awarded: studentScholarships.filter(s => s.status === 'awarded').length
      })
    } catch (error) {
      console.error('❌ Error fetching scholarship data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScholarshipTypeBadge = (type: string) => {
    const typeConfig = {
      merit: { label: 'Merit', className: 'bg-blue-100 text-blue-800' },
      need: { label: 'Need-Based', className: 'bg-green-100 text-green-800' },
      sports: { label: 'Sports', className: 'bg-orange-100 text-orange-800' },
      academic: { label: 'Academic', className: 'bg-purple-100 text-purple-800' },
      other: { label: 'Other', className: 'bg-gray-100 text-gray-800' }
    }
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.other
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'awarded':
        return <Badge className="bg-green-100 text-green-800">Awarded</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const awardedScholarships = scholarships.filter(s => s.status === 'awarded')
  const totalScholarshipValue = awardedScholarships.reduce((sum, s) => sum + s.amount, 0)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Your Scholarships
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
      {/* Scholarship Benefits Summary */}
      {totalScholarshipValue > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Gift className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800">Scholarship Benefits</h3>
                <p className="text-sm text-green-700">
                  You have received ¢{totalScholarshipValue.toLocaleString()} in scholarships
                </p>
                {scholarshipSummary && scholarshipSummary.totalReduction > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Active fee reduction: ¢{scholarshipSummary.totalReduction.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scholarships List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Your Scholarships ({scholarships.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scholarships.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scholarships found</p>
              <p className="text-sm">You have not been awarded any scholarships yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scholarships.map((scholarship) => (
                <div key={scholarship.id} className="border rounded-lg p-4 space-y-3">
                  {/* Scholarship Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{scholarship.name}</h4>
                      <p className="text-sm text-gray-600">
                        Academic Year: {scholarship.year}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      {getStatusBadge(scholarship.status)}
                      <p className="text-lg font-bold text-green-600">
                        ¢{scholarship.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Scholarship Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getScholarshipTypeBadge(scholarship.type)}
                      <span className="text-sm text-gray-600">
                        Awarded by {scholarship.approvedBy}
                      </span>
                    </div>
                    
                    {scholarship.description && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {scholarship.description}
                      </p>
                    )}
                  </div>

                  {/* Scholarship Footer */}
                  <div className="flex items-center justify-between pt-3 border-t text-sm text-gray-600">
                    <span>Awarded on {formatDate(scholarship.awardedAt)}</span>
                    
                    {scholarship.status === 'awarded' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <TrendingDown className="h-4 w-4" />
                        <span>Reduces your fees</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fee Reduction Explanation */}
          {awardedScholarships.length > 0 && (
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-800 mb-2">How Scholarships Affect Your Fees</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Scholarships automatically reduce your semester fees</li>
                <li>• The reduction is applied when you view your fees</li>
                <li>• Multiple scholarships are combined for maximum benefit</li>
                <li>• Your final fees reflect all active scholarships</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
