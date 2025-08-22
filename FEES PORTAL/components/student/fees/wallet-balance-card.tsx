'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Wallet, RefreshCw, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { WalletService } from '@/lib/wallet-service'

export default function WalletBalanceCard() {
  const { user } = useAuth()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const walletService = new WalletService()

  const fetchWalletBalance = async () => {
    if (!user?.studentId) return
    
    try {
      setLoading(true)
      const walletBalance = await walletService.getWalletBalance(user.studentId)
      setBalance(walletBalance)
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWalletBalance()
  }, [user?.studentId])

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Wallet Balance</p>
              {loading ? (
                <div className="h-6 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">¢{(balance ? balance / 100 : 0).toLocaleString()}</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs" 
              onClick={fetchWalletBalance}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="text-xs bg-blue-600 hover:bg-blue-700"
              onClick={() => window.location.href = '/wallet'}
            >
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Top Up
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}