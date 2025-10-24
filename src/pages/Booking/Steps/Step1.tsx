"use client"

import React, { useState } from "react"
import { useApiMutation } from "@/lib/hooks/useApiMutation"
import { queryClient } from "@/lib/queryClient"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Step1() {
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
  })

  const createGuest = useApiMutation("post", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] })
      alert("Guest successfully added!")
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
      })
    },
    onError: (error: any) => {
      console.error(error)
      alert("Failed to add guest. Check console for details.")
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createGuest.mutate({
      url: "/guests", // Laravel endpoint: POST /api/guests
      body: formData,
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Guest Information</h1>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="middle_name">Middle Name</Label>
          <Input
            id="middle_name"
            name="middle_name"
            value={formData.middle_name}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="w-full border rounded-md p-2"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <Button type="submit" disabled={createGuest.isPending}>
          {createGuest.isPending ? "Saving..." : "Submit"}
        </Button>
      </form>
    </div>
  )
}
