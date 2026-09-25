import "@/styles/globals.scss";
import type { Metadata } from "next";

import Footer from "@/ui/Footer";
import Header from "@/ui/Header";
import FloatingActions from "@/ui/FloatingActions";
import Smooth from "@/components/Smooth";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.mtandt.com"),
  title: {
    default: "Industrial & Safety Equipment Rental | Scaffolding & AWP",
    template: "%s | MTandT",
  },
  description:
    "Mtandt Group — India's one-stop destination for aerial work platforms, aluminium scaffolding, material handling equipment, fall protection systems and safety training since 1974.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Header />
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
        <Smooth>
          <main>{children}</main>
          <Footer />
        </Smooth>
        <FloatingActions />
      </body>
    </html>
  );
}
