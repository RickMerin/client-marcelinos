"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export function Step1() {
  const [selectedWallet, setSelectedWallet] = useState("gcash")

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <h1 className="text-lg font-semibold">Payment</h1>
        <h2 className="text-xl font-semibold">Online Payment Awareness</h2>
        <p className="text-gray-600 text-base leading-relaxed max-w-2xl mx-auto text-center">
          Guests are encouraged to pay online through secure methods such as GCash, PayMaya,
          PayPal, or bank transfer for quick and convenient transactions. Please double-check
          all payment details before sending, as the resort will not be held responsible for
          incorrect or misplaced payments.
        </p>
      </div>


      {/* Payment Options Section */}
      <div className="flex flex-col md:flex-row justify-center gap-8 max-w-5xl mx-auto">
        {/* Pay in Cash Card */}
        <Card className="flex-1 rounded-2xl shadow-sm border-gray-200">
          <CardContent className="flex items-start gap-4 py-6">
            <div className="text-3xl">💵</div>
            <div>
              <h3 className="font-semibold text-base">Pay in Cash</h3>
              <p className="text-sm text-gray-600 mt-1">
                You can also pay directly at the resort upon check-in. Please present your booking
                confirmation at the front desk.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Box */}
        <div className="flex-1 space-y-3">
          <h3 className="font-semibold text-base">Payments Method</h3>
          <div className="border rounded-md p-4 shadow-sm flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">E-Wallet</Label>

            {/* Dropdown + Logo */}
            <div className="flex items-center gap-3">
              {/* Selected Logo */}
              <img
                src={selectedWallet === "gcash" ? "src/assets/img/gcashlogo.jpg" : "src/assets/img/mayalogo.jpg"}
                alt={selectedWallet === "gcash" ? "GCash" : "Maya"}
                className="h-6 object-contain"
              />

              {/* Dropdown */}
              <select
                value={selectedWallet}
                onChange={(e) => setSelectedWallet(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="gcash">GCash</option>
                <option value="maya">Maya</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
