export default function Page() {
  return (
    <div className="default-margin py-12">
      <main className="max-w-3xl mx-auto flex flex-col gap-8">
        <h2 className="font-semibold">Privacy Policy</h2>
        <p>Last updated: January 2026</p>

        <section className="flex flex-col gap-2">
          <h5>1. Introduction</h5>
          <p>
            MT&T Group (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
            respects your privacy and is committed to protecting the
            personal information you share with us. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you visit our website or use our equipment
            rental and related services.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h5>2. Information We Collect</h5>
          <p>
            We may collect personal information that you voluntarily
            provide to us, such as your name, company name, email address,
            phone number, and postal address, when you fill out an
            enquiry, quote request, partnership, or contact form on our
            website. We may also automatically collect certain technical
            information, such as your IP address, browser type, and
            browsing behaviour, through cookies and similar technologies.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h5>3. How We Use Your Information</h5>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 flex flex-col gap-1">
            <li>Respond to enquiries, quote requests, and support tickets</li>
            <li>Process and fulfil equipment rental bookings and orders</li>
            <li>Communicate updates about our products, services, and events</li>
            <li>Improve our website, products, and customer experience</li>
            <li>Comply with legal and regulatory obligations</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h5>4. Cookies</h5>
          <p>
            Our website may use cookies and similar tracking technologies
            to enhance your browsing experience and analyse site traffic.
            You can control or disable cookies through your browser
            settings; however, doing so may affect certain features of
            the website.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h5>5. Sharing of Information</h5>
          <p>
            We do not sell your personal information. We may share your
            information with trusted third-party service providers who
            assist us in operating our website and delivering our
            services (such as email or logistics providers), and only to
            the extent necessary for them to perform those services. We
            may also disclose information where required by law.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h5>6. Data Security</h5>
          <p>
            We implement reasonable administrative, technical, and
            physical safeguards to protect your personal information from
            unauthorised access, disclosure, alteration, or destruction.
            However, no method of transmission over the internet is
            completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h5>7. Your Rights</h5>
          <p>
            You may contact us at any time to request access to, correction
            of, or deletion of your personal information, or to opt out of
            marketing communications.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h5>8. Changes to This Policy</h5>
          <p>
            We may update this Privacy Policy from time to time. Any
            changes will be posted on this page with a revised &quot;last
            updated&quot; date.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h5>9. Contact Us</h5>
          <p>
            If you have any questions about this Privacy Policy, please
            contact us at{" "}
            <a href="mailto:marketing@mtandt.com">marketing@mtandt.com</a>{" "}
            or +91 9090 1010 65.
          </p>
        </section>
      </main>
    </div>
  );
}
