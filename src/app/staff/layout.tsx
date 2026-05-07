import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff",
  // Don't let search engines index the staff login page
  robots: { index: false, follow: false },
};

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
