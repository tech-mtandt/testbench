/**
 * Site chrome content scraped from www.mtandt.com (2026-09-25).
 * Static for now — candidates to move into a Payload `Header`/`Footer` global.
 */

export const contact = {
  phone: "+91 9090 1010 65",
  phoneHref: "tel:+919090101065",
  email: "marketing@mtandt.com",
  whatsapp: "https://wa.me/919090101065",
};

export type SocialKey = "linkedin" | "facebook" | "instagram" | "twitter" | "youtube";

export const socials: { key: SocialKey; label: string; href: string }[] = [
  { key: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/3908621/" },
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/MtandtLimited" },
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/mtandtgroup/" },
  { key: "twitter", label: "Twitter", href: "https://twitter.com/Mtandt_Group" },
  { key: "youtube", label: "YouTube", href: "https://www.youtube.com/c/MtandtGroup" },
];

export type NavLink = { label: string; href: string };
export type NavGroup = { label: string; href?: string; links: NavLink[] };

const buyRent = (mode: "buy" | "rental"): NavGroup[] => {
  const std = (cat: string, sub: string) => `/product-category-${mode}/${cat}/${sub}`;
  const custom = (cat: string, sub: string) => `/custom-product-detail-buy/${cat}/${sub}`;
  const groups: NavGroup[] = [
    {
      label: "Aerial Work Platforms",
      href: "/category-by-subcategory/aerial-work-platform",
      links: [
        { label: "Boom Lift", href: std("aerial-work-platform", "boom-lift") },
        { label: "Scissor Lift", href: std("aerial-work-platform", "scissor-lift") },
        { label: "Vertical Lift", href: std("aerial-work-platform", "vertical-lift") },
        { label: "Spider Lift", href: std("aerial-work-platform", "spider-lift") },
      ],
    },
    {
      label: "Material Handling Equipment",
      href: "/category-by-subcategory/material-handling-equipment",
      links: [
        { label: "Duct Lifter", href: std("material-handling-equipment", "duct-lifter") },
        { label: "Order Picker", href: std("material-handling-equipment", "order-picker") },
        ...(mode === "rental"
          ? [{ label: "Knuckle Boom Crane", href: std("material-handling-equipment", "knuckle-boom-crane") }]
          : []),
      ],
    },
    {
      label: "Aluminium Scaffolding",
      href: "/category-by-subcategory/aluminium-scaffold",
      links: [
        { label: "Ladder Series", href: std("aluminium-scaffold", "ladder-series") },
        { label: "Stairway Series", href: std("aluminium-scaffold", "stairway-series") },
        { label: "Special", href: std("aluminium-scaffold", "special") },
        { label: "Low Reach Platform", href: std("aluminium-scaffold", "low-reach-platform") },
      ],
    },
  ];
  if (mode === "rental") {
    groups.push({
      label: "Temporary Road Mats",
      href: "/category-by-subcategory/temporary-road-mats",
      links: [
        { label: "PortaDeck", href: "/custom-product-detail-rental/temporary-road-mats/porta-deck" },
        { label: "PortaMat", href: "/custom-product-detail-rental/temporary-road-mats/porta-mat" },
      ],
    });
    return groups;
  }
  groups.push(
    {
      label: "Under-Deck & Net Systems",
      href: "/category-by-subcategory/web-systems-international",
      links: [
        { label: "WEB Deck®", href: custom("web-systems-international", "web-deck") },
        { label: "WEB Net®", href: custom("web-systems-international", "web-net") },
        { label: "WEB Catch®", href: custom("web-systems-international", "web-catch") },
      ],
    },
    {
      label: "Fall Protection Lifeline Systems",
      href: "/category-by-subcategory/fall-protection-lifeline-systems",
      links: [
        { label: "Horizontal Lifeline System", href: custom("fall-protection-lifeline-systems", "horizontal-lifeline-system-roof-lifeline-system") },
        { label: "Vertical Lifeline System", href: custom("fall-protection-lifeline-systems", "vertical-lifeline-system") },
        { label: "Overhead Lifeline System", href: custom("fall-protection-lifeline-systems", "overhead-lifeline-system-fall-arrester-system") },
        { label: "Barricade System", href: custom("fall-protection-lifeline-systems", "barricade-system") },
        { label: "Flowlok Ladder System", href: custom("fall-protection-lifeline-systems", "flowlok-ladder-system") },
        { label: "Aluminium Walkway System", href: custom("fall-protection-lifeline-systems", "aluminium-walkway-system") },
        { label: "Skylight Mesh", href: custom("fall-protection-lifeline-systems", "skylight-mesh") },
        { label: "Safety Barrier System", href: custom("fall-protection-lifeline-systems", "safety-barrier-system") },
      ],
    },
    {
      label: "MLIT",
      href: "/category-by-subcategory/mlit",
      links: [
        { label: "Mobile Light Tower", href: std("mlit", "mobile-light-tower") },
        { label: "Battery Power Stations", href: std("mlit", "battery-power-stations") },
      ],
    },
    {
      label: "Temporary Road Mats",
      href: "/category-by-subcategory/temporary-road-mats",
      links: [
        { label: "PortaDeck", href: custom("temporary-road-mats", "porta-deck") },
        { label: "PortaMat", href: custom("temporary-road-mats", "porta-mat") },
        { label: "PortaPad", href: custom("temporary-road-mats", "porta-pad") },
      ],
    },
    {
      label: "Tools and Supplies",
      href: "/category-by-subcategory/tools-and-supplies",
      links: [
        { label: "Personal Protective Equipment", href: custom("tools-and-supplies", "personal-protective-equipment") },
        { label: "Tools, Tackles and Consumables", href: custom("tools-and-supplies", "tools-tackles-and-consumables") },
        { label: "Material Handling Solutions", href: custom("tools-and-supplies", "material-handling-solutions") },
        { label: "Traffic Management Solutions", href: custom("tools-and-supplies", "traffic-management-solutions") },
        { label: "Measuring Equipment and Meters", href: custom("tools-and-supplies", "measuring-equipment-and-meters") },
        { label: "First Aid and Rescue Solutions", href: custom("tools-and-supplies", "first-aid-and-rescue-solutions") },
        { label: "Ladders and Climbing Solutions", href: custom("tools-and-supplies", "ladders-and-climbing-solutions") },
        { label: "Innovative Products and Solutions", href: custom("tools-and-supplies", "innovative-products-and-solutions") },
      ],
    },
  );
  return groups;
};

export type NavItem =
  | { label: string; href: string; kind: "link" }
  | { label: string; kind: "mega"; groups: NavGroup[] }
  | { label: string; kind: "dropdown"; groups: NavGroup[] };

export const mainNav: NavItem[] = [
  { label: "Buy", kind: "mega", groups: buyRent("buy") },
  { label: "Rent", kind: "mega", groups: buyRent("rental") },
  {
    label: "Services",
    kind: "mega",
    groups: [
      {
        label: "Training & Certifications",
        href: "/services/cesl",
        links: [
          { label: "Work at Height Training", href: "/services/work-at-height-training" },
          { label: "MEWP Operator Training", href: "/services/mewp-operator-training" },
          { label: "GWO Training", href: "/services/gwo-basic-safety-training" },
        ],
      },
      {
        label: "Equipment Management",
        href: "/services/equipr",
        links: [
          { label: "Yard Services", href: "/services/yard-services" },
          { label: "Maintenance Services", href: "/services/maintenance-services" },
          { label: "Repair Services", href: "/services/repair-services" },
          { label: "Remote Monitoring System", href: "/services/remote-monitoring-system-telematics" },
        ],
      },
      {
        label: "Industrial Rope Access Specialist",
        href: "/services/eat",
        links: [
          { label: "Offshore and Onshore Solutions", href: "/services/offshore-and-onshore-solutions" },
          { label: "Inspection and Survey", href: "/services/inspection-and-survey" },
          { label: "Maintenance and Repairs", href: "/services/maintenance-and-repairs" },
          { label: "Consultancy and Training", href: "/services/consultancy-and-training" },
        ],
      },
    ],
  },
  { label: "Catalogues", kind: "link", href: "/catalogues" },
  {
    label: "Media",
    kind: "dropdown",
    groups: [
      {
        label: "Media",
        links: [
          { label: "Blogs", href: "/media" },
          { label: "Press", href: "/media/press" },
          { label: "Events", href: "/media/events" },
          { label: "Gallery", href: "/media/gallery" },
        ],
      },
    ],
  },
  {
    label: "Partner",
    kind: "dropdown",
    groups: [
      {
        label: "Partner",
        links: [
          { label: "Dealer", href: "/dealer" },
          { label: "Vendor", href: "/vendors" },
          { label: "Customer", href: "/customers" },
        ],
      },
    ],
  },
  {
    label: "About Us",
    kind: "dropdown",
    groups: [
      {
        label: "About Us",
        links: [
          { label: "Who We Are", href: "/about-us#whoweare" },
          { label: "Group Principles", href: "/about-us#group-principle" },
          { label: "Powering Progress", href: "/about-us#PoweringProgress" },
          { label: "Business Units", href: "/about-us#bussiness-unit" },
          { label: "Our Team", href: "/about-us#team" },
          { label: "Why Mtandt?", href: "/about-us#WhyMTandT" },
          { label: "Our Journey", href: "/about-us#OurJourney" },
          { label: "Accreditations", href: "/about-us#accreditations" },
          { label: "Awards", href: "/about-us#awards" },
        ],
      },
    ],
  },
  { label: "Contact Us", kind: "link", href: "/contact-us" },
];

export const footer = {
  blurb:
    "[em-tee-and-tee] The absolute one-stop destination for your safety needs. Delivering the best of our products & services for five decades.",
  pronunciationAudio: "/legacy/imageFile/1651491975.mp3",
  columns: [
    {
      title: "Important Links",
      links: [
        { label: "Careers", href: "/career" },
        { label: "Events", href: "/media/events" },
        { label: "Privacy Policy", href: "/pages/privacy-policy" },
        { label: "Customer Credit Application Form", href: "/customers" },
        { label: "Dealer Application Form", href: "/dealer" },
        { label: "Vendor Application Form", href: "/vendors" },
        { label: "Annual Returns", href: "/annual-returns" },
      ],
    },
    {
      title: "Products",
      links: [
        { label: "Aerial Work Platforms", href: "/category-by-subcategory/aerial-work-platform" },
        { label: "Material Handling Equipment", href: "/category-by-subcategory/material-handling-equipment" },
        { label: "Aluminum Scaffolding", href: "/category-by-subcategory/aluminium-scaffold" },
        { label: "MLIT", href: "/category-by-subcategory/mlit" },
        { label: "Temporary Road Mats", href: "/category-by-subcategory/temporary-road-mats" },
        { label: "Fall Protection Lifeline Systems", href: "/category-by-subcategory/fall-protection-lifeline-systems" },
        { label: "Under-Deck Access Systems", href: "/category-by-subcategory/web-systems-international" },
        { label: "Tool and Supplies", href: "/category-by-subcategory/tools-and-supplies" },
      ],
    },
    {
      title: "Our Services",
      links: [
        { label: "Equipment Operator Training", href: "/services/equipment-operator-training" },
        { label: "Equipment AMC", href: "/services/amc" },
        { label: "Equipment Manpower", href: "/services/equipment-manpower" },
        { label: "Competency Certifications", href: "/services/competency-certifications" },
        { label: "Industrial Safety Training", href: "/services/industrial-safety-training" },
        { label: "Rope Access Operations and Services", href: "/services/rope-access-operations-and-services" },
        { label: "Rope Access Training", href: "/services/rope-access-training" },
      ],
    },
  ],
  legal: [
    { label: "Privacy Policy", href: "/pages/privacy-policy" },
    { label: "Terms and Conditions", href: "/pages/term-conditions" },
  ],
};
