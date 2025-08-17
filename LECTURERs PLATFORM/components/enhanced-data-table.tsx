"use client"

import type React from "react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Search,
  Download,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  UserX,
  Clock,
  CheckCircle,
  GraduationCap
} from "lucide-react"
import { exportToCSV } from "@/lib/utils"

interface Column {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

interface EnhancedDataTableProps {
  data: any[]
  columns: Column[]
  title: string
  searchPlaceholder?: string
  loading?: boolean
  onAdd?: () => void
  onEdit?: (item: any) => void
  onDelete?: (item: any) => void
  onView?: (item: any) => void
  onRefresh?: () => void
  onAdminAction?: (item: any, action: string, data?: any) => void
  filters?: {
    key: string
    label: string
    options: { value: string; label: string }[]
  }[]
  showAdminActions?: boolean
  itemType?: "student" | "lecturer" | "user"
}

export function EnhancedDataTable({
  data,
  columns,
  title,
  searchPlaceholder = "Search...",
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onRefresh,
  onAdminAction,
  filters = [],
  showAdminActions = false,
  itemType = "student",
}: EnhancedDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const filteredData = data.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const matchesFilters = Object.entries(filterValues).every(([key, value]) => {
      if (!value || value === "all") return true
      return item[key] === value
    })

    return matchesSearch && matchesFilters
  })

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0

    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleExport = () => {
    const exportData = sortedData.map((item) => {
      const exportItem: any = {}
      columns.forEach((column) => {
        exportItem[column.label] = item[column.key]
      })
      return exportItem
    })
    exportToCSV(exportData, title.toLowerCase().replace(/\s+/g, "_"))
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    }
  }

  const getStatusBadge = (status: string) => {
    if (!status) {
      return <Badge className="bg-gray-100 text-gray-800">UNKNOWN</Badge>
    }
    
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      suspended: "bg-red-100 text-red-800",
      deferred: "bg-yellow-100 text-yellow-800",
    }

    return <Badge className={colors[status] || "bg-blue-100 text-blue-800"}>{status.toUpperCase()}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-500">
            {sortedData.length} of {data.length} items
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {onAdd && (
            <Button onClick={onAdd} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={filterValues[filter.key] || "all"}
            onValueChange={(value) =>
              setFilterValues((prev) => ({
                ...prev,
                [filter.key]: value === "all" ? "" : value,
              }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options.map((option, optionIndex) => (
                <SelectItem key={`${filter.key}-${option.value}-${optionIndex}`} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {Object.keys(filterValues).length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setFilterValues({})}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={column.sortable ? "cursor-pointer hover:bg-gray-50" : ""}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow key={item.id || index} className="hover:bg-gray-50">
                {columns.map((column, columnIndex) => (
                  <TableCell key={`${item.id || index}-${column.key}-${columnIndex}`}>
                    {column.render
                      ? column.render(item[column.key], item)
                      : column.key.includes("status")
                        ? getStatusBadge(item[column.key])
                        : item[column.key] !== undefined && item[column.key] !== null
                          ? String(item[column.key])
                          : "-"}
                  </TableCell>
                ))}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(item)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}

                      {/* Lecturer specific actions */}
                      <DropdownMenuItem 
                        onClick={() => onAdminAction && onAdminAction(item, 'assign-grade')} 
                        className="text-blue-600"
                      >
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Assign Grade
                      </DropdownMenuItem>

                      {/* Admin Actions */}
                      {showAdminActions && onAdminAction && (
                        <>
                          {item.status === "active" && (
                            <>
                              <DropdownMenuItem onClick={() => onAdminAction(item, "suspend")} className="text-red-600">
                                <UserX className="h-4 w-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                              {itemType === "student" && (
                                <DropdownMenuItem
                                  onClick={() => onAdminAction(item, "defer")}
                                  className="text-yellow-600"
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Defer
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                          {item.status === "suspended" && (
                            <DropdownMenuItem
                              onClick={() => onAdminAction(item, "reactivate")}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                        </>
                      )}

                      {onDelete && (
                        <DropdownMenuItem onClick={() => onDelete(item)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {sortedData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium mb-2">No data found</h3>
          <p className="text-sm">No items match your current search and filter criteria.</p>
        </div>
      )}

      {/* Pagination info */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>
          Showing {sortedData.length} of {data.length} entries
        </div>
        <div>{selectedItems.length > 0 && <span>{selectedItems.length} items selected</span>}</div>
      </div>
    </div>
  )
} 