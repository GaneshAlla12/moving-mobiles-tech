// Estimated out-of-warranty repair prices in USD.
// Final price confirmed at in-shop inspection. Easy to adjust per model.
//
// A price of 0 renders as "Varies" — used for the catch-all "Other laptop"
// brand where a quote requires inspection.

export type Model = {
  key: string;
  label: string;
  prices: Record<string, number>;
};

export type Brand = {
  key: string;
  label: string;
  /** The damage / service categories shown for this brand. */
  serviceLines: string[];
  models: Model[];
};

const PHONE_LINES = [
  "Battery service",
  "Back glass damage",
  "Rear camera damage",
  "Screen damage",
  "Screen and back glass damage",
  "Other damage",
];

const LAPTOP_LINES = [
  "Battery service",
  "Screen damage",
  "Keyboard / top case",
  "Trackpad replacement",
  "Logic board / liquid damage",
  "Other damage",
];

/** Phone helper — order: battery, back, camera, screen, screen+back, other */
const ip = (
  key: string,
  label: string,
  battery: number,
  back: number,
  camera: number,
  screen: number,
  screenBack: number,
  other: number,
): Model => ({
  key,
  label,
  prices: {
    "Battery service": battery,
    "Back glass damage": back,
    "Rear camera damage": camera,
    "Screen damage": screen,
    "Screen and back glass damage": screenBack,
    "Other damage": other,
  },
});

/** Laptop helper — order: battery, screen, keyboard, trackpad, logic, other */
const mb = (
  key: string,
  label: string,
  battery: number,
  screen: number,
  keyboard: number,
  trackpad: number,
  logic: number,
  other: number,
): Model => ({
  key,
  label,
  prices: {
    "Battery service": battery,
    "Screen damage": screen,
    "Keyboard / top case": keyboard,
    "Trackpad replacement": trackpad,
    "Logic board / liquid damage": logic,
    "Other damage": other,
  },
});

