/**
 * Names the machine or range a page is about for the site-wide quote popup (LeadPopup): its
 * heading ("Get a Scissor Lifts quote") and the lead's product. Renders nothing visible.
 */
export default function QuoteProduct({ product }: { product: string }) {
  return <span hidden data-quote-product={product} />;
}
