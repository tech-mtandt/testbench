import PartnerPage, { partnerMetadata } from "@/ui/Partner/PartnerPage";

export const metadata = partnerMetadata("vendors");

export default function Page() {
  return <PartnerPage page="vendors" />;
}
