"use client";

import React, { useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Props {
  formData: any;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onFileUpload: (file?: File | null) => Promise<void>;
}

export function Step2({ formData, handleInputChange, onFileUpload }: Props) {
  const lastNameRef = useRef<HTMLInputElement>(null);
  const middleNameRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const refs = [
      { ref: lastNameRef, value: formData.lastName },
      { ref: middleNameRef, value: formData.middleName },
      { ref: firstNameRef, value: formData.firstName },
      { ref: genderRef, value: formData.gender },
      { ref: phoneRef, value: formData.phone },
      { ref: emailRef, value: formData.email },
      { ref: addressRef, value: formData.address },
    ];
    const firstWithValue = refs.find((r) => r.value);
    if (firstWithValue?.ref.current) {
      firstWithValue.ref.current.focus();
    }
  }, [
    formData.lastName,
    formData.middleName,
    formData.firstName,
    formData.gender,
    formData.phone,
    formData.email,
    formData.address,
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    onFileUpload(f ?? null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center mb-4">
        Personal Information
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Last Name</Label>
          <Input
            ref={lastNameRef}
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Enter Last Name"
          />
        </div>

        <div>
          <Label>Middle Name</Label>
          <Input
            ref={middleNameRef}
            name="middleName"
            value={formData.middleName}
            onChange={handleInputChange}
            placeholder="Enter Middle Name"
          />
        </div>

        <div>
          <Label>First Name</Label>
          <Input
            ref={firstNameRef}
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="Enter First Name"
          />
        </div>

        <div>
          <Label>Gender</Label>
          <Input
            ref={genderRef}
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            placeholder="Gender"
          />
        </div>

        <div className="col-span-2">
          <Label>Phone Number</Label>
          <Input
            ref={phoneRef}
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter Phone Number"
          />
        </div>

        <div className="col-span-2">
          <Label>Email Address</Label>
          <Input
            ref={emailRef}
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter Email"
          />
        </div>

        <div className="col-span-2">
          <Label>Address</Label>
          <Input
            ref={addressRef}
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter address"
          />
        </div>

        <div className="col-span-2">
          <Label>1 Valid ID</Label>
          <div className="border border-dashed p-6 rounded-md text-center">
            {formData.idFile ? (
              <img
                src={formData.idFile}
                alt="ID preview"
                loading="lazy"
                className="mx-auto max-h-40 object-contain"
              />
            ) : (
              <div className="mb-2">Upload Image</div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
