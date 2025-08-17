"use client"

import { Spinner, SpinnerContainer } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function SpinnerTest() {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleTest = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
  }
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Spinner Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Basic Spinner</h2>
          <div className="flex items-center justify-center h-40">
            <Spinner />
          </div>
        </div>
        
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Spinner Container</h2>
          <div className="flex items-center justify-center h-40">
            <SpinnerContainer>
              Loading data...
            </SpinnerContainer>
          </div>
        </div>
        
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Custom Size</h2>
          <div className="flex items-center justify-center h-40">
            <Spinner className="w-20 h-20" />
          </div>
        </div>
        
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Interactive Test</h2>
          <div className="flex flex-col items-center justify-center h-40 gap-4">
            {isLoading ? (
              <SpinnerContainer>
                Processing request...
              </SpinnerContainer>
            ) : (
              <Button onClick={handleTest}>
                Test Loading (3 seconds)
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 