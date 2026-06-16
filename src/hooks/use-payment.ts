"use client";

import { useMutation } from "@tanstack/react-query";
import type { InitiatePaymentInput } from "@/lib/validators/payment-schema";

export function useInitiatePayment() {
  return useMutation({
    mutationFn: async (data: InitiatePaymentInput) => {
      const res = await fetch("/api/v1/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Failed to initiate payment");
      return json;
    },
  });
}
