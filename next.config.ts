import type { NextConfig } from "next";

/**
 * Security headers applied to every response. These mitigate common
 * web vulnerabilities at the HTTP level — no per-page code needed.
 */
const securityHeaders = [
  // Force HTTPS for 2 years on every subdomain.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Block our pages from being framed by a malicious site (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Browser must respect Content-Type — no MIME sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak the full URL when the user clicks a link to another site.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable powerful APIs we don't use.
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "interest-cohort=()",
      "payment=()",
      "usb=()",
      "fullscreen=(self)",
    ].join(", "),
  },
  // Limit cross-origin resource sharing.
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Modern XSS auditor signal (legacy IE/old Chromium honored this).
  { key: "X-XSS-Protection", value: "0" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
