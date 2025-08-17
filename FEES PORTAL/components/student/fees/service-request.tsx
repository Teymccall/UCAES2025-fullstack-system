"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getAvailableServices, requestServices } from "@/lib/services"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import type { ServiceFee } from "@/lib/types"
import ServicePayment from "./service-payment"

interface ServiceRequestProps {
  onServicesSelected: (services: SelectedService[]) => void
  onRequestSubmitted?: () => void
}

interface SelectedService {
  service: ServiceFee
  quantity: number
  total: number
}

export default function ServiceRequest({ onServicesSelected, onRequestSubmitted }: ServiceRequestProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [availableServices, setAvailableServices] = useState<ServiceFee[]>([])
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<ServiceFee | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true)
      try {
        const services = await getAvailableServices(
          user?.programme, 
          user?.currentLevel
        )
        setAvailableServices(services)
      } catch (error) {
        console.error("Error fetching services:", error)
        toast({
          title: "Error",
          description: "Failed to fetch available services",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [user?.programme, user?.currentLevel, toast])

  useEffect(() => {
    onServicesSelected(selectedServices)
  }, [selectedServices, onServicesSelected])

  const handleServiceClick = (service: ServiceFee) => {
    setSelectedService(service)
    setQuantity(1)
    setIsDialogOpen(true)
  }

  const handleAddService = () => {
    if (!selectedService) return

    // Create a single service selection for direct payment
    const serviceToPay = {
      service: selectedService,
      quantity: quantity,
      total: selectedService.amount * quantity
    }

    // Set the selected service for payment
    setSelectedServices([serviceToPay])
    setShowPayment(true)
    setIsDialogOpen(false)
  }

  const handlePaymentSuccess = () => {
    // Clear selected services after successful payment
    setSelectedServices([])
    setNotes("")
    setShowPayment(false)
    
    // Notify parent component
    if (onRequestSubmitted) {
      onRequestSubmitted()
    }
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Mandatory':
        return 'bg-red-100 text-red-800'
      case 'Service':
        return 'bg-blue-100 text-blue-800'
      case 'Optional':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading services...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Available Services</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Click on any service to pay for it directly. You can adjust the quantity in the popup.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {availableServices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No services available for your programme and level.
            </div>
          ) : (
            <div className="grid gap-4">
              {availableServices.map((service) => (
                <div
                  key={service.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleServiceClick(service)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{service.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTypeColor(service.type)}>
                          {service.type}
                        </Badge>
                        <Badge variant="outline">{service.category}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ¢{(service.amount / 100).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">per unit</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Applicable to: {service.forProgrammes?.length > 0 ? service.forProgrammes.join(', ') : 'All programmes'}
                    </div>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleServiceClick(service)
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Pay Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pay for {selectedService?.name}</DialogTitle>
            <DialogDescription>
              Select the quantity for this service and pay directly.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Service Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium">{selectedService?.name}</h3>
              <p className="text-sm text-gray-600">{selectedService?.description}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">Price per unit:</span>
                <span className="font-semibold">¢{(selectedService?.amount || 0) / 100}</span>
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Total Amount */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-xl font-bold text-green-600">
                  ¢{((selectedService?.amount || 0) * quantity / 100).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Notes (Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                className="w-full p-2 border rounded-md text-sm"
                rows={2}
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddService}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Pay Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Payment Dialog */}
      {showPayment && (
        <ServicePayment
          selectedServices={selectedServices}
          notes={notes}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </>
  )
}

