import Image from "next/image";

type BrandLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

/** Shared Pravaas brand mark. Keep all product surfaces on the canonical /logo.png asset. */
export default function BrandLogo({ size = 40, className = "", priority = false }: BrandLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Pravaas"
      width={size}
      height={size}
      className={className}
      priority={priority}
    />
  );
}
