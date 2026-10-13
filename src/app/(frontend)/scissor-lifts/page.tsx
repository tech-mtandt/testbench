import LiftLanding, { liftLandingMetadata, type LiftLandingConfig } from "@/ui/Landing/LiftLanding";

const config: LiftLandingConfig = {
  path: "/scissor-lifts",
  subcategory: "scissor-lift",
  product: "Scissor Lift",
  headline: "Scissor Lifts for Sale & Rent",
  intro:
    "Electric and rough-terrain scissor lifts with large platforms for people, tools and materials. Buy new or rent for your project, with delivery, operator training and service support across India.",
  metaTitle: "Scissor Lifts for Sale & Rent | Electric & Rough Terrain | Mtandt",
  metaDescription:
    "Buy or rent electric and rough-terrain scissor lifts from Mtandt. Compact, stable work platforms for maintenance, construction and warehousing, with training and service support.",
  points: [
    { title: "Large, stable platform", text: "Room for multiple workers, tools and materials, with extension decks on most models." },
    { title: "Buy or rent", text: "Flexible purchase and short- or long-term rental options to fit your project and budget." },
    { title: "Indoor & outdoor", text: "Narrow, non-marking electric units for indoors and rough-terrain models for site work." },
    { title: "Trained & supported", text: "Operator training, certification and on-site service from our team." },
  ],
};

export const metadata = liftLandingMetadata(config);

export default function Page() {
  return <LiftLanding config={config} />;
}
