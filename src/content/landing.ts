/**
 * Subcategories with a dedicated landing page. The landing page is the hub for that
 * subcategory: Home > Category > Landing > Buy/Rent listing > Product.
 */
export const landingPages: Record<string, { href: string; label: string }> = {
  "boom-lift": { href: "/boom-lifts", label: "Boom Lifts" },
  "scissor-lift": { href: "/scissor-lifts", label: "Scissor Lifts" },
};

export const landingFor = (sub: string | null | undefined) =>
  sub ? landingPages[sub] : undefined;
