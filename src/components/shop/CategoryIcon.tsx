type IconKind =
  | "phone"
  | "phone-case"
  | "headphones"
  | "watch"
  | "watch-strap"
  | "gamepad"
  | "cable"
  | "battery"
  | "wireless"
  | "plug"
  | "keyboard"
  | "mic"
  | "tripod"
  | "hdd"
  | "wrench"
  | "apple"
  | "tag";

const baseProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function CategoryIcon({ kind, className = "" }: { kind: IconKind; className?: string }) {
  const cls = `block ${className}`;
  switch (kind) {
    case "phone":
      return (
        <svg {...baseProps} className={cls}>
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <line x1="11" y1="5" x2="13" y2="5" />
          <circle cx="12" cy="19" r="0.6" fill="currentColor" />
        </svg>
      );
    case "phone-case":
      return (
        <svg {...baseProps} className={cls}>
          <rect x="6" y="2" width="12" height="20" rx="3" />
          <rect x="9" y="5" width="3" height="3" rx="0.5" />
          <circle cx="10.5" cy="6.5" r="0.6" fill="currentColor" />
        </svg>
      );
    case "headphones":
      return (
        <svg {...baseProps} className={cls}>
          <path d="M3 14a9 9 0 0 1 18 0" />
          <rect x="3" y="14" width="4" height="6" rx="1.5" />
          <rect x="17" y="14" width="4" height="6" rx="1.5" />
        </svg>
      );
    case "watch":
      return (
        <svg {...baseProps} className={cls}>
          <rect x="7" y="6" width="10" height="12" rx="2.5" />
          <path d="M9 6 L10 3 L14 3 L15 6" />
          <path d="M9 18 L10 21 L14 21 L15 18" />
          <path d="M12 10 L12 12 L14 13" />
        </svg>
      );
    case "watch-strap":
      return (
        <svg {...baseProps} className={cls}>
          <path d="M5 12c2-1 4-1 7-1s5 0 7 1" />
          <rect x="9" y="9" width="6" height="6" rx="1.5" />
          <path d="M5 12c0-1 0-2 1-3" />
          <path d="M19 12c0-1 0-2-1-3" />
        </svg>
      );
    case "gamepad":
      return (
        <svg {...baseProps} className={cls}>
          <path d="M6 16 C5 14 5 9 6 8 C8 7 16 7 18 8 C19 9 19 14 18 16 C16 17 14 14 13 14 H11 C10 14 8 17 6 16 Z" />
          <line x1="8" y1="11" x2="10" y2="11" />
          <line x1="9" y1="10" x2="9" y2="12" />
          <circle cx="14.5" cy="11" r="0.7" fill="currentColor" />
          <circle cx="16.5" cy="12" r="0.7" fill="currentColor" />
        </svg>
      );
    case "cable":
      return (
        <svg {...baseProps} className={cls}>
          <path d="M4 12 H8 V14 H10 V10 H8 V12" />
          <path d="M10 12 C12 12 14 18 18 16" />
          <path d="M16 16 V20" />
          <rect x="14" y="14" width="4" height="2" rx="0.5" />
        </svg>
      );
    case "battery":
      return (
        <svg {...baseProps} className={cls}>
          <rect x="3" y="7" width="16" height="10" rx="2" />
          <line x1="20.5" y1="10" x2="20.5" y2="14" strokeWidth="2.4" />
          <rect x="5" y="9" width="9" height="6" rx="0.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "wireless":
      return (
        <svg {...baseProps} className={cls}>
          <path d="M5 14 a7 7 0 0 1 14 0" />
          <path d="M8 14 a4 4 0 0 1 8 0" />
          <circle cx="12" cy="14" r="1" fill="currentColor" />
        </svg>
      );
    case "plug":
      return (
        <svg {...baseProps} className={cls}>
          <line x1="9" y1="3" x2="9" y2="8" />
          <line x1="15" y1="3" x2="15" y2="8" />
          <path d="M6 8 H18 V12 a6 6 0 0 1 -12 0 Z" />
          <line x1="12" y1="18" x2="12" y2="22" />
        </svg>
      );
    case "keyboard":
      return (
        <svg {...baseProps} className={cls}>
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <line x1="6" y1="10" x2="6.01" y2="10" />
          <line x1="10" y1="10" x2="10.01" y2="10" />
          <line x1="14" y1="10" x2="14.01" y2="10" />
          <line x1="18" y1="10" x2="18.01" y2="10" />
          <line x1="8" y1="14" x2="16" y2="14" />
        </svg>
      );
    case "mic":
      return (
        <svg {...baseProps} className={cls}>
          <rect x="9" y="3" width="6" height="12" rx="3" />
          <path d="M5 11 a7 7 0 0 0 14 0" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="9" y1="22" x2="15" y2="22" />
        </svg>
      );
    case "tripod":
      return (
        <svg {...baseProps} className={cls}>
          <rect x="9" y="3" width="6" height="6" rx="1" />
          <line x1="12" y1="9" x2="12" y2="15" />
          <line x1="12" y1="15" x2="6" y2="21" />
          <line x1="12" y1="15" x2="18" y2="21" />
          <line x1="12" y1="15" x2="12" y2="22" />
        </svg>
      );
    case "hdd":
      return (
        <svg {...baseProps} className={cls}>
          <rect x="3" y="7" width="18" height="10" rx="2" />
          <circle cx="7" cy="12" r="1.6" />
          <line x1="11" y1="12" x2="18" y2="12" />
        </svg>
      );
    case "wrench":
      return (
        <svg {...baseProps} className={cls}>
          <path d="M14 6 a4 4 0 0 1 4 4 a4 4 0 0 1 -1.4 3 L20 16 L16 20 L13 16.6 a4 4 0 0 1 -3 1.4 a4 4 0 0 1 -4 -4 a4 4 0 0 1 4 -4 c1 0 1.7 .3 2.4 .8 L14 6 Z" />
        </svg>
      );
    case "apple":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cls}>
          <path d="M16 12.5c0-2 1.6-3 1.7-3-.9-1.3-2.3-1.5-2.8-1.5-1.2-.1-2.3.7-2.9.7-.6 0-1.5-.7-2.5-.7-1.3 0-2.5.8-3.2 1.9-1.4 2.4-.4 5.9 1 7.8.7 1 1.4 2 2.4 2 1 0 1.4-.6 2.5-.6s1.5.6 2.5.6c1 0 1.7-1 2.4-1.9.7-1.1 1-2.2 1-2.2 0 0-2-.8-2.1-3.1zM14 6.5c.5-.6.9-1.5.8-2.4-.7 0-1.6.5-2.2 1.1-.5.6-.9 1.4-.8 2.3.8.1 1.6-.4 2.2-1z" />
        </svg>
      );
    case "tag":
    default:
      return (
        <svg {...baseProps} className={cls}>
          <path d="M3 12 L12 3 L21 12 L12 21 Z" />
          <circle cx="9" cy="9" r="1" fill="currentColor" />
        </svg>
      );
  }
}