export const brands: Brand[] = [
  {
    key: "iphone",
    label: "iPhone",
    serviceLines: PHONE_LINES,
    models: [
      ip("iphone-14",          "iPhone 14",          89,  169, 169, 279, 399, 499),
      ip("iphone-14-plus",     "iPhone 14 Plus",     99,  199, 169, 329, 449, 549),
      ip("iphone-14-pro",      "iPhone 14 Pro",      99,  199, 199, 329, 499, 599),
      ip("iphone-14-pro-max",  "iPhone 14 Pro Max",  99,  199, 199, 379, 549, 649),
      ip("iphone-15",          "iPhone 15",          99,  169, 169, 279, 399, 549),
      ip("iphone-15-plus",     "iPhone 15 Plus",     99,  199, 169, 329, 449, 599),
      ip("iphone-15-pro",      "iPhone 15 Pro",      99,  199, 199, 329, 499, 599),
      ip("iphone-15-pro-max",  "iPhone 15 Pro Max",  99,  199, 199, 379, 549, 649),
      ip("iphone-16e",         "iPhone 16e",         89,  149, 149, 229, 359, 469),
      ip("iphone-16",          "iPhone 16",          99,  169, 169, 279, 429, 549),
      ip("iphone-16-plus",     "iPhone 16 Plus",     99,  199, 199, 329, 479, 599),
      ip("iphone-16-pro",      "iPhone 16 Pro",      99,  199, 199, 329, 499, 599),
      ip("iphone-16-pro-max",  "iPhone 16 Pro Max",  99,  199, 249, 379, 549, 649),
      ip("iphone-17",          "iPhone 17",          99,  179, 179, 299, 429, 529),
      ip("iphone-air",         "iPhone Air",         99,  199, 199, 329, 479, 579),
      ip("iphone-17-pro",      "iPhone 17 Pro",     109,  219, 219, 349, 529, 629),
      ip("iphone-17-pro-max",  "iPhone 17 Pro Max", 109,  229, 269, 399, 579, 679),
    ],
  },
  {
    key: "samsung",
    label: "Samsung Galaxy",
    serviceLines: PHONE_LINES,
    models: [
      // Galaxy S series — last 5 years
      ip("galaxy-s21",         "Galaxy S21",         69,  119,  99, 199, 279, 379),
      ip("galaxy-s21-plus",    "Galaxy S21+",        79,  129, 109, 219, 309, 409),
      ip("galaxy-s21-ultra",   "Galaxy S21 Ultra",   79,  149, 129, 259, 369, 469),
      ip("galaxy-s22",         "Galaxy S22",         79,  119,  99, 219, 299, 399),
      ip("galaxy-s22-plus",    "Galaxy S22+",        79,  129, 109, 229, 319, 419),
      ip("galaxy-s22-ultra",   "Galaxy S22 Ultra",   79,  149, 129, 269, 379, 479),
      ip("galaxy-s23",         "Galaxy S23",         79,  129, 109, 229, 319, 409),
      ip("galaxy-s23-plus",    "Galaxy S23+",        79,  139, 119, 249, 349, 449),
      ip("galaxy-s23-ultra",   "Galaxy S23 Ultra",   79,  159, 139, 279, 399, 499),
      ip("galaxy-s23-fe",      "Galaxy S23 FE",      69,  119,  99, 199, 279, 369),
      ip("galaxy-s24",         "Galaxy S24",         89,  139, 109, 229, 319, 419),
      ip("galaxy-s24-plus",    "Galaxy S24+",        89,  149, 119, 249, 349, 449),
      ip("galaxy-s24-ultra",   "Galaxy S24 Ultra",   89,  169, 149, 299, 429, 529),
      ip("galaxy-s24-fe",      "Galaxy S24 FE",      69,  119,  99, 199, 279, 379),
      ip("galaxy-s25",         "Galaxy S25",         89,  149, 119, 249, 349, 449),
      ip("galaxy-s25-plus",    "Galaxy S25+",        89,  159, 129, 269, 379, 479),
      ip("galaxy-s25-ultra",   "Galaxy S25 Ultra",   89,  179, 159, 329, 469, 569),
      ip("galaxy-s25-edge",    "Galaxy S25 Edge",    89,  159, 129, 279, 389, 489),
      // Foldables — Z Fold
      ip("galaxy-z-fold-3",    "Galaxy Z Fold3",     89,  189, 149, 499, 649, 799),
      ip("galaxy-z-fold-4",    "Galaxy Z Fold4",     89,  199, 149, 549, 699, 829),
      ip("galaxy-z-fold-5",    "Galaxy Z Fold5",     99,  219, 169, 579, 749, 879),
      ip("galaxy-z-fold-6",    "Galaxy Z Fold6",     99,  239, 179, 629, 819, 949),
      ip("galaxy-z-fold-7",    "Galaxy Z Fold7",     99,  259, 189, 679, 879, 999),
      // Foldables — Z Flip
      ip("galaxy-z-flip-3",    "Galaxy Z Flip3",     79,  149, 129, 349, 449, 549),
      ip("galaxy-z-flip-4",    "Galaxy Z Flip4",     79,  159, 129, 379, 479, 579),
      ip("galaxy-z-flip-5",    "Galaxy Z Flip5",     89,  169, 139, 399, 509, 599),
      ip("galaxy-z-flip-6",    "Galaxy Z Flip6",     89,  179, 149, 429, 539, 629),
      ip("galaxy-z-flip-7",    "Galaxy Z Flip7",     89,  189, 159, 459, 569, 659),
      // Note (still under 5 years for Note 20)
      ip("galaxy-note-20",     "Galaxy Note20",      79,  149, 119, 229, 319, 419),
      ip("galaxy-note-20-ult", "Galaxy Note20 Ultra",79,  169, 139, 279, 399, 499),
    ],
  },
  {
    key: "macbook",
    label: "MacBook",
    serviceLines: LAPTOP_LINES,
    models: [
      // MacBook Air — Apple Silicon
      mb("mba-13-m1",      "MacBook Air 13\" M1 (2020)",           179, 449, 349, 199, 549, 199),
      mb("mba-13-m2",      "MacBook Air 13\" M2 (2022)",           199, 499, 379, 219, 599, 219),
      mb("mba-15-m2",      "MacBook Air 15\" M2 (2023)",           219, 549, 399, 219, 649, 229),
      mb("mba-13-m3",      "MacBook Air 13\" M3 (2024)",           199, 519, 389, 219, 619, 229),
      mb("mba-15-m3",      "MacBook Air 15\" M3 (2024)",           219, 569, 419, 229, 679, 239),
      mb("mba-13-m4",      "MacBook Air 13\" M4 (2025)",           219, 549, 419, 229, 649, 239),
      mb("mba-15-m4",      "MacBook Air 15\" M4 (2025)",           239, 599, 449, 249, 699, 259),
      // MacBook Pro 13" — last Intel + M-series
      mb("mbp-13-2020",    "MacBook Pro 13\" (2020, Intel)",       189, 449, 349, 219, 599, 229),
      mb("mbp-13-m1",      "MacBook Pro 13\" M1 (2020)",           189, 459, 349, 219, 579, 219),
      mb("mbp-13-m2",      "MacBook Pro 13\" M2 (2022)",           199, 479, 369, 229, 599, 229),
      // MacBook Pro 14"
      mb("mbp-14-m1pro",   "MacBook Pro 14\" M1 Pro / Max (2021)", 229, 699, 499, 249, 799, 269),
      mb("mbp-14-m2pro",   "MacBook Pro 14\" M2 Pro / Max (2023)", 239, 729, 519, 249, 819, 279),
      mb("mbp-14-m3",      "MacBook Pro 14\" M3 (2023)",           229, 699, 489, 249, 779, 269),
      mb("mbp-14-m3pro",   "MacBook Pro 14\" M3 Pro / Max (2023)", 249, 749, 529, 259, 849, 289),
      mb("mbp-14-m4",      "MacBook Pro 14\" M4 (2024)",           239, 719, 509, 259, 799, 279),
      mb("mbp-14-m4pro",   "MacBook Pro 14\" M4 Pro / Max (2024)", 259, 779, 549, 269, 879, 299),
      // MacBook Pro 16"
      mb("mbp-16-2019",    "MacBook Pro 16\" (2019, Intel)",       199, 599, 429, 249, 749, 269),
      mb("mbp-16-m1",      "MacBook Pro 16\" M1 Pro / Max (2021)", 249, 799, 549, 269, 899, 299),
      mb("mbp-16-m2",      "MacBook Pro 16\" M2 Pro / Max (2023)", 259, 829, 569, 269, 919, 309),
      mb("mbp-16-m3",      "MacBook Pro 16\" M3 Pro / Max (2023)", 269, 849, 589, 279, 949, 319),
      mb("mbp-16-m4",      "MacBook Pro 16\" M4 Pro / Max (2024)", 279, 879, 609, 289, 979, 329),
    ],
  },
  {
    key: "other-laptop",
    label: "Other laptop",
    serviceLines: LAPTOP_LINES,
    models: [
      // Single placeholder — actual price requires in-shop diagnosis.
      // 0 renders as "Varies" in the estimator UI.
      mb("other", "Other (non-Mac laptop)", 0, 0, 0, 0, 0, 0),
    ],
  },
];

export function findModel(brandKey: string, modelKey: string): Model | undefined {
  return brands.find((b) => b.key === brandKey)?.models.find((m) => m.key === modelKey);
}

/** @deprecated Use brand.serviceLines instead. */
export const SERVICE_LINES = PHONE_LINES;
