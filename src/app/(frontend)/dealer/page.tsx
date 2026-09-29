import PartnerPage, { partnerMetadata } from "@/ui/Partner/PartnerPage";

export const metadata = partnerMetadata("dealer");

export default function Page() {
  return <PartnerPage page="dealer" />;
}
