export default function ContactUsPage() {
  return (
    <main>
      <section className="bg-[#f7f7f7] py-12">
        <div className="default-margin">
          <div className="mb-10 text-center">
            <h1 className="inline-block bg-gradient-to-t from-primary-yellow from-35% to-transparent to-35% text-[30px] font-bold uppercase leading-none text-gray-700">
              CONTACT US
            </h1>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h2 className="text-[28px] font-bold text-gray-700">
                Send Us a Message
              </h2>
              <p className="mt-2 text-[15px] leading-[22.5px] text-gray-700">
                Have a question or requirement? Fill out the form below and our
                team will get back to you.
              </p>
            </div>

            <form className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="Your Name"
                className="rounded border border-gray-300 px-4 py-3 text-[15px]"
              />

              <input
                type="email"
                placeholder="Email Address"
                className="rounded border border-gray-300 px-4 py-3 text-[15px]"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                className="rounded border border-gray-300 px-4 py-3 text-[15px]"
              />

              <input
                type="text"
                placeholder="Company Name"
                className="rounded border border-gray-300 px-4 py-3 text-[15px]"
              />

              <select className="rounded border border-gray-300 px-4 py-3 text-[15px] text-gray-500">
                <option>Select Requirement</option>
                <option>Buy</option>
                <option>Rent</option>
                <option>Services</option>
                <option>Training</option>
              </select>

              <input
                type="text"
                placeholder="Subject"
                className="rounded border border-gray-300 px-4 py-3 text-[15px]"
              />

              <textarea
                placeholder="Message"
                className="min-h-[110px] rounded border border-gray-300 px-4 py-3 text-[15px] md:col-span-2"
              />

              <label className="flex items-start gap-2 text-[14px] leading-6 text-gray-700 md:col-span-2">
                <input type="checkbox" defaultChecked className="mt-1" />
                <span>I agree to the terms and privacy policy.</span>
              </label>

              <div className="text-center md:col-span-2">
                <button
                  type="button"
                  className="rounded bg-black px-8 py-3 text-[15px] font-semibold text-white hover:bg-primary-yellow hover:text-black"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-black py-8">
        <div className="default-margin flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="border-l-4 border-primary-yellow pl-3 text-[28px] font-semibold text-white">
              Your Voice Matters!
            </h2>
            <p className="mt-2 text-[15px] text-white">
              Questions, Suggestions, or Complaints? We are listening.
            </p>
          </div>

          <button
            type="button"
            className="w-fit rounded bg-primary-yellow px-6 py-3 text-[15px] font-semibold text-black hover:bg-white"
          >
            Share Your Thoughts
          </button>
        </div>
      </section>
    </main>
  );
}