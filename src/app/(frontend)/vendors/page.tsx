import PartnerPage, { partnerMetadata } from "@/ui/Partner/PartnerPage";

export const generateMetadata = () => partnerMetadata("vendors");

export default function Page() {
  return <PartnerPage page="vendors" />;
}
