"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

/**
 * Hides the customer-facing Footer on staff routes so the staff portal
 * feels like its own app (no "Visit / Contact / Explore" links at the
 * bottom). Footer is unchanged for customer pages.
 */
export default function FooterShell() {
  const pathname = usePathname() ?? "/";
  if (pathname.startsWith("/staff") || pathname.startsWith("/repair-cost")) {
    return null;
  }
  return <Footer />;
}
