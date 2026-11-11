import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/cn";
import type { KanbanColumn } from "@/lib/mock-campaigns";

// Rebuilt from the  (416:64240) Task Management
// section: "Manage tasks and subtasks for this campaign" with the four
// columns TO DO (4), IN PROGRESS (2), AWAITING REVIEW (1), COMPLETED (3).
export function TaskBoard({ columns }: { columns: KanbanColumn[] }) {
  return (
    <Card className="p-6">
      <h2 className="text-[18px] font-bold text-ink-900 dark:text-ink-50">Task Management</h2>
      <p className="mt-1 text-[14px] text-ink-500 dark:text-ink-300">
        Manage tasks and subtasks for this campaign
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => (
          <div
            key={col.title}
            className="rounded-xl bg-ink-50 dark:bg-ink-900 p-3"
          >
            <div className="flex items-center justify-between px-1 pb-3">
              <span className="text-[12px] font-bold tracking-wide text-ink-500 dark:text-ink-300 uppercase">
                {col.title}
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-ink-900 text-xs font-bold text-ink-700 dark:text-ink-200 shadow-card">
                {col.count}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {col.tasks.map((t) => (
                <div
                  key={t.title}
                  className="rounded-xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-3.5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[14px] font-semibold text-ink-900 dark:text-ink-50">
                      {t.title}
                    </p>
                    {t.tag && (
                      <Tag tone="danger" className="h-7 px-2.5 text-xs">
                        {t.tag}
                      </Tag>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] text-ink-500 dark:text-ink-300">{t.meta}</p>
                  {typeof t.progress === "number" && (
                    <div className="mt-2.5">
                      <div className="h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{ width: `${t.progress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-right text-xs font-semibold text-ink-500 dark:text-ink-300">
                        {t.progress}%
                      </p>
                    </div>
                  )}
                  <div className="mt-2.5 flex items-center justify-between">
                    <button className="cursor-pointer text-[13px] font-semibold text-brand dark:text-brand-200 hover:underline">
                      + Add task
                    </button>
                    {t.assignee && (
                      <span
                        aria-hidden
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full",
                          "bg-brand-100 dark:bg-brand/25 text-[11px] font-bold text-brand dark:text-brand-200"
                        )}
                      >
                        {t.assignee}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
