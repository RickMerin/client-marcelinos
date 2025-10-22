"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Stepper } from "./Stepper"
import { Step1 } from "./Steps/Step1"
import { Step2 } from "./Steps/Step2"
import { Step3 } from "./Steps/Step3"
import { Step4 } from "./Steps/Step4"


const STEPS = [
  { id: 1, title: "Personal Info", description: "Your basic information" },
  { id: 2, title: "Address", description: "Where you live" },
  { id: 3, title: "Preferences", description: "Your preferences" },
  { id: 4, title: "Review", description: "Confirm your details" },
]

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    newsletter: false,
    notifications: false,
    category: "",
  })

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = () => {
    console.log("Form submitted:", formData)
    alert("Form submitted successfully!")
  }

  console.log(formData)

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email
      case 2:
        return formData.street && formData.city && formData.state && formData.zipCode
      case 3:
        return formData.category
      default:
        return true
    }
  }

  return (
    <div className="w-full max-w-7xl">
      <Card className="p-8 shadow-none border-none">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>

        {/* Stepper */}
        <Stepper steps={STEPS} currentStep={currentStep} />

        {/* Form Content */}
        <div className="mt-8 mb-8">
          {currentStep === 1 && <Step1 formData={formData} handleInputChange={handleInputChange} />}
          {currentStep === 2 && <Step2 formData={formData} handleInputChange={handleInputChange} />}
          {currentStep === 3 && <Step3 formData={formData} handleInputChange={handleInputChange} />}
          {currentStep === 4 && <Step4 formData={formData} />}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-8 bg-transparent"
          >
            Previous
          </Button>

          {currentStep === STEPS.length ? (
            <Button onClick={handleSubmit} className="px-8 bg-primary hover:bg-primary/90">
              Submit
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isStepComplete(currentStep)}
              className="px-8 bg-primary hover:bg-primary/90"
            >
              Next
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
