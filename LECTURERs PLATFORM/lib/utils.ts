import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Export data to a CSV file
 * @param data Array of objects to export
 * @param filename Name of the CSV file (without .csv extension)
 */
export function exportToCSV(data: any[], filename: string) {
  if (!data || !data.length) return
  
  // Get headers from the first item
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    // Add headers row
    headers.join(','),
    // Add data rows
    ...data.map(item => 
      headers.map(header => {
        // Handle values that need quotes (strings with commas, quotes, or newlines)
        const value = item[header]
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          // Escape double quotes and wrap in quotes
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  
  // Trigger download and clean up
  link.click()
  document.body.removeChild(link)
}
