import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import FooterShell from "@/components/FooterShell";
import SmoothScroll from "@/components/SmoothScroll";
import PWAManager from "@/components/PWAManager";
import { CartProvider } from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import { business } from "@/lib/business";
import { isStaff, getStaffIdentity } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${business.name} — ${business.tagline}`,
    template: `%s · ${business.name}`,
  },
  description: business.heroSubhead,
  metadataBase: new URL("https://www.movingmobiles.com"),
  openGraph: {
    title: `${business.name} — ${business.tagline}`,
    description: business.heroSubhead,
    type: "website",
    locale: "en_US",
  },
  appleWebApp: {
    capable: true,
    title: "MM Staff",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const staff = await isStaff();
  const identity = staff ? await getStaffIdentity() : null;
  const staffName =
    identity?.kind === "employee" ? identity.name : null;
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Inline pre-hydration script: applies stored or system theme before paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mm-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SmoothScroll />
        <PWAManager />
        <CartProvider>
          <Header isStaff={staff} staffName={staffName} />
          <main className="flex-1">{children}</main>
          <FooterShell />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
