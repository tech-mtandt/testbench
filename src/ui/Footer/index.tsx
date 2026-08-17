import Link from "next/link";
import Image from "next/image";
import Logo from "@/../public/logo.png";
import AssistBanner from "./AssistBanner";
import BackToTopButton from "./BackToTopButton";

const mutedTextClass = "text-[0.8em] text-white/70";

export default function Footer() {
  return (
    <div>
      <AssistBanner />
      <div className="relative bg-black">
        <BackToTopButton />
        <div className="default-margin flex flex-col gap-2 pt-8 pb-2">
          <div className="w-full flex justify-between items-start mb-4">
            <span className="w-1/4 flex flex-col gap-4">
              <Image src={Logo} alt="MT&T Logo" width={240} height={60}></Image>
              <p className={mutedTextClass}>
                [em-tee-and-tee] The absolute one-stop destination for your safety
                needs. Delivering the best of our products & services for five
                decades.
              </p>
              <button className="p-2 bg-primary-yellow font-semibold">
                Subscribe now!
              </button>
            </span>
            <span className="flex flex-col gap-1">
              <h6 className="text-white">Our Products</h6>
              <Link href="/" className={mutedTextClass}>
                Aerial Work Platforms
              </Link>
              <Link href="/" className={mutedTextClass}>
                Material Handling Equipment
              </Link>
              <Link href="/" className={mutedTextClass}>
                Aluminium Scaffolding
              </Link>
              <Link href="/" className={mutedTextClass}>
                Temporary Road Mats
              </Link>
            </span>
            <span className="flex flex-col gap-1">
              <h6 className="text-white">Our Services</h6>
              <Link href="/" className={mutedTextClass}>
                Equipment Operator Training
              </Link>
              <Link href="/" className={mutedTextClass}>
                Equipment AMC
              </Link>
              <Link href="/" className={mutedTextClass}>
                Equipment Manpower
              </Link>
            </span>
            <span className="flex flex-col gap-1">
              <h6 className="text-white">Important Links</h6>
              <Link href="/" className={mutedTextClass}>
                Careers
              </Link>
              <Link href="/" className={mutedTextClass}>
                Events
              </Link>
              <Link href="/" className={mutedTextClass}>
                Annual Returns
              </Link>
            </span>
          </div>
          <hr className="w-full border-white/20" />
          <div className="w-full flex justify-between items-center">
            <span>
              <Link href="/" className={mutedTextClass}>
                Copyright © {new Date().getFullYear()}. All rights reserved. MT&T
                Group.
              </Link>
            </span>
            <span className="flex gap-4">
              <Link href="/privacy-policy" className={mutedTextClass}>
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className={mutedTextClass}>
                Terms and Conditions
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
