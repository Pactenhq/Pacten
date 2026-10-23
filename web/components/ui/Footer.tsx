import Link from "next/link";

// Rebuilt from the design footer ("destop home" 90:2):
// brand block, 5 link columns, divider, centered copyright.
const columns: Array<{ title: string; links: Array<[string, string]> }> = [
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Contact", "/contact"],
      ["FAQ", "/pricing#faq"],
    ],
  },
  {
    title: "Creators",
    links: [
      ["Marketplace", "/creators"],
      ["Become a Creator", "/signup/creator"],
    ],
  },
  {
    title: "Brands",
    links: [
      ["Find Creators", "/creators"],
      ["Post Campaign", "/dashboard/brand"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy"],
      ["Terms of Service", "/terms"],
    ],
  },
  {
    title: "Follow Pacten",
    links: [
      ["LinkedIn", "https://www.linkedin.com"],
      ["Instagram", "https://www.instagram.com"],
      ["TikTok", "https://www.tiktok.com"],
    ],
  },
];

export function Footer({ logoTone = "dark" }: { logoTone?: "dark" | "brand" }) {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-[1380px] px-6 pb-8 pt-12 lg:px-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-[233px]">
            <p
              className={
                logoTone === "brand"
                  ? "text-[28px] font-extrabold tracking-tight text-brand"
                  : "text-[28px] font-extrabold tracking-tight text-ink-900"
              }
            >
              Pacten
            </p>
            <p className="mt-1 text-[15px] text-ink-500">
              The world&apos;s creator marketplace.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-3 lg:flex lg:gap-16">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-ink-900">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="footer-link text-sm text-ink-500 hover:text-ink-900"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 border-t border-ink-100 pt-6">
          <p className="text-center text-sm text-ink-500">
            © 2025 Pacten Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
