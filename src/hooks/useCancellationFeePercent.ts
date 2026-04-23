import { useEffect, useState } from "react";
import { API } from "@/lib/api/apiClient";
import { endpoints } from "@/lib/api/endpoints";

const DEFAULT_CANCELLATION_FEE_PERCENT = 30;

export function useCancellationFeePercent(defaultValue = DEFAULT_CANCELLATION_FEE_PERCENT) {
  const [cancellationFeePercent, setCancellationFeePercent] =
    useState(defaultValue);

  useEffect(() => {
    let isMounted = true;

    const fetchPaymentSettings = async () => {
      try {
        const response = await API.get<{
          success: boolean;
          data?: {
            cancellation_fee_percent?: number;
          };
        }>(endpoints.paymentSettings);

        if (!isMounted) return;

        const rawPercent = Number(response?.data?.cancellation_fee_percent);
        if (!Number.isFinite(rawPercent)) {
          setCancellationFeePercent(defaultValue);
          return;
        }

        setCancellationFeePercent(Math.max(0, Math.min(100, Math.trunc(rawPercent))));
      } catch {
        if (!isMounted) return;
        setCancellationFeePercent(defaultValue);
      }
    };

    fetchPaymentSettings();

    return () => {
      isMounted = false;
    };
  }, [defaultValue]);

  return cancellationFeePercent;
}
