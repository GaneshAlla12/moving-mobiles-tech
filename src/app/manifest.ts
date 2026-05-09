import type { MetadataRoute } from "next";

/**
 * Web app manifest for the MM Staff PWA.
 *
 * The app is **scoped to /staff/** and /repair-cost/ so installing it
 * on an employee's phone gives them a fullscreen "MM Staff" home-screen
 * icon that opens straight to the identity picker. The customer site
 * stays as a regular browser website.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Moving Mobiles · Staff",
    short_name: "MM Staff",
    description: "Staff portal for Moving Mobiles Tech.",
    start_url: "/staff/identify",
    scope: "/staff/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Clock in",
        short_name: "Clock in",
        url: "/staff/identify",
        description: "Pick your name and enter PIN",
      },
      {
        name: "Today's bookings",
        short_name: "Bookings",
        url: "/staff/appointments",
      },
      {
        name: "Schedule",
        short_name: "Schedule",
        url: "/staff/schedule",
      },
      {
        name: "Attendance",
        short_name: "Attendance",
        url: "/staff/attendance",
      },
    ],
  };
}
