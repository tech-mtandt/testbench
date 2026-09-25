import PartnerPage, { partnerMetadata } from "@/ui/Partner/PartnerPage";

export const metadata = partnerMetadata("customers");

export default function Page() {
  return <PartnerPage page="customers" />;
}
