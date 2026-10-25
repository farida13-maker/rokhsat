import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { faDays } from "@/lib/jalali";
import { balanceOf, balancePhrase } from "@/lib/leave-math";
import { useDesk } from "@/lib/store";
import type { Employee } from "@/lib/types";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}` || "ن";
}

export function PeoplePanel({
  query,
  onQuery,
  onCreate,
  onEdit,
  onDelete,
  onReset,
}: {
  query: string;
  onQuery: (value: string) => void;
  onCreate: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onReset: () => void;
}) {
  const employees = useDesk((state) => state.employees);
  const leaves = useDesk((state) => state.leaves);
  const customs = useDesk((state) => state.customs);
  const thursdayOff = useDesk((state) => state.thursdayOff);
  const selectedId = useDesk((state) => state.selectedId);
  const select = useDesk((state) => state.select);
  const viewY = useDesk((state) => state.viewY);
  const viewM = useDesk((state) => state.viewM);

  const needle = query.trim().replace(/ي/g, "ی").replace(/ك/g, "ک");
  const people = [...employees]
    .sort((a, b) => a.name.localeCompare(b.name, "fa"))
    .filter((person) => {
      if (!needle) return true;
      const hay = `${person.name} ${person.role}`.replace(/ي/g, "ی").replace(/ك/g, "ک");
      return hay.includes(needle);
    });

  return (
    <section className="rounded-2xl border border-line bg-card p-4 shadow-card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">نیروها</h2>
          <p className="text-sm text-muted">سمت هر نفر را خودتان تعیین می‌کنید.</p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-cypress px-3 font-semibold text-card hover:bg-cypress-deep"
        >
          <Plus className="size-4" />
          افزودن
        </button>
      </div>
      <label className="mb-3 flex min-h-11 items-center gap-2 rounded-xl border border-line bg-paper px-3">
        <Search className="size-4 text-muted" />
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="جستجوی نام یا سمت"
          className="min-h-11 w-full bg-transparent outline-none"
        />
      </label>
      {people.length === 0 ? (
        <p className="rounded-xl bg-paper px-3 py-6 text-center text-sm text-muted">
          {employees.length === 0 ? "هنوز نیرویی ثبت نشده است." : "کسی با این مشخصات پیدا نشد."}
        </p>
      ) : (
        <ul className="grid gap-2">
          {people.map((person) => {
            const balance = balanceOf(person, viewY, viewM, leaves, customs, thursdayOff);
            const ratio = balance.entitled > 0 ? Math.min(1, balance.used / balance.entitled) : 0;
            const selected = person.id === selectedId;
            return (
              <li key={person.id}>
                <div
                  className={cn(
                    "flex gap-2 rounded-2xl border p-2",
                    selected ? "border-cypress bg-cypress-soft" : "border-line bg-card",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => select(person.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1 py-1 text-right"
                  >
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-cypress font-extrabold text-card">
                      {initials(person.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-extrabold">{person.name}</span>
                      <span className="block truncate text-sm text-muted">{person.role}</span>
                      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-line">
                        <span
                          className={cn("block h-full rounded-full", balance.left < 0 ? "bg-copper-deep" : "bg-copper")}
                          style={{ width: `${ratio * 100}%` }}
                        />
                      </span>
                      <span className={cn("mt-1 block text-xs", balance.left < 0 ? "text-copper-deep" : "text-muted")}>
                        {balance.entitled <= 0
                          ? "هنوز استحقاقی ندارد"
                          : `${balancePhrase(balance.left)} از ${faDays(balance.entitled)}`}
                      </span>
                    </span>
                  </button>
                  <div className="flex shrink-0 flex-col">
                    <button type="button" className="inline-flex size-11 items-center justify-center rounded-xl text-ink hover:bg-paper" aria-label={`ویرایش ${person.name}`} onClick={() => onEdit(person)}>
                      <Pencil className="size-4" />
                    </button>
                    <button type="button" className="inline-flex size-11 items-center justify-center rounded-xl text-copper-deep hover:bg-copper-soft" aria-label={`حذف ${person.name}`} onClick={() => onDelete(person)}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <button type="button" onClick={onReset} className="mt-3 min-h-11 text-sm text-muted underline-offset-4 hover:underline">
        بازگشت به داده‌های نمونه
      </button>
    </section>
  );
}
