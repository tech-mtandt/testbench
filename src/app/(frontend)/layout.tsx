import "@/styles/globals.scss";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

import Footer from "@/ui/Footer";
import Header from "@/ui/Header";
import FloatingActions from "@/ui/FloatingActions";
import LeadPopup from "@/ui/Landing/LeadPopup";
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

// Google Tag Manager container, the site's only analytics tag: GA4 (G-HPJMWJJCWN) and any other
// tags are configured in GTM, not here, so page views are not counted twice. Loads only on the live
// domain, so dev, preview and local visits stay out of the figures. Pushes the standard `gtm.js`
// start event that GTM's page view triggers fire on; enquiries push `generate_lead` (useLeadForm).
const GTM_ID = "GTM-K34SKQ7";
const LIVE_HOST = "www.mtandt.com";
const gtmTag = `
if (location.hostname === ${JSON.stringify(LIVE_HOST)}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtm.js?id=${GTM_ID}";
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
    // The MTandT "M" mark: .ico for browser tabs, PNGs for search results and home screens.
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
        { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      ],
      apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    },
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
      <head>
        {/* A plain inline script so GTM starts as the page is parsed, as Google recommends. Next's
            beforeInteractive would instead queue it in <body> for its runtime to run later. */}
        <script id="gtm-tag" dangerouslySetInnerHTML={{ __html: gtmTag }} />
      </head>
      <body>
        <Header contact={site.contact} socials={site.socials} mainNav={site.mainNav} />
        <Smooth>
          <main>{children}</main>
          <Footer contact={site.contact} socials={site.socials} footer={site.footer} />
        </Smooth>
        <FloatingActions whatsapp={site.contact.whatsapp} />
        {/* Quote popup on every page, once per browser session (see LeadPopup). */}
        {!preview && <LeadPopup />}
        {preview && <PreviewMode />}
      </body>
    </html>
  );
}
