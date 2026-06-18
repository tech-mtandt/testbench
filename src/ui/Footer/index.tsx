import Link from "next/link";
import Image from "next/image";
import Logo from "@/../public/logo.png";

export default function Footer() {
  return (
    <div className="default-margin flex flex-col gap-2 mb-2">
      <div className="w-full flex justify-between items-start mb-4">
        <span className="w-1/4 flex flex-col gap-4">
          <Image src={Logo} alt="MT&T Logo" width={240} height={60}></Image>
          <p>
            [em-tee-and-tee] The absolute one-stop destination for your safety
            needs. Delivering the best of our products & services for five
            decades.
          </p>
          <button className="p-2 bg-primary-yellow font-semibold">
            Subscribe now!
          </button>
        </span>
        <span className="flex flex-col">
          <h5>Our Products</h5>
          <Link href="/">Aerial Work Platforms</Link>
          <Link href="/">Material Handling Equipment</Link>
          <Link href="/">Aluminium Scaffolding</Link>
          <Link href="/">Temporary Road Mats</Link>
        </span>
        <span className="flex flex-col">
          <h5>Our Services</h5>
          <Link href="/">Equipment Operator Training</Link>
          <Link href="/">Equipment AMC</Link>
          <Link href="/">Equipment Manpower</Link>
        </span>
        <span className="flex flex-col">
          <h5>Important Links</h5>
          <Link href="/">Careers</Link>
          <Link href="/">Events</Link>
          <Link href="/">Annual Returns</Link>
        </span>
      </div>
      <hr className="w-full" />
      <div className="w-full flex justify-between items-center">
        <span>
          <Link href="/">
            Copyright © {new Date().getFullYear()}. All rights reserved. MT&T
            Group.
          </Link>
        </span>
        <span className="flex gap-4">
          <Link href="/">Privacy Policy</Link>
          <Link href="/">Terms and Conditions</Link>
        </span>
      </div>
    </div>
  );
}
