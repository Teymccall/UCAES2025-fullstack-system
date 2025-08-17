"use client"

import { useState } from "react"
import { X, PanelLeft, Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SidebarHelp() {
  const [showHelp, setShowHelp] = useState(false)

  if (!showHelp) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowHelp(true)}
        className="fixed bottom-4 right-4 z-50 bg-green-50 text-green-700 hover:bg-green-100"
      >
        <PanelLeft className="h-4 w-4 mr-2" />
        Sidebar Help
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-green-800">Sidebar Controls</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium text-green-700">How to Collapse/Expand Sidebar:</h3>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Click the <PanelLeft className="inline h-3 w-3" /> button in the top-left corner</li>
              <li>• Use keyboard shortcut: <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">B</kbd></li>
              <li>• On mobile: Tap the menu button</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-green-700">When Collapsed:</h3>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Only icons are visible</li>
              <li>• Hover over icons to see tooltips</li>
              <li>• More space for content</li>
            </ul>
          </div>

          <div className="pt-2 border-t">
            <Button 
              onClick={() => setShowHelp(false)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Got it!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 