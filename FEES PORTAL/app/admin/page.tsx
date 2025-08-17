"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  DollarSign, 
  Settings,
  Users,
  Calendar,
  Building
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ServiceFee {
  id?: string
  name: string
  description?: string
  amount: number
  type: 'Service' | 'Mandatory' | 'Optional'
  category: string
  isActive: boolean
  forProgrammes?: string[]
  forLevels?: string[]
  createdAt?: string
  updatedAt?: string
  createdBy?: string
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceFee[]>([])
  const [showAddService, setShowAddService] = useState(false)
  const [editingService, setEditingService] = useState<ServiceFee | null>(null)
  const [loading, setLoading] = useState(true)
  const [newService, setNewService] = useState<Omit<ServiceFee, 'id'>>({
    name: '',
    description: '',
    amount: 0,
    type: 'Service',
    category: '',
    isActive: true,
    forProgrammes: [],
    forLevels: []
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      // For now, we'll use mock data since the API endpoint is in Academic Affairs
      // In production, this should call the actual API
      const mockServices: ServiceFee[] = [
        {
          id: '1',
          name: 'FIELD WORK FEE',
          description: 'Field work and practical sessions',
          amount: 210,
          type: 'Service',
          category: 'Academic',
          isActive: true,
          forProgrammes: ['B.Sc. Environmental Science and Management', 'Bachelor of Agriculture'],
          forLevels: ['Level 200', 'Level 300'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'admin'
        },
        {
          id: '2',
          name: 'LABORATORY FEE',
          description: 'Laboratory equipment and materials',
          amount: 315,
          type: 'Mandatory',
          category: 'Academic',
          isActive: true,
          forProgrammes: ['B.Sc. Environmental Science and Management', 'Bachelor of Agriculture'],
          forLevels: ['Level 100', 'Level 200', 'Level 300'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'admin'
        }
      ]
      setServices(mockServices)
    } catch (error) {
      console.error('Error fetching services:', error)
      toast({
        title: "Error",
        description: "Failed to fetch services",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateService = async () => {
    try {
      if (!newService.name.trim() || newService.amount < 0 || !newService.category.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }

      // In production, this should call the actual API
      const serviceToAdd: ServiceFee = {
        ...newService,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin'
      }

      setServices([...services, serviceToAdd])
      setShowAddService(false)
      setNewService({
        name: '',
        description: '',
        amount: 0,
        type: 'Service',
        category: '',
        isActive: true,
        forProgrammes: [],
        forLevels: []
      })

      toast({
        title: "Success",
        description: "Service created successfully"
      })
    } catch (error) {
      console.error('Error creating service:', error)
      toast({
        title: "Error",
        description: "Failed to create service",
        variant: "destructive"
      })
    }
  }

  const handleEditService = (service: ServiceFee) => {
    setEditingService(service)
  }

  const handleUpdateService = async () => {
    if (!editingService) return

    try {
      const updatedServices = services.map(service => 
        service.id === editingService.id 
          ? { ...editingService, updatedAt: new Date().toISOString() }
          : service
      )
      setServices(updatedServices)
      setEditingService(null)

      toast({
        title: "Success",
        description: "Service updated successfully"
      })
    } catch (error) {
      console.error('Error updating service:', error)
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive"
      })
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const updatedServices = services.filter(service => service.id !== serviceId)
      setServices(updatedServices)

      toast({
        title: "Success",
        description: "Service deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting service:', error)
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive"
      })
    }
  }

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'Mandatory':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Service':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Optional':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
          <p className="text-gray-600 mt-2">Manage services that students can request and pay for</p>
        </div>

        {/* Add Service Button */}
        <div className="mb-6">
          <Button onClick={() => setShowAddService(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Services List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Available Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Service Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{service.name}</div>
                          {service.description && (
                            <div className="text-sm text-gray-500">{service.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getServiceTypeColor(service.type)}>
                          {service.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{service.category}</td>
                      <td className="py-3 px-4 font-medium">¢{service.amount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge className={service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditService(service)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteService(service.id!)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {services.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No services found</p>
                <p className="text-sm">Create your first service to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Service Modal */}
        <Dialog open={showAddService} onOpenChange={setShowAddService}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>
                Create a new service that students can request and pay for
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Service Name*</label>
                <Input
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  placeholder="e.g., Field Work Fee"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (¢)*</label>
                <Input
                  type="number"
                  value={newService.amount}
                  onChange={(e) => setNewService({...newService, amount: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type*</label>
                <select
                  value={newService.type}
                  onChange={(e) => setNewService({...newService, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="Service">Service</option>
                  <option value="Mandatory">Mandatory</option>
                  <option value="Optional">Optional</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category*</label>
                <Input
                  value={newService.category}
                  onChange={(e) => setNewService({...newService, category: e.target.value})}
                  placeholder="e.g., Academic, Administrative"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  placeholder="Brief description of the service"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddService(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateService}>
                <Save className="w-4 h-4 mr-2" />
                Create Service
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Service Modal */}
        <Dialog open={!!editingService} onOpenChange={() => setEditingService(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
              <DialogDescription>
                Update service details
              </DialogDescription>
            </DialogHeader>
            
            {editingService && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Service Name*</label>
                    <Input
                      value={editingService.name}
                      onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                      placeholder="e.g., Field Work Fee"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount (¢)*</label>
                    <Input
                      type="number"
                      value={editingService.amount}
                      onChange={(e) => setEditingService({...editingService, amount: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type*</label>
                    <select
                      value={editingService.type}
                      onChange={(e) => setEditingService({...editingService, type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="Service">Service</option>
                      <option value="Mandatory">Mandatory</option>
                      <option value="Optional">Optional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category*</label>
                    <Input
                      value={editingService.category}
                      onChange={(e) => setEditingService({...editingService, category: e.target.value})}
                      placeholder="e.g., Academic, Administrative"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input
                      value={editingService.description}
                      onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                      placeholder="Brief description of the service"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={editingService.isActive ? 'true' : 'false'}
                      onChange={(e) => setEditingService({...editingService, isActive: e.target.value === 'true'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setEditingService(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateService}>
                    <Save className="w-4 h-4 mr-2" />
                    Update Service
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
