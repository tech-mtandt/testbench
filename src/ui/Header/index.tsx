import { companyMenu, productTiles, servicesMenu, topNav } from "@/content/nav";
import { contact } from "@/content/site";
import NavBar, { type NavData } from "./NavBar";

/** Server wrapper: resolves menu data here so the catalog never ships to the client. */
export default function Header() {
  const data: NavData = {
    top: topNav,
    products: productTiles.map(({ slug, title, href, image, count, subs }) => ({ slug, title, href, image, count, subs: subs.slice(0, 5) })),
    services: servicesMenu,
    company: companyMenu,
    phone: contact.phone,
    phoneHref: contact.phoneHref,
  };
  return <NavBar data={data} />;
}
