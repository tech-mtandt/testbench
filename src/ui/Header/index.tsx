import configPromise from "@payload-config";
import { getPayload } from "payload";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/../public/logo.png";

const navLinkClass =
  "relative text-white after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-primary-yellow after:transition-transform after:duration-300 hover:after:scale-x-100";

export default async function Header() {
  const payload = await getPayload({ config: configPromise });
  const { docs: socials } = await payload.find({
    collection: "socials",
    depth: 1,
    limit: 20,
  });

  return (
    <div className="bg-primary-yellow">
      <div className="default-margin flex items-center justify-between gap-4 py-1">
        <div className="flex gap-4">
          <p className="text-sm">+91 9090 1010 65</p>
          <p className="text-sm">marketing@mtandt.com</p>
        </div>
        {socials.length > 0 && (
          <div className="flex items-center gap-3">
            {socials.map((social) => {
              const logo =
                social.logo && typeof social.logo === "object"
                  ? social.logo
                  : null;

              if (!logo?.url) return null;

              return (
                <a
                  key={social.id}
                  href={social.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                >
                  <Image
                    src={logo.url}
                    alt={social.name}
                    width={16}
                    height={16}
                  />
                </a>
              );
            })}
          </div>
        )}
      </div>
      <div className="bg-black py-2">
        <div className="default-margin flex items-center justify-between">
          <span className="w-1/3">
            <Link href="/">
              <Image src={Logo} alt="MT&T Logo" width={120} height={40}></Image>
            </Link>
          </span>
          <span className="w-2/3 flex justify-end gap-4">
            <Link href="/products" className={navLinkClass}>
              Products
            </Link>
            <Link href="/services" className={navLinkClass}>
              Services
            </Link>
            <Link href="/catalogue" className={navLinkClass}>
              Catalogue
            </Link>
            <Link href="/media" className={navLinkClass}>
              Media
            </Link>
            <Link href="/partner" className={navLinkClass}>
              Partner
            </Link>
            <Link href="/about" className={navLinkClass}>
              About us
            </Link>
            <Link href="/contact" className={navLinkClass}>
              Contact us
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
