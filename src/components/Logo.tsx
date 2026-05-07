import Image from "next/image";

type Props = {
  /** Pixel size of the badge. Default 40. */
  size?: number;
  className?: string;
};

/**
 * Circular Moving Mobiles logo badge. The source PNG has a black
 * surround, so we mask it into a circle and rest it on the brand
 * black ring so the edges blend on both light + dark backgrounds.
 */
export default function Logo({ size = 40, className = "" }: Props) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full bg-black overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      aria-label="Moving Mobiles Tech"
    >
      <Image
        src="/logo.jpg"
        alt=""
        width={size * 2}
        height={size * 2}
        priority
        className="h-full w-full object-cover"
      />
    </span>
  );
}
