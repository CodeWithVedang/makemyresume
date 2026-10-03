import type { Metadata, Viewport } from "next";

import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { JsonLd } from "@/components/seo/JsonLd";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE, appUrl, DEVELOPER } from "@/lib/config";

import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    default: `${APP_NAME} — Free Resume Maker for Freshers & Professionals in India`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    "resume maker",
    "free resume builder",
    "resume builder India",
    "online resume maker",
    "resume format for freshers",
    "ATS friendly resume",
    "CV maker",
    "resume PDF download",
    "resume templates",
    "fresher resume",
  ],
  authors: [{ name: DEVELOPER.name, url: DEVELOPER.github }],
  creator: DEVELOPER.name,
  publisher: APP_NAME,
  category: "productivity",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "default" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: APP_NAME,
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: `${APP_NAME} — ${APP_TAGLINE}`, description: APP_DESCRIPTION },
  icons: { icon: "/icon.svg", apple: "/icons/apple-touch-icon" },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0e141b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${fontVariables} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <TooltipProvider delayDuration={300}>
            {children}
            <Toaster position="bottom-center" />
          </TooltipProvider>
        </ThemeProvider>
        <ServiceWorkerRegistration />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              { "@type": "WebSite", "@id": `${appUrl()}/#website`, url: appUrl(), name: APP_NAME, inLanguage: "en-IN" },
              {
                "@type": "Organization",
                "@id": `${appUrl()}/#organization`,
                name: APP_NAME,
                url: appUrl(),
                logo: `${appUrl()}/icons/512`,
                sameAs: [DEVELOPER.github],
              },
              {
                "@type": "SoftwareApplication",
                name: APP_NAME,
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web, Android, iOS",
                description: APP_DESCRIPTION,
                url: appUrl(),
                offers: { "@type": "Offer", price: 0, priceCurrency: "INR" },
                author: { "@type": "Organization", name: DEVELOPER.name, url: DEVELOPER.github },
              },
            ],
          }}
        />
      </body>
    </html>
  );
}
