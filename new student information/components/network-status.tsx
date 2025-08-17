"use client"

import { useEffect, useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { setupNetworkMonitoring, isOnline, getNetworkStatus } from '@/lib/network-utils'

export function NetworkStatus() {
  const [isConnected, setIsConnected] = useState(true)
  const [hasShownOfflineWarning, setHasShownOfflineWarning] = useState(false)

  useEffect(() => {
    // Check initial connection status
    const initialStatus = isOnline()
    setIsConnected(initialStatus)

    // Show warning if initially offline
    if (!initialStatus && !hasShownOfflineWarning) {
      toast({
        title: "No Internet Connection",
        description: "You appear to be offline. Please check your internet connection.",
        variant: "destructive",
        duration: 8000,
      })
      setHasShownOfflineWarning(true)
    }

    // Setup network monitoring
    const cleanup = setupNetworkMonitoring(
      // On connection restored
      () => {
        setIsConnected(true)
        setHasShownOfflineWarning(false)
        
        toast({
          title: "Connection Restored",
          description: "Your internet connection has been restored. You can continue using the system.",
          variant: "default",
          duration: 5000,
        })
      },
      // On connection lost
      () => {
        setIsConnected(false)
        
        if (!hasShownOfflineWarning) {
          toast({
            title: "Connection Lost",
            description: "Your internet connection has been lost. Please check your network settings.",
            variant: "destructive",
            duration: 8000,
          })
          setHasShownOfflineWarning(true)
        }
      }
    )

    return cleanup
  }, [hasShownOfflineWarning])

  // Don't render anything - this component only manages toast notifications
  return null
}

export default NetworkStatus























