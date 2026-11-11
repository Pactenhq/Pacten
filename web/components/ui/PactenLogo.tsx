// Shared Pacten brand logo (supplied vector).
// The mark is black + brand blue on transparent, so on a dark header the
// black parts would vanish. A light variant (black fills -> white, blue
// kept) lives at /assets/logo-pacten-light.svg; the two <img>s swap with
// pure CSS (dark: variants), so the right logo shows with no JS and no
// flash once the theme class is set.
import { cn } from "@/lib/cn";

export function PactenLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/logo-pacten.svg" alt="Pacten" className={cn(className, "dark:hidden")} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/logo-pacten-light.svg" alt="Pacten" className={cn(className, "hidden dark:block")} />
    </>
  );
}
