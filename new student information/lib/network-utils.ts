/**
 * Network connectivity utilities for the student information system
 */

export interface NetworkStatus {
  isOnline: boolean
  connectionType?: string
  effectiveType?: string
}

/**
 * Check if the browser is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

/**
 * Get detailed network status information
 */
export function getNetworkStatus(): NetworkStatus {
  if (typeof navigator === 'undefined') {
    return { isOnline: true }
  }

  const status: NetworkStatus = {
    isOnline: navigator.onLine
  }

  // Get connection info if available (not supported in all browsers)
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection

  if (connection) {
    status.connectionType = connection.type
    status.effectiveType = connection.effectiveType
  }

  return status
}

/**
 * Test Firebase connectivity by making a lightweight request
 */
export async function testFirebaseConnectivity(): Promise<boolean> {
  try {
    // This is a simple test to see if we can reach Firebase
    const response = await fetch('https://firestore.googleapis.com/', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    })
    
    return true
  } catch (error) {
    console.warn('Firebase connectivity test failed:', error)
    return false
  }
}

/**
 * Format error message for network issues
 */
export function getNetworkErrorMessage(error: Error): string {
  const message = error.message.toLowerCase()
  
  if (message.includes('could not reach cloud firestore backend') || 
      message.includes("backend didn't respond")) {
    return "Unable to connect to the database server. Please check your internet connection."
  }
  
  if (message.includes('network') || message.includes('timeout')) {
    return "Network connection issue detected. Please verify your internet connection and try again."
  }
  
  if (message.includes('offline')) {
    return "You appear to be offline. Please check your internet connection and try again."
  }
  
  return "A connection error occurred. Please check your internet connection and try again."
}

/**
 * Setup network status monitoring
 */
export function setupNetworkMonitoring(
  onOnline?: () => void,
  onOffline?: () => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {} // No-op for server-side
  }

  const handleOnline = () => {
    console.log('📶 Network connection restored')
    onOnline?.()
  }

  const handleOffline = () => {
    console.log('📵 Network connection lost')
    onOffline?.()
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}























