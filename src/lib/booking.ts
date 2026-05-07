// Booking flow data — device types, brands, models, issues.

export type DeviceTypeKey = "phone" | "tablet" | "laptop" | "console" | "other";

export type DeviceType = {
  key: DeviceTypeKey;
  label: string;
  emoji: string;
  description: string;
  hasStructuredCatalog: boolean; // true if we have brand+model lists
};

export const deviceTypes: DeviceType[] = [
  {
    key: "phone",
    label: "Phone",
    emoji: "📱",
    description: "iPhone, Samsung, Google, and more",
    hasStructuredCatalog: true,
  },
  {
    key: "tablet",
    label: "Tablet",
    emoji: "🖥️",
    description: "iPad, Galaxy Tab, Surface, and more",
    hasStructuredCatalog: true,
  },
  {
    key: "laptop",
    label: "Computer",
    emoji: "💻",
    description: "MacBook, Windows laptops, desktops",
    hasStructuredCatalog: true,
  },
  {
    key: "console",
    label: "Game Console",
    emoji: "🎮",
    description: "PlayStation, Xbox, Nintendo Switch",
    hasStructuredCatalog: true,
  },
  {
    key: "other",
    label: "Something else",
    emoji: "🛠️",
    description: "Smartwatches, drones, audio, anything",
    hasStructuredCatalog: false,
  },
];

// Brand → models map per device type.
type BrandRegistry = Record<DeviceTypeKey, { brand: string; models: string[] }[]>;

