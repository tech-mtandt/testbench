import "@/styles/globals.scss";
import type { Metadata } from "next";

import Footer from "@/ui/Footer";
import Header from "@/ui/Header";
import Smooth from "@/components/Smooth";

export const metadata: Metadata = {
  title: "mtandt - Industrial & Safety Equipment Rental",
  description: "Industrial & Safety Equipment Rental | Scaffolding & AWP",
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
          <div>{children}</div>
        </Smooth>
        <Footer />
      </body>
    </html>
  );
}
