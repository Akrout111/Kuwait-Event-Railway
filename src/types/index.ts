// Type definitions for Kuwait Events Platform

export type Role = "ATTENDEE" | "ORGANIZER" | "ADMIN";
export type EventStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "CANCELLED"
  | "SOLD_OUT"
  | "COMPLETED";
export type TicketType = "STANDARD" | "VIP" | "EARLY_BIRD" | "GROUP";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "REFUNDED";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
export type PaymentMethod = "KNET" | "CREDIT_CARD";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string | null;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
