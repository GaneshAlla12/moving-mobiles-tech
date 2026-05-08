import type { Metadata } from "next";
import IdentifyPicker from "@/components/staff/IdentifyPicker";

export const metadata: Metadata = {
  title: "Who's signing in?",
  robots: { index: false, follow: false },
};

export default function IdentifyPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // Resolve in client; server doesn't strictly need it
  return <IdentifyPickerWrapper searchParams={searchParams} />;
}

async function IdentifyPickerWrapper({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  return <IdentifyPicker next={sp?.next} />;
}
