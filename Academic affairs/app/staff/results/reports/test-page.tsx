"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RouteGuard } from "@/components/route-guard"

function TestCourseReportsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Results Report - Test Page</h1>
          <p className="text-muted-foreground">This is a test to verify the page loads correctly</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Interface</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>✅ If you can see this, the page routing is working correctly.</p>
            <p>✅ The RouteGuard component is functioning.</p>
            <p>✅ The UI components are loading properly.</p>
            
            <Button onClick={() => alert('Button works!')}>
              Test Button
            </Button>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold">Next Steps:</h3>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>If this page loads, the main page should work too</li>
                <li>Check browser console for any JavaScript errors</li>
                <li>Try refreshing the main reports page</li>
                <li>Ensure you're logged in as exam officer</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TestPage() {
  return (
    <RouteGuard requiredPermissions={["results_approval"]}>
      <TestCourseReportsPage />
    </RouteGuard>
  )
}