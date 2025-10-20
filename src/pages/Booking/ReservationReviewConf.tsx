import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Home, CreditCard } from "lucide-react";

const ResReviewConf: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center py-10 px-4">
      {/* Progress Bar */}
      <div className="flex justify-center items-center mb-10">
        <div className="flex items-center space-x-6">
          <div className="flex flex-col items-center text-green-600">
            <Home className="w-7 h-7 mb-1 bg-green-100 p-1 rounded-full" />
            <div className="w-16 h-[3px] bg-green-500"></div>
          </div>
          <div className="flex flex-col items-center text-green-600">
            <CalendarDays className="w-7 h-7 mb-1 bg-green-100 p-1 rounded-full" />
            <div className="w-16 h-[3px] bg-green-500"></div>
          </div>
          <div className="flex flex-col items-center text-green-400">
            <CreditCard className="w-7 h-7 mb-1 bg-green-100 p-1 rounded-full" />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-5xl">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          {/* Selected Date */}
          <Card className="shadow-md border pt-0">
            <div className="bg-green-600 text-white font-semibold text-sm px-4 py-2 rounded-t-md">
              Selected Date
            </div>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 text-sm font-medium text-gray-700">
                <div>
                  <p>Days</p>
                  <p className="font-semibold">3 Days</p>
                </div>
                <div>
                  <p>Check-In</p>
                  <p className="font-semibold">October 18, 2025</p>
                </div>
                <div>
                  <p>Check-Out</p>
                  <p className="font-semibold">October 21, 2025</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Room */}
          <Card className="shadow-md border pt-0">
            <div className="bg-green-600 text-white font-semibold text-sm px-4 py-2 rounded-t-md">
              Selected Room
            </div>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 text-sm font-medium text-gray-700">
                <div>
                  <p>Name</p>
                  <p className="font-semibold">Standard</p>
                </div>
                <div>
                  <p>Floor</p>
                  <p className="font-semibold">Second Floor</p>
                </div>
                <div>
                  <p>Bed Type</p>
                  <p className="font-semibold">Double Bed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Billing */}
          <Card className="shadow-md border pt-0">
            <div className="bg-green-600 text-white font-semibold text-sm px-4 py-2 rounded-t-md">
              Total Billing
            </div>
            <CardContent className="p-4">
              <div className="grid grid-cols-4 text-sm font-medium text-gray-700">
                <p className="font-semibold">Standard</p>
                <p>₱999</p>
                <p>3 Days</p>
                <p className="font-semibold text-green-600">₱2,997</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          <Card className="shadow-md border pt-0">
            <div className="bg-green-600 text-white font-semibold text-sm px-4 py-2 rounded-t-md">
              Personal Information
            </div>
            <CardContent className="p-4">
              <div className="text-sm space-y-1 text-gray-700">
                <p>
                  <strong>Last Name:</strong> Roa
                </p>
                <p>
                  <strong>First Name:</strong> Liezl Kaye
                </p>
                <p>
                  <strong>Middle Name:</strong> Rallos
                </p>
                <p>
                  <strong>Gender:</strong> Female
                </p>
                <p>
                  <strong>Phone Number:</strong> 0930 067 6794
                </p>
                <p>
                  <strong>Email Address:</strong> liezlkaye@gmail.com
                </p>
                <p>
                  <strong>Address:</strong> Brgy. Tabunok, Hilongos, Leyte
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Buttons */}
          <div className="flex justify-between items-center mt-2">
            <button className="text-sm font-bold underline text-gray-600 hover:text-yellow-600">
              ← Edit Details
            </button>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-lg">
              Proceed to Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResReviewConf;
