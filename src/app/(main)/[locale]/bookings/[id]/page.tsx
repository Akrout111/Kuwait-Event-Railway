import { db } from "@/lib/db";
import { getServerUser } from "@/lib/server-auth";
import { notFound, redirect } from "next/navigation";
import { BookingDetailClient } from "@/components/features/bookings/booking-detail-client";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تفاصيل الحجز — منصة فعاليات الكويت" : "Booking Details — Kuwait Events Platform",
  };
}

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ pending?: string; payment?: string }>;
}) {
  const { id, locale } = await params;
  const dbUser = await getServerUser();
  if (!dbUser) redirect(`/${locale}/login`);

  const booking = await db.booking.findUnique({
    where: { id, deletedAt: null },
    include: {
      event: {
        select: {
          id: true,
          titleAr: true,
          slug: true,
          coverImageUrl: true,
          startDate: true,
          startTime: true,
          venue: { select: { nameAr: true, nameEn: true, address: true, city: true } },
        },
      },
      tickets: {
        include: {
          ticketTier: { select: { nameAr: true, type: true, price: true } },
        },
      },
      payment: true,
    },
  });

  if (!booking || (booking.userId !== dbUser.id && dbUser.role !== "ADMIN")) {
    notFound();
  }

  const { pending } = await searchParams;

  // Serialize Date objects to ISO strings for client component
  const bookingData = {
    ...booking,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    deletedAt: booking.deletedAt?.toISOString() ?? null,
    event: {
      ...booking.event,
      startDate: booking.event.startDate.toISOString(),
    },
    tickets: booking.tickets.map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      qrCodeUrl: t.qrCodeUrl,
      ticketTier: { ...t.ticketTier },
    })),
    payment: booking.payment
      ? {
          id: booking.payment.id,
          amount: booking.payment.amount,
          status: booking.payment.status,
          method: booking.payment.method,
        }
      : null,
  };

  return <BookingDetailClient booking={bookingData} isPending={pending === "true"} />;
}
