export default function AboutUsPage() {
  return (
    <main>
<section className="bg-[#f7f7f7] py-12">
  <div className="default-margin">
    <div className="mb-10 text-center">
      <h1 className="inline-block bg-gradient-to-t from-primary-yellow from-35% to-transparent to-35% text-[30px] font-bold uppercase leading-none text-gray-700">
        ABOUT US
      </h1>
    </div>

    <div className="grid items-start gap-12 lg:grid-cols-[1.25fr_0.9fr]">
      <div>
        <h2 className="mb-5 border-l-4 border-gray-600 pl-3 text-[28px] font-bold leading-tight text-gray-700">
          Who We Are
        </h2>

        <h3 className="mb-5 text-[17px] font-semibold text-gray-700">
          For The Ones Who Get it Done
        </h3>

        <div className="space-y-4 text-[15px] leading-[1.55] text-gray-700">
          <p>
            <strong>Since 1974,</strong> we&apos;ve been the partner you can
            count on. Founded by the{" "}
            <strong>Late Sri Rajkumar Modi, Mtandt Group</strong>{" "}was born with
            a simple goal: to make your work safer, more efficient, and more
            convenient—whether you&apos;re building, maintaining, repairing, or
            operating facilities and infrastructure.
          </p>

          <p>
            Our team brings together expertise in Manufacturing, Sales, Rentals,
            Training, and Services to create solutions that actually work for
            your unique challenges. Our leaders have walked in your shoes and
            understand the real-world problems you face every day, which is why
            we&apos;re committed to providing support that&apos;s both strategic
            and practical.
          </p>

          <p>
            Through our various Business Units, Subsidiaries, and Joint
            Ventures, we connect directly with you to solve problems, not just
            sell products. While we&apos;ve established a strong presence
            throughout the SAARC region, we continue to grow and expand—never
            forgetting our founding principles of safety, reliability, and
            excellence.
          </p>

          <p className="font-semibold">
            When you want to be sure and get more.
          </p>
        </div>
      </div>

      <div className="pt-14">
        <iframe
          className="h-[350px] w-full"
          src="https://www.youtube.com/embed/QlxNG4YUueI?start=1"
          title="MT&T About Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  </div>
</section>
    </main>
  );
}