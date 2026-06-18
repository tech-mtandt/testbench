import "@/styles/globals.scss";
import type { Metadata } from "next";

import Script from "next/script";
import Footer from "@/ui/Footer";
import Header from "@/ui/Header";
import Smooth from "@/components/Smooth";

export const metadata: Metadata = {
  title: "Lalith - Product Design Portfolio",
  description: "Lalith Kishore's portfolio website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
          <div className="default-margin">{children}</div>
        </Smooth>
        <Footer />
      </body>
    </html>
  );
}
