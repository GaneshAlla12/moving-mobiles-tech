import type { DeviceTypeKey } from "@/lib/booking";

type Props = { type: DeviceTypeKey; className?: string };

export default function DeviceIcon({ type, className = "" }: Props) {
  switch (type) {
    case "phone":
      return <Phone className={className} />;
    case "tablet":
      return <Tablet className={className} />;
    case "laptop":
      return <Laptop className={className} />;
    case "console":
      return <Console className={className} />;
    case "other":
    default:
      return <Other className={className} />;
  }
}

const baseSvg = "block";

function Phone({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={`${baseSvg} ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <rect x="30" y="12" width="36" height="72" rx="7" />
      <line x1="44" y1="20" x2="52" y2="20" strokeWidth="1.4" />
      <circle cx="48" cy="76" r="1.6" fill="currentColor" stroke="none" />
      <rect
        x="34"
        y="24"
        width="28"
        height="44"
        rx="2"
        opacity="0.4"
      />
    </svg>
  );
}

function Tablet({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={`${baseSvg} ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <rect x="20" y="14" width="56" height="68" rx="6" />
      <line x1="44" y1="20" x2="52" y2="20" strokeWidth="1.4" />
      <circle cx="48" cy="74" r="1.6" fill="currentColor" stroke="none" />
      <rect
        x="24"
        y="24"
        width="48"
        height="44"
        rx="2"
        opacity="0.4"
      />
    </svg>
  );
}

function Laptop({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={`${baseSvg} ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <rect x="18" y="22" width="60" height="40" rx="3" />
      <rect x="22" y="26" width="52" height="32" rx="1.5" opacity="0.4" />
      <line x1="14" y1="68" x2="82" y2="68" strokeWidth="2" />
      <path d="M8 74 H88 L84 80 H12 Z" fill="currentColor" opacity="0.08" />
    </svg>
  );
}

function Console({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={`${baseSvg} ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M22 32 C20 36 16 50 16 58 C16 68 22 70 28 64 L34 56 H62 L68 64 C74 70 80 68 80 58 C80 50 76 36 74 32 C70 26 66 26 58 26 H38 C30 26 26 26 22 32 Z" />
      <circle cx="34" cy="48" r="3" fill="currentColor" stroke="none" opacity="0.7" />
      <line x1="62" y1="44" x2="68" y2="44" />
      <line x1="65" y1="41" x2="65" y2="47" />
      <circle cx="60" cy="52" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="70" cy="52" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Other({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={`${baseSvg} ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      {/* Wrench + screwdriver crossed */}
      <path d="M56 30 a8 8 0 1 0 -10 10 L24 62 a4 4 0 0 0 0 6 l4 4 a4 4 0 0 0 6 0 L56 50 a8 8 0 0 0 0 -20 Z" />
      <line x1="38" y1="30" x2="22" y2="46" strokeWidth="1.6" />
      <rect x="54" y="42" width="6" height="20" transform="rotate(-45 57 52)" fill="currentColor" stroke="none" opacity="0.7" />
      <rect x="58" y="60" width="22" height="6" transform="rotate(-45 69 63)" fill="currentColor" stroke="none" />
    </svg>
  );
}
