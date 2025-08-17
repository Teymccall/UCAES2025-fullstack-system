"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye, Download, FileText, ImageIcon } from "lucide-react"

interface ReceiptPreviewProps {
  receiptUrl?: string
  fileName?: string
}

export function ReceiptPreview({ receiptUrl, fileName }: ReceiptPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!receiptUrl) return null

  const isImage = fileName?.match(/\.(jpg|jpeg|png|gif)$/i)
  const isPdf = fileName?.match(/\.pdf$/i)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Receipt Preview</DialogTitle>
          <DialogDescription>{fileName || "Payment receipt"}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isImage ? (
            <div className="flex justify-center">
              <ImageIcon
                src={receiptUrl || "/placeholder.svg"}
                alt="Receipt"
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          ) : isPdf ? (
            <div className="w-full h-96 border rounded-lg">
              <iframe src={receiptUrl} className="w-full h-full rounded-lg" title="Receipt PDF" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FileText className="h-16 w-16 mb-4" />
              <p>Preview not available for this file type</p>
              <Button variant="outline" className="mt-4">
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
