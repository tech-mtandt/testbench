import LiftLanding, { liftLandingMetadata, type LiftLandingConfig } from "@/ui/Landing/LiftLanding";

const config: LiftLandingConfig = {
  path: "/boom-lifts",
  subcategory: "boom-lift",
  product: "Boom Lift",
  headline: "Boom Lifts for Sale & Rent",
  intro:
    "Articulated and telescopic boom lifts, electric and diesel, reaching up to 42 m. Buy new or rent for your project, with delivery, operator training and service support across India.",
  metaTitle: "Boom Lifts for Sale & Rent | Articulated & Telescopic | Mtandt",
  metaDescription:
    "Buy or rent articulated and telescopic boom lifts from Mtandt. Electric and diesel models up to 42 m working height, with delivery, training and service support.",
  points: [
    { title: "Up to 42 m reach", text: "Telescopic and articulated booms for high, hard-to-reach work with outreach over obstacles." },
    { title: "Buy or rent", text: "Flexible purchase and short- or long-term rental options to fit your project and budget." },
    { title: "Electric & diesel", text: "Quiet, zero-emission units for indoor work and rough-terrain diesel models for outdoor sites." },
    { title: "Trained & supported", text: "Operator training, certification and on-site service from our team." },
  ],
};

export const metadata = liftLandingMetadata(config);

export default function Page() {
  return <LiftLanding config={config} />;
}
