"use client"

interface ReviewFormProps {
  formData: any
}

export function Step4({ formData }: ReviewFormProps) {
  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-6 rounded-lg">
        <h3 className="font-semibold text-foreground mb-4">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">First Name</p>
            <p className="font-medium text-foreground">{formData.firstName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Name</p>
            <p className="font-medium text-foreground">{formData.lastName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium text-foreground">{formData.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p className="font-medium text-foreground">{formData.phone}</p>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 p-6 rounded-lg">
        <h3 className="font-semibold text-foreground mb-4">Address</h3>
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-muted-foreground">Street</p>
            <p className="font-medium text-foreground">{formData.street}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-muted-foreground">City</p>
              <p className="font-medium text-foreground">{formData.city}</p>
            </div>
            <div>
              <p className="text-muted-foreground">State</p>
              <p className="font-medium text-foreground">{formData.state}</p>
            </div>
            <div>
              <p className="text-muted-foreground">ZIP Code</p>
              <p className="font-medium text-foreground">{formData.zipCode}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 p-6 rounded-lg">
        <h3 className="font-semibold text-foreground mb-4">Preferences</h3>
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-muted-foreground">Category</p>
            <p className="font-medium text-foreground capitalize">{formData.category}</p>
          </div>
          <div className="pt-2 space-y-1">
            <p className="text-muted-foreground">Subscriptions</p>
            <p className="text-sm">
              {formData.newsletter && <span className="inline-block mr-2">✓ Newsletter</span>}
              {formData.notifications && <span className="inline-block">✓ Notifications</span>}
              {!formData.newsletter && !formData.notifications && (
                <span className="text-muted-foreground">None selected</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
