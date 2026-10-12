import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import {
  notificationGroups,
  type NotificationIcon,
} from "@/lib/mock-billing";

// desktop +
// "mob Notification" (376:36317) mobile.
// NOTE: the frame uses the public nav (no dashboard sidebar); followed as
// drawn. All notification copy verbatim from the frame.
function RowIcon({ icon }: { icon: NotificationIcon }) {
  const paths: Record<NotificationIcon, React.ReactNode> = {
    check: (
      <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ),
    chat: <path d="M4 5h16v10H9l-5 4V5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    star: (
      <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.4l6.1-.8L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    ),
    wrench: (
      <path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14 13l-3-3 3.7-3.7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    ),
  };
  return (
    <span
      aria-hidden
      className="flex h-[55px] w-[55px] shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {paths[icon]}
      </svg>
    </span>
  );
}

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-[1316px] px-6 py-12 lg:py-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 lg:text-4xl">
          Notification
        </h1>

        <div className="mt-10 flex flex-col gap-10">
          {notificationGroups.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <h2 className="text-[15px] font-semibold text-ink-500">
                {group.label}
              </h2>
              <ul className="mt-4 flex flex-col">
                {group.items.map((n) => (
                  <li
                    key={n.id}
                    className="flex items-center gap-4 border-b border-ink-100 py-4 last:border-0"
                  >
                    <RowIcon icon={n.icon} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold text-ink-900">
                        {n.title}
                      </p>
                      <p className="truncate text-sm text-ink-500">{n.body}</p>
                    </div>
                    <span className="shrink-0 text-[13px] text-ink-400">
                      {n.time}
                    </span>
                    <button
                      type="button"
                      aria-label="Notification options"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle cx="12" cy="5" r="1.6" fill="currentColor" />
                        <circle cx="12" cy="12" r="1.6" fill="currentColor" />
                        <circle cx="12" cy="19" r="1.6" fill="currentColor" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
