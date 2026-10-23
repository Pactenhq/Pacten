import type { ReactNode } from "react";
import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";

/** Simple marketing/info page shell used by /about, /contact,
 *  /privacy and /terms so the footer links land on real pages. */
export function InfoPage({
  tag,
  title,
  intro,
  children,
}: {
  tag: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-[846px] px-6 py-16 lg:py-20">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">
          {tag}
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink-900">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 text-lg leading-relaxed text-ink-500">{intro}</p>
        )}
        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink-700">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function InfoSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold text-ink-900">{heading}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}
