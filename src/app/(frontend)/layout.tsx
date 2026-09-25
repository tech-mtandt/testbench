import "@/styles/globals.scss";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Footer from "@/ui/Footer";
import Header from "@/ui/Header";
import CommandPalette from "@/ui/CommandPalette";
import { EnquiryProvider } from "@/ui/Enquiry";
import PageTransition from "@/ui/PageTransition";
import WhatsAppDock from "@/ui/WhatsAppDock";
import Smooth from "@/components/Smooth";

// Self-hosted via next/font (a CSS @import of Google Fonts is dropped in production builds).
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.mtandt.com"),
  title: {
    default: "Mtandt — Access, lifting & safety equipment since 1974",
    template: "%s | Mtandt",
  },
  description:
    "Buy or rent aerial work platforms, aluminium scaffolding, material handling equipment and fall-protection systems — with training, maintenance and rope-access services across India.",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#f6f5f0",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        {/*
        <Script
          async
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-H2Y4EMH8TB"
        ></Script>
        <Script
          strategy="afterInteractive"
          id="ga-tag"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-H2Y4EMH8TB');
              `,
          }}
        />
        */}
        <EnquiryProvider>
          <Header />
          <Smooth>
            <PageTransition>
              <main>{children}</main>
            </PageTransition>
            <Footer />
          </Smooth>
          <WhatsAppDock />
          <CommandPalette />
        </EnquiryProvider>
      </body>
    </html>
  );
}
