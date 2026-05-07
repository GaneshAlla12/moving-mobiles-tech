// Map common color option values to CSS swatches.
// Returns a CSS background value (color or gradient) for the swatch chip.

const MAP: Record<string, string> = {
  // Reds / pinks
  red: "#dc2626",
  maroon: "#7f1d1d",
  burgundy: "#7f1d1d",
  pink: "#ec4899",
  "hot pink": "#ec4899",
  "baby pink": "#fbcfe8",
  rose: "#fb7185",
  "rose gold": "linear-gradient(135deg,#fbcfe8,#e9b6a4 60%,#fbcfe8)",
  coral: "#fb7185",
  // Oranges / yellows
  orange: "#f97316",
  "cosmic orange": "#f97316",
  "burnt orange": "#c2410c",
  yellow: "#eab308",
  gold: "#d4a017",
  // Greens
  green: "#16a34a",
  "deep green": "#15803d",
  "olive green": "#65a30d",
  olive: "#65a30d",
  mint: "#a7f3d0",
  teal: "#0d9488",
  // Blues
  blue: "#2563eb",
  "navy blue": "#1e3a8a",
  navy: "#1e3a8a",
  "deep blue": "#1e40af",
  "sky blue": "#38bdf8",
  "light blue": "#7dd3fc",
  cyan: "#06b6d4",
  // Purples
  purple: "#9333ea",
  violet: "#7c3aed",
  lavender: "#c4b5fd",
  // Browns / earth
  brown: "#78350f",
  beige: "#e7d4b5",
  cream: "#f5e9d3",
  tan: "#d4b48c",
  sand: "#e7d4b5",
  // Neutral
  black: "#0a0a0a",
  white: "#f5f5f7",
  "off white": "#f5f5f7",
  ivory: "#fffff0",
  silver: "linear-gradient(135deg,#dcdcdc,#f5f5f5,#a8a8a8)",
  gray: "#9ca3af",
  grey: "#9ca3af",
  "dark gray": "#404040",
  "light gray": "#d4d4d4",
  graphite: "#374151",
  charcoal: "#262626",
  // Special metallics
  "rose silver": "linear-gradient(135deg,#f5d3c8,#cbb1a4)",
  "space gray": "#3a3a3a",
  "space grey": "#3a3a3a",
  titanium: "linear-gradient(135deg,#b8b8b6,#7a7a78,#b8b8b6)",
  "natural titanium": "linear-gradient(135deg,#cdc5b4,#a89e87,#cdc5b4)",
  "blue titanium": "linear-gradient(135deg,#5a6f7e,#3e4f5a)",
  "white titanium": "linear-gradient(135deg,#e0e0db,#bdbdb6)",
  "black titanium": "#1d1d1f",
  "desert titanium": "linear-gradient(135deg,#c8a87f,#9a7d56)",
  midnight: "#0a1530",
  starlight: "#f7e6c4",
};

const STRIPE = "repeating-linear-gradient(45deg,#e5e7eb 0 6px,#f3f4f6 6px 12px)";

/** Returns a CSS background (color or gradient) for a Shopify color option value. */
export function colorSwatch(name: string): string {
  const k = name.trim().toLowerCase();
  if (MAP[k]) return MAP[k];

  // Try suffix matching for compound names (e.g. "matte blue" → blue)
  for (const key of Object.keys(MAP)) {
    if (k.endsWith(" " + key) || k.startsWith(key + " ")) return MAP[key];
  }

  // Fallback: a striped gray so unknown colors are still visibly distinct
  return STRIPE;
}

/** Returns true if a name in the option ladder is plausibly a color name. */
export function isColorOptionName(name: string): boolean {
  const n = name.trim().toLowerCase();
  return n === "color" || n === "colour" || n === "colors" || n === "shade";
}
