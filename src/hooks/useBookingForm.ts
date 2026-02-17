import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FormData } from "@/types/booking.types";
import { defaultFormData } from "@/lib/constants/booking.constants";
import { formatDate } from "@/lib/formatters/formatDate";
import {
  saveToLocalStorage,
  getFromLocalStorage,
  BOOKING_EXPIRATION,
} from "@/lib/storage/localStorage";
import { calculateTotalPrice, calculateGrandTotalPrice } from "@/lib/math/calculate";
/**
 * Custom hook for managing booking form state and persistence
 */
export const useBookingForm = () => {
  const navigate = useNavigate();

  // Load initial form data from localStorage
  const reservationDate = getFromLocalStorage("reservationDate");
  const storedFormData = getFromLocalStorage("reservationDetails");

  // Redirect if no valid reservation date
  if (reservationDate?.days === 0) {
    navigate("/");
  }

  const initialFormData: FormData = {
    ...defaultFormData,
    ...(storedFormData || {}),
    check_in:
      formatDate(reservationDate?.check_in) || storedFormData?.check_in || "",
    check_out:
      formatDate(reservationDate?.check_out) || storedFormData?.check_out || "",
    days: reservationDate?.days || storedFormData?.days || 1,
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Keep localStorage synced with formData
  useEffect(() => {
    saveToLocalStorage("reservationDetails", formData, BOOKING_EXPIRATION);
  }, [formData]);

  // Autoload from localStorage when mounted (in case user refreshes)
  useEffect(() => {
    const saved = getFromLocalStorage("reservationDetails");
    if (saved) setFormData((prev) => ({ ...prev, ...saved }));
  }, []);

  // Redirect if no reservation date
  useEffect(() => {
    if (!reservationDate || reservationDate.days === 0) {
      navigate("/");
    }
  }, [reservationDate, navigate]);
  // Keep grandTotalPrice in sync when days or rooms/venues change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      grandTotalPrice: calculateGrandTotalPrice(
        prev.rooms,
        prev.days,
        prev.venues ?? [],
      ),
    }));
  }, [formData.days, formData.rooms, formData.venues]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const setSelectedRooms = (rooms: any[]) =>
    setFormData((prev) => {
      const totalPrice =
        calculateTotalPrice(rooms) + calculateTotalPrice(prev.venues ?? []);
      const grandTotalPrice = calculateGrandTotalPrice(
        rooms,
        prev.days,
        prev.venues ?? [],
      );
      return { ...prev, rooms, totalPrice, grandTotalPrice };
    });

  const setSelectedVenues = (venues: any[]) =>
    setFormData((prev) => {
      const totalPrice =
        calculateTotalPrice(prev.rooms) + calculateTotalPrice(venues);
      const grandTotalPrice = calculateGrandTotalPrice(
        prev.rooms,
        prev.days,
        venues,
      );
      return { ...prev, venues, totalPrice, grandTotalPrice };
    });

  const setPaymentMethod = (method: string) =>
    setFormData((prev) => ({ ...prev, paymentMethod: method }));

  const updateFormData = (updates: Partial<FormData>) =>
    setFormData((prev) => ({ ...prev, ...updates }));

  const goToStep = (step: number) =>
    setFormData((prev) => ({ ...prev, current_step: step }));

  const nextStep = () =>
    setFormData((prev) => ({ ...prev, current_step: prev.current_step + 1 }));

  const previousStep = () =>
    setFormData((prev) => ({ ...prev, current_step: prev.current_step - 1 }));

  return {
    formData,
    setFormData,
    handleInputChange,
    setSelectedRooms,
    setSelectedVenues,
    setPaymentMethod,
    updateFormData,
    goToStep,
    nextStep,
    previousStep,
  };
};;
