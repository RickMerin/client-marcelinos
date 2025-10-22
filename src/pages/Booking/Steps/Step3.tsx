"use client"

import type React from "react"

import { Label } from "@/components/ui/label"

interface PreferencesFormProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export function Step3({ formData, handleInputChange }: PreferencesFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="category" className="text-sm font-semibold">
          Preferred Category
        </Label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="mt-2 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select a category</option>
          <option value="technology">Technology</option>
          <option value="business">Business</option>
          <option value="health">Health</option>
          <option value="education">Education</option>
          <option value="entertainment">Entertainment</option>
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            id="newsletter"
            name="newsletter"
            type="checkbox"
            checked={formData.newsletter}
            onChange={handleInputChange}
            className="w-4 h-4 rounded border-input cursor-pointer"
          />
          <Label htmlFor="newsletter" className="text-sm font-medium cursor-pointer">
            Subscribe to our newsletter
          </Label>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="notifications"
            name="notifications"
            type="checkbox"
            checked={formData.notifications}
            onChange={handleInputChange}
            className="w-4 h-4 rounded border-input cursor-pointer"
          />
          <Label htmlFor="notifications" className="text-sm font-medium cursor-pointer">
            Enable push notifications
          </Label>
        </div>
      </div>
    </div>
  )
}
