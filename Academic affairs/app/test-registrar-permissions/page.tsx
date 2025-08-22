"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TestRegistrarPermissions() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [result, setResult] = useState<any>(null)

  const updatePermissions = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/update-registrar-permissions', {
        method: 'POST'
      })
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        alert('✅ Registrar permissions updated successfully!')
      } else {
        alert('❌ Failed: ' + data.message)
      }
    } catch (error) {
      setResult({ error: error.message })
      alert('❌ Error: ' + error.message)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test Registrar Permissions Update</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Click the button below to update the registrar permissions in the database.
          </p>
          
          <Button 
            onClick={updatePermissions}
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? 'Updating...' : 'Update Registrar Permissions'}
          </Button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2 text-blue-800">What this does:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Finds the user "mensah" in the database</li>
              <li>• Updates their permissions to include all new registrar permissions</li>
              <li>• After updating, refresh the Users page to see the changes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
