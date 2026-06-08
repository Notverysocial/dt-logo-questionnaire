// DT Logo Design Questionnaire — schema shared between the form UI and the API route.

export const PRIMARY_FOR_OPTIONS = [
  { id: "workers", label: "Prospective workers", desc: "Job-seekers we want to recruit" },
  { id: "employers", label: "Prospective employers", desc: "Companies who'd hire DT to staff their crews" },
  { id: "both", label: "Both equally", desc: "The mark has to work for either side" },
  { id: "industry_partners", label: "Industry partners", desc: "Vendors, peer agencies, referral partners" },
] as const;

export const VISUAL_PAIRS = [
  {
    id: "bold_subtle",
    question: "Bold vs Subtle:",
    a: { value: "bold", label: "Bold", desc: "Loud + confident — owns the room" },
    b: { value: "subtle", label: "Subtle", desc: "Reserved + sophisticated — earns the room" },
  },
  {
    id: "geometric_organic",
    question: "Geometric vs Organic:",
    a: { value: "geometric", label: "Geometric", desc: "Clean lines + precise shapes" },
    b: { value: "organic", label: "Organic", desc: "Flowing + hand-drawn feel" },
  },
  {
    id: "modern_established",
    question: "Modern vs Established:",
    a: { value: "modern", label: "Modern", desc: "Current 2026 vibe — sharp + forward" },
    b: { value: "established", label: "Established", desc: "Feels like it's been around for decades" },
  },
  {
    id: "industrial_polished",
    question: "Industrial vs Polished:",
    a: { value: "industrial", label: "Industrial", desc: "Warehouse / blue-collar — boots on the ground" },
    b: { value: "polished", label: "Polished", desc: "Corporate / executive — clean conference room" },
  },
  {
    id: "wordmark_symbol",
    question: "Wordmark-led vs Symbol-led:",
    a: { value: "wordmark", label: "Wordmark-led", desc: "The text IS the logo" },
    b: { value: "symbol", label: "Symbol-led", desc: "A distinct icon/symbol paired with the text" },
  },
  {
    id: "monochrome_color",
    question: "Monochrome vs Color-led:",
    a: { value: "monochrome", label: "Monochrome", desc: "Mostly black/white — gold as accent only" },
    b: { value: "color", label: "Color-led", desc: "Gold/yellow does the heavy lifting" },
  },
] as const;

export const PRIMARY_TEXT_OPTIONS = [
  { id: "dt_only", label: "DT only", desc: '"DT" monogram as the primary mark' },
  { id: "full_only", label: "Driven Talent only", desc: "Full company name spelled out" },
  { id: "both_visible", label: "Both visible", desc: '"DT" and "Driven Talent" both present' },
  { id: "driven_emphasized", label: '"Driven" emphasized', desc: "Stack or weight Driven > Talent" },
  { id: "talent_emphasized", label: '"Talent" emphasized', desc: "Stack or weight Talent > Driven" },
] as const;

export type DTLogoSubmission = {
  // Section 1 — Identity
  one_word: string;
  three_adjectives: string;
  primary_for: string[];   // multi-select

  // Section 2 — Visual style pairs
  pairs: Record<string, string>;

  // Section 3 — References
  reference_urls: string;
  anti_reference_urls: string;

  // Section 4 — Specific elements
  primary_text: string;
  imagery: string;
  color_preferences: string;
  avoid: string;

  // Section 5 — Final / contact
  name: string;
  email: string;
  role: string;
  final_thoughts: string;

  submitted_at: string;
};
