import "@/styles/globals.scss";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import Script from "next/script";

import Footer from "@/ui/Footer";
import Header from "@/ui/Header";
import FloatingActions from "@/ui/FloatingActions";
import { getSite } from "@/content/site";
import Smooth from "@/components/Smooth";
import { previewing } from "@/cms/read";
import PreviewMode from "@/ui/PreviewMode";

// Self-hosted via next/font; a CSS @import of Google Fonts gets dropped in production builds.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins-nf",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter-nf", display: "swap" });

// Google Analytics 4 (property "Mtandt Group - GA4"). Loads only on the live domain, so dev,
// preview and local visits stay out of the figures. Client-side page changes are counted by GA4's
// enhanced measurement (browser history events).
const GA_ID = "G-H2Y4EMH8TB";
const GA_HOST = "www.mtandt.com";
const gaTag = `
if (location.hostname === ${JSON.stringify(GA_HOST)}) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", ${JSON.stringify(GA_ID)});
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=${GA_ID}";
  document.head.appendChild(s);
}`;

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
  const [site, preview] = await Promise.all([getSite(), previewing()]);
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        <Header contact={site.contact} socials={site.socials} mainNav={site.mainNav} />
        <Script id="ga-tag" strategy="afterInteractive">{gaTag}</Script>
        <Smooth>
          <main>{children}</main>
          <Footer contact={site.contact} socials={site.socials} footer={site.footer} />
        </Smooth>
        <FloatingActions whatsapp={site.contact.whatsapp} />
        {preview && <PreviewMode />}
      </body>
    </html>
  );
}
