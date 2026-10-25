import { cn } from "@/lib/cn";
import { fa, faDays, jalaaliMonthLength, MONTHS, todayJalaali, WEEKDAYS_SHORT, weekdayIndex } from "@/lib/jalali";
import { dayContext, monthStats, toneClass } from "@/lib/leave-math";
import { useDesk } from "@/lib/store";

export function TeamGrid({ onPick }: { onPick: (employeeId: string, day: number) => void }) {
  const employees = useDesk((state) => state.employees);
  const leaves = useDesk((state) => state.leaves);
  const customs = useDesk((state) => state.customs);
  const thursdayOff = useDesk((state) => state.thursdayOff);
  const selectedId = useDesk((state) => state.selectedId);
  const select = useDesk((state) => state.select);
  const viewY = useDesk((state) => state.viewY);
  const viewM = useDesk((state) => state.viewM);
  const today = todayJalaali();
  const len = jalaaliMonthLength(viewY, viewM);
  const people = [...employees].sort((a, b) => a.name.localeCompare(b.name, "fa"));

  if (!people.length) return null;

  return (
    <section className="min-w-0 rounded-2xl border border-line bg-card p-4 shadow-card">
      <h2 className="text-lg font-extrabold">نمای گروهی {MONTHS[viewM - 1]}</h2>
      <p className="mb-3 text-sm text-muted">هر خانه یک روز است. خانه را لمس کنید تا مرخصی همان نفر ثبت شود.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] table-fixed border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="sticky right-0 z-10 w-28 bg-card p-2 text-right text-sm font-semibold text-muted sm:w-36">نیرو</th>
              {Array.from({ length: len }, (_, index) => {
                const day = index + 1;
                const week = weekdayIndex(viewY, viewM, day);
                const isToday = today.jy === viewY && today.jm === viewM && today.jd === day;
                return (
                  <th key={day} className={cn("px-0 text-center text-[10px] leading-tight sm:text-xs", week === 6 ? "text-copper-deep" : "text-muted", isToday && "text-ink")}>
                    <span className="block">{WEEKDAYS_SHORT[week]}</span>
                    <span className="block text-xs font-extrabold sm:text-sm">{fa(day)}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {people.map((person) => {
              const stats = monthStats(person, viewY, viewM, leaves, customs, thursdayOff);
              const leave = stats.annual + stats.sick + stats.unpaid;
              return (
                <tr key={person.id}>
                  <th className={cn("sticky right-0 z-10 bg-card p-1 text-right", person.id === selectedId && "bg-cypress-soft")}>
                    <button type="button" onClick={() => select(person.id)} className="flex min-h-11 w-full flex-col justify-center rounded-xl px-2 text-right">
                      <span className="truncate text-sm font-extrabold">{person.name}</span>
                      <span className="truncate text-xs text-muted">{faDays(leave)} روز مرخصی</span>
                    </button>
                  </th>
                  {Array.from({ length: len }, (_, index) => {
                    const day = index + 1;
                    const ctx = dayContext(person, viewY, viewM, day, leaves, customs, thursdayOff);
                    const isToday = today.jy === viewY && today.jm === viewM && today.jd === day;
                    return (
                      <td key={day} className="p-0">
                        <button
                          type="button"
                          onClick={() => {
                            select(person.id);
                            onPick(person.id, day);
                          }}
                          className={cn("h-9 w-full rounded-md sm:h-11", toneClass(ctx), isToday && "outline-2 outline-ink")}
                          aria-label={`${person.name} ${fa(day)} ${MONTHS[viewM - 1]}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
