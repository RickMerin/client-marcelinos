"use client"

import type React from "react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface AddressFormProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function Step2({ formData, handleInputChange }: AddressFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="street" className="text-sm font-semibold">
          Street Address
        </Label>
        <Input
          id="street"
          name="street"
          value={formData.street}
          onChange={handleInputChange}
          placeholder="123 Main Street"
          className="mt-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city" className="text-sm font-semibold">
            City
          </Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="New York"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="state" className="text-sm font-semibold">
            State
          </Label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="NY"
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="zipCode" className="text-sm font-semibold">
          ZIP Code
        </Label>
        <Input
          id="zipCode"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleInputChange}
          placeholder="10001"
          className="mt-2"
        />
      </div>
    </div>
  )
}
