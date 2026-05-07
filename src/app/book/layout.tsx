import type { Metadata } from "next";
import { BookingProvider } from "@/components/booking/BookingProvider";
import BookingSidebar from "@/components/booking/BookingSidebar";

export const metadata: Metadata = {
  title: "Book a repair appointment",
  description:
    "Tell us about your device and pick a time. We'll have a tech ready when you arrive.",
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BookingProvider>
      <div className="bg-[var(--canvas)] min-h-[calc(100vh-64px)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <main>{children}</main>
            <BookingSidebar />
          </div>
        </div>
      </div>
    </BookingProvider>
  );
}
