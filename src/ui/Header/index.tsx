import Link from "next/link";
import Image from "next/image";
import Logo from "@/../public/logo.png";

export default function Header() {
  return (
    <div className="bg-primary-yellow">
      <div className="default-margin flex gap-4 py-1">
        <p className="text-sm">+91 9090 1010 65</p>
        <p className="text-sm">marketing@mtandt.com</p>
      </div>
      <div className="bg-black py-2">
        <div className="default-margin flex items-center justify-between">
          <span className="w-1/3">
            <Link href="/">
              <Image src={Logo} alt="MT&T Logo" width={120} height={40}></Image>
            </Link>
          </span>
          <span className="w-2/3 flex justify-end gap-2">
            <Link href="/buy" className="text-white">
              Buy
            </Link>
            <Link href="/rent" className="text-white">
              Rent
            </Link>
            <Link href="/services" className="text-white">
              Services
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
