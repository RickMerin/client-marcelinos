"use client"

import type React from "react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface PersonalInfoFormProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function Step1({ formData, handleInputChange }: PersonalInfoFormProps) {
  return (
    <div className="space-y-6">
        <h1>Room Available</h1>
        
    </div>
  )
}

