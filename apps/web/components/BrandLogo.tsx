import Image from "next/image";

type BrandLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

/** Canonical Pravaas wordmark. Keep shared navigation branding aligned with the brand asset. */
export default function BrandLogo({ size = 40, className = "", priority = false }: BrandLogoProps) {
  return (
    <Image
      src="/brand-wordmark.svg"
      alt="Pravaas"
      width={size * 4.6}
      height={size}
      className={className}
      priority={priority}
      unoptimized
    />
  );
}
