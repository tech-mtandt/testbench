import "@/styles/globals.scss";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

import Footer from "@/ui/Footer";
import Header from "@/ui/Header";
import FloatingActions from "@/ui/FloatingActions";
import { getSite } from "@/content/site";
import Smooth from "@/components/Smooth";

// Self-hosted via next/font; a CSS @import of Google Fonts gets dropped in production builds.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins-nf",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter-nf", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { defaults } = await getSite();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.mtandt.com"),
    title: {
      default: defaults.title,
      template: "%s | MTandT",
    },
    description: defaults.description,
    icons: { icon: "/favicon.ico" },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = await getSite();
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        <Header contact={site.contact} socials={site.socials} mainNav={site.mainNav} />
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
          <Footer contact={site.contact} socials={site.socials} footer={site.footer} />
        </Smooth>
        <FloatingActions whatsapp={site.contact.whatsapp} />
      </body>
    </html>
  );
}