/** Map a Shopify collection handle (or title fallback) to an icon kind. */
export function iconForCollection(handle: string, title: string): IconKind {
  const h = handle.toLowerCase();
  const t = title.toLowerCase();

  if (h.includes("airpod") || t.includes("airpod")) return "headphones";
  if (h.includes("ear-phones") || h.includes("headphone") || t.includes("headphone") || t.includes("ear phones")) return "headphones";
  if (h.includes("mic") || t === "mics") return "mic";
  if (h.includes("watch-strap") || t.includes("strap")) return "watch-strap";
  if (h.includes("watch") || t.includes("watch")) return "watch";
  if (h.includes("playstation") || h.includes("xbox") || h.includes("gaming") || h.includes("console") || t.includes("playstation") || t.includes("xbox") || t.includes("gaming") || t.includes("console")) return "gamepad";
  if (h.includes("cable") || h.includes("adapter") || t.includes("cable")) return "cable";
  if (h.includes("power-bank") || t.includes("power bank") || t.includes("powerbank")) return "battery";
  if (h.includes("wireless") || t.includes("wireless")) return "wireless";
  if (h.includes("wall") || h.includes("charger") || t.includes("charger")) return "plug";
  if (h.includes("kayboard") || h.includes("keyboard") || h.includes("mouse") || t.includes("keyboard")) return "keyboard";
  if (h.includes("stand") || h.includes("gimbal") || t.includes("gimbal")) return "tripod";
  if (h.includes("storage") || h.includes("hub") || t.includes("storage") || t.includes("ssd") || t.includes("hdd")) return "hdd";
  if (h.includes("repair") || t.includes("repair")) return "wrench";
  if (h.includes("samsung") || t.includes("samsung")) return "phone";
  if (h.includes("apple-products") || t.includes("apple products")) return "apple";
  if (h.includes("case") || t.includes("case")) return "phone-case";
  if (h.includes("iphone") || t.includes("iphone")) return "phone";

  return "tag";
}
