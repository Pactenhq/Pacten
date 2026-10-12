import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

// Shared shell for auth screens: nav, centered card, footer.
// Card widths: login 662x524, signups 662x695.
export function AuthShell({
  title,
  subtitle,
  children,
  wide,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <>
      <Navbar />
      <main className="bg-mist/50">
        <div className="mx-auto flex min-h-[70vh] max-w-[1380px] items-center justify-center px-6 py-16 lg:px-12 lg:py-24">
          <Card
            className={cn(
              "w-full p-6 shadow-pop sm:p-10",
              wide ? "max-w-[662px]" : "max-w-[560px]",
              className
            )}
          >
            <h1 className="text-center text-3xl font-extrabold tracking-tight text-ink-900 lg:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 text-center text-[15px] text-ink-500">
                {subtitle}
              </p>
            )}
            <div className="mt-8">{children}</div>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