export const catalog: BrandRegistry = {
  phone: [
    {
      brand: "Apple",
      models: [
        "iPhone 17 Pro Max",
        "iPhone 17 Pro",
        "iPhone Air",
        "iPhone 17",
        "iPhone 16 Pro Max",
        "iPhone 16 Pro",
        "iPhone 16 Plus",
        "iPhone 16",
        "iPhone 16e",
        "iPhone 15 Pro Max",
        "iPhone 15 Pro",
        "iPhone 15 Plus",
        "iPhone 15",
        "iPhone 14 Pro Max",
        "iPhone 14 Pro",
        "iPhone 14 Plus",
        "iPhone 14",
        "iPhone 13 Pro Max",
        "iPhone 13 Pro",
        "iPhone 13",
        "iPhone 13 mini",
        "iPhone 12 Pro Max",
        "iPhone 12 Pro",
        "iPhone 12",
        "iPhone 12 mini",
        "iPhone 11 Pro Max",
        "iPhone 11 Pro",
        "iPhone 11",
        "iPhone XS Max",
        "iPhone XS",
        "iPhone XR",
        "iPhone X",
        "iPhone SE (3rd gen)",
        "iPhone SE (2nd gen)",
        "Other iPhone",
      ],
    },
    {
      brand: "Samsung",
      models: [
        "Galaxy S25 Ultra",
        "Galaxy S25 Edge",
        "Galaxy S25+",
        "Galaxy S25",
        "Galaxy S24 Ultra",
        "Galaxy S24+",
        "Galaxy S24",
        "Galaxy S24 FE",
        "Galaxy S23 Ultra",
        "Galaxy S23+",
        "Galaxy S23",
        "Galaxy S23 FE",
        "Galaxy S22 Ultra",
        "Galaxy S22+",
        "Galaxy S22",
        "Galaxy S21 Ultra",
        "Galaxy S21+",
        "Galaxy S21",
        "Galaxy Z Fold7",
        "Galaxy Z Fold6",
        "Galaxy Z Fold5",
        "Galaxy Z Fold4",
        "Galaxy Z Fold3",
        "Galaxy Z Flip7",
        "Galaxy Z Flip6",
        "Galaxy Z Flip5",
        "Galaxy Z Flip4",
        "Galaxy Z Flip3",
        "Galaxy Note20 Ultra",
        "Galaxy Note20",
        "Galaxy A series",
        "Other Samsung",
      ],
    },
    { brand: "Google", models: ["Pixel 9 Pro XL", "Pixel 9 Pro", "Pixel 9", "Pixel 8 Pro", "Pixel 8", "Pixel 8a", "Pixel 7 Pro", "Pixel 7", "Pixel 7a", "Pixel 6 Pro", "Pixel 6", "Pixel 6a", "Pixel Fold", "Pixel 5", "Pixel 5a", "Other Pixel"] },
    { brand: "OnePlus", models: ["OnePlus 12", "OnePlus 11", "OnePlus 10 Pro", "OnePlus 10T", "OnePlus 9 Pro", "OnePlus 9", "OnePlus Nord", "Other OnePlus"] },
    { brand: "Motorola", models: ["Razr 50 Ultra", "Razr 50", "Edge 50 Pro", "Edge 50", "Edge 40", "Moto G Power", "Moto G Stylus", "Moto G", "Other Motorola"] },
    { brand: "LG", models: ["G8", "V60 ThinQ", "Velvet", "Wing", "G7", "Other LG"] },
    { brand: "Other", models: ["Tell us in the description"] },
  ],
  tablet: [
    {
      brand: "Apple",
      models: [
        "iPad Pro 13\" (M4)",
        "iPad Pro 11\" (M4)",
        "iPad Air 13\"",
        "iPad Air 11\"",
        "iPad (10th gen)",
        "iPad (9th gen)",
        "iPad mini 7",
        "iPad mini 6",
        "Older iPad",
      ],
    },
    {
      brand: "Samsung",
      models: [
        "Galaxy Tab S10 Ultra",
        "Galaxy Tab S10+",
        "Galaxy Tab S9 Ultra",
        "Galaxy Tab S9+",
        "Galaxy Tab S9",
        "Galaxy Tab A series",
        "Other Galaxy Tab",
      ],
    },
    { brand: "Microsoft", models: ["Surface Pro 11", "Surface Pro 10", "Surface Pro 9", "Surface Go", "Other Surface"] },
    { brand: "Other", models: ["Tell us in the description"] },
  ],
  laptop: [
    { brand: "Apple", models: ["MacBook Pro 16\" (M4)", "MacBook Pro 14\" (M4)", "MacBook Air 15\" (M3)", "MacBook Air 13\" (M3)", "MacBook Air (M2)", "MacBook Pro (M3/M2)", "MacBook Pro (M1)", "MacBook Air (M1)", "Older MacBook"] },
    { brand: "Dell", models: ["XPS 13", "XPS 15", "XPS 17", "Inspiron", "Latitude", "Other Dell"] },
    { brand: "HP", models: ["Spectre x360", "EliteBook", "Pavilion", "Envy", "Other HP"] },
    { brand: "Lenovo", models: ["ThinkPad", "Yoga", "IdeaPad", "Legion", "Other Lenovo"] },
    { brand: "Microsoft", models: ["Surface Laptop", "Surface Book", "Other Surface"] },
    { brand: "ASUS", models: ["ZenBook", "ROG", "VivoBook", "Other ASUS"] },
    { brand: "Acer", models: ["Predator", "Aspire", "Swift", "Other Acer"] },
    { brand: "Other", models: ["Tell us in the description"] },
  ],
  console: [
    { brand: "Sony", models: ["PlayStation 5 Pro", "PlayStation 5", "PlayStation 5 Slim", "PlayStation 4 Pro", "PlayStation 4", "DualSense controller", "DualShock controller"] },
    { brand: "Microsoft", models: ["Xbox Series X", "Xbox Series S", "Xbox One X", "Xbox One S", "Xbox controller"] },
    { brand: "Nintendo", models: ["Switch 2", "Switch OLED", "Switch", "Switch Lite", "Joy-Cons", "Pro Controller"] },
    { brand: "Other", models: ["Tell us in the description"] },
  ],
  other: [],
};

