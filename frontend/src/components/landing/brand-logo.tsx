import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  /** Rendered height in pixels; width scales to the cropped wordmark. */
  height?: number;
  priority?: boolean;
}

/**
 * Kizuna wordmark (public/Kizunafinallogo.jpeg). The source is black on
 * white, so it lives inside a white chip — deliberate on dark surfaces,
 * seamless on light ones. `object-cover` crops the JPEG's tall white
 * margins down to the wordmark band.
 */
export function BrandLogo({
  className,
  height = 26,
  priority = false,
}: BrandLogoProps) {
  const chipHeight = height;
  const width = Math.round(chipHeight * 4.4);

  return (
    <span
      className={cn(
        "inline-flex items-center overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-border/60 dark:ring-white/15",
        className,
      )}
      style={{ height: chipHeight, width }}
    >
      <Image
        src="/Kizunafinallogo.jpeg"
        alt="Kizuna"
        width={width}
        height={chipHeight}
        priority={priority}
        className="size-full object-cover"
      />
    </span>
  );
}
