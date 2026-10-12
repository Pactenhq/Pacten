import Image from "next/image";
import { cn } from "@/lib/cn";

export function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const px = size === "sm" ? 36 : size === "lg" ? 64 : 48;
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100",
        className
      )}
      style={{ width: px, height: px }}
      title={name}
    >
      {src ? (
        <Image src={src} alt={name} width={px} height={px} />
      ) : (
        <span className="font-semibold text-brand">{initials}</span>
      )}
    </span>
  );
}