export const issuesByDevice: Record<DeviceTypeKey, string[]> = {
  phone: [
    "Broken Screen",
    "Won't Charge",
    "Bad Battery / Short Battery Life",
    "Charging Port",
    "Water / Liquid Damage",
    "Back Glass / Housing",
    "Camera",
    "Speaker / Microphone",
    "Bluetooth / Wi-Fi Issue",
    "Software / Activation",
    "Won't Turn On",
    "I don't know / Other",
  ],
  tablet: [
    "Broken Screen",
    "Won't Charge",
    "Bad Battery",
    "Charging Port",
    "Water / Liquid Damage",
    "Back Housing",
    "Camera",
    "Speaker / Microphone",
    "Wi-Fi / Bluetooth Issue",
    "Software / Activation",
    "Won't Turn On",
    "I don't know / Other",
  ],
  laptop: [
    "Broken Screen",
    "Won't Turn On",
    "Bad Battery",
    "Keyboard",
    "Trackpad",
    "Charging Port",
    "Liquid Spill",
    "Slow Performance",
    "Software / OS Reinstall",
    "Virus / Malware Removal",
    "Data Recovery",
    "I don't know / Other",
  ],
  console: [
    "Won't Turn On",
    "HDMI Port",
    "Disc Drive",
    "Overheating / Loud Fan",
    "Controller Pairing",
    "Joy-Con Drift",
    "Liquid Damage",
    "Software / Update Issue",
    "Other",
  ],
  other: [
    "Won't Turn On",
    "Won't Charge",
    "Cracked / Damaged",
    "Liquid Damage",
    "Software / Pairing",
    "Other",
  ],
};

export type ContactInfo = {
  name: string;
  email: string;
  phone: string;
};

export type BookingState = {
  deviceType?: DeviceTypeKey;
  brand?: string;
  model?: string;
  customDevice?: string; // for "other"
  issues: string[];
  description: string;
  /** YYYY-MM-DD */
  date?: string;
  /** "HH:MM" 24h */
  time?: string;
  contact: ContactInfo;
};

export const emptyBookingState: BookingState = {
  deviceType: undefined,
  brand: undefined,
  model: undefined,
  customDevice: undefined,
  issues: [],
  description: "",
  date: undefined,
  time: undefined,
  contact: { name: "", email: "", phone: "" },
};

// Shop hours — Mon..Sat open 10:00–19:00, Sun closed.
// Slot length: 30 minutes. Last bookable slot starts at 18:30.
export const shopHours = {
  weeklySchedule: {
    0: null, // Sunday — closed
    1: { open: "10:00", close: "19:00" },
    2: { open: "10:00", close: "19:00" },
    3: { open: "10:00", close: "19:00" },
    4: { open: "10:00", close: "19:00" },
    5: { open: "10:00", close: "19:00" },
    6: { open: "10:00", close: "19:00" },
  } as Record<number, { open: string; close: string } | null>,
  slotMinutes: 30,
  /** how many days into the future you can book */
  bookingHorizonDays: 30,
};

export function isOpenOn(date: Date): boolean {
  return shopHours.weeklySchedule[date.getDay()] !== null;
}

export function generateTimeSlots(date: Date): string[] {
  const day = shopHours.weeklySchedule[date.getDay()];
  if (!day) return [];
  const [oH, oM] = day.open.split(":").map(Number);
  const [cH, cM] = day.close.split(":").map(Number);
  const slots: string[] = [];
  let h = oH;
  let m = oM;
  while (h < cH || (h === cH && m <= cM - shopHours.slotMinutes)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += shopHours.slotMinutes;
    if (m >= 60) {
      h += 1;
      m -= 60;
    }
  }
  return slots;
}

export function formatTime12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatDateLong(iso: string): string {
  // iso = YYYY-MM-DD
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function generateReference(): string {
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `MM-${t}${r}`;
}

export function brandsFor(deviceType: DeviceTypeKey | undefined) {
  if (!deviceType) return [];
  return catalog[deviceType] ?? [];
}

export function modelsFor(deviceType: DeviceTypeKey | undefined, brand: string | undefined) {
  if (!deviceType || !brand) return [];
  return catalog[deviceType]?.find((b) => b.brand === brand)?.models ?? [];
}

export function deviceLabelFor(state: BookingState): string {
  if (state.deviceType === "other") return state.customDevice || "Device";
  const parts = [state.brand, state.model].filter(Boolean);
  return parts.join(" ") || deviceTypes.find((d) => d.key === state.deviceType)?.label || "Device";
}
