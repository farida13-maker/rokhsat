import { Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { hasLunarYear, monthOccasionRows } from "@/lib/holidays";
import {
  fa,
  faDays,
  formatJalaali,
  jalaaliMonthLength,
  MONTHS,
  todayJalaali,
  WEEKDAYS_SHORT,
  weekdayIndex,
} from "@/lib/jalali";
import { balanceOf, balancePhrase, dayContext, monthStats, toneClass, type DayContext } from "@/lib/leave-math";
import { MonthChart, type Slice } from "@/components/month-chart";
import { Legend } from "@/components/legend";
import { useDesk } from "@/lib/store";
import { KIND_LABEL, MONTHLY_ALLOWANCE, type Employee } from "@/lib/types";

function cellCaption(ctx: DayContext) {
  if (ctx.workable && ctx.leave) {
    return ctx.leave.portion === 0.5 ? "نیم‌روز" : KIND_LABEL[ctx.leave.kind];
  }
  if (ctx.official) return "تعطیل";
  if (ctx.weekend && !ctx.beforeHire) return ctx.weekday === 6 ? "جمعه" : "پنجشنبه";
  return "";
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-2xl bg-paper px-3 py-3">
      <p className="text-sm text-muted">{label}</p>
      <p className={cn("text-2xl font-extrabold", tone)}>{value}</p>
    </div>
  );
}

export function MonthBoard({
  employee,
  onEdit,
  onPick,
  onAddOccasion,
}: {
  employee: Employee | null;
  onEdit: (employee: Employee) => void;
  onPick: (employeeId: string, day: number) => void;
  onAddOccasion: () => void;
}) {
  const leaves = useDesk((state) => state.leaves);
  const customs = useDesk((state) => state.customs);
  const thursdayOff = useDesk((state) => state.thursdayOff);
  const setThursdayOff = useDesk((state) => state.setThursdayOff);
  const removeCustom = useDesk((state) => state.removeCustom);
  const viewY = useDesk((state) => state.viewY);
  const viewM = useDesk((state) => state.viewM);
  const today = todayJalaali();

  if (!employee) {
    return (
      <section className="rounded-2xl border border-dashed border-line bg-card p-8 text-center shadow-card">
        <h2 className="text-xl font-extrabold">دفتر خالی است</h2>
        <p className="mt-2 text-muted">اولین نیرو را اضافه کنید تا تقویم ماهانه‌اش ساخته شود.</p>
      </section>
    );
  }

  const stats = monthStats(employee, viewY, viewM, leaves, customs, thursdayOff);
  const balance = balanceOf(employee, viewY, viewM, leaves, customs, thursdayOff);
  const len = jalaaliMonthLength(viewY, viewM);
  const lead = weekdayIndex(viewY, viewM, 1);
  const rows = monthOccasionRows(viewY, viewM, customs);
  const leaveTotal = stats.annual + stats.sick + stats.unpaid;
  const slices: Slice[] = [
    { name: "حضور", value: stats.present, fill: "var(--color-cypress)" },
    { name: "مرخصی استحقاقی", value: stats.annual, fill: "var(--color-copper)" },
    { name: "استعلاجی", value: stats.sick, fill: "var(--color-ink)" },
    { name: "بدون حقوق", value: stats.unpaid, fill: "var(--color-muted)" },
    { name: "تعطیل رسمی", value: stats.holiday, fill: "var(--color-sand)" },
    { name: "آخر هفته", value: stats.weekend, fill: "var(--color-weekend)" },
    { name: "پیش از همکاری", value: stats.before, fill: "var(--color-line)" },
  ];

  return (
    <section className="rounded-2xl border border-line bg-card p-3 shadow-card sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{MONTHS[viewM - 1]} {fa(viewY)}</p>
          <h2 className="text-2xl font-extrabold">{employee.name}</h2>
          <p className="text-sm text-muted">
            {employee.role} · شروع همکاری {formatJalaali(employee.hire.y, employee.hire.m, employee.hire.d)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className={cn("rounded-full px-3 py-2 text-sm font-semibold", balance.left < 0 ? "bg-copper-soft text-copper-deep" : "bg-cypress-soft text-cypress-deep")}>
            {balancePhrase(balance.left)}
          </p>
          <button type="button" onClick={() => onEdit(employee)} className="inline-flex size-11 items-center justify-center rounded-xl border border-line" aria-label="ویرایش نیرو">
            <Pencil className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="grid grid-cols-3 gap-2">
          <Stat label="حضور" value={faDays(stats.present)} tone="text-cypress-deep" />
          <Stat label="مرخصی" value={faDays(leaveTotal)} tone="text-copper-deep" />
          <Stat label="تعطیل" value={faDays(stats.holiday + stats.weekend)} />
        </div>
        <div className="relative">
          <MonthChart slices={slices} />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-extrabold">{fa(len)}</p>
              <p className="text-xs text-muted">روز ماه</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 overflow-x-auto">
        <div className="flex min-w-max gap-1">
          {Array.from({ length: len }, (_, index) => {
            const day = index + 1;
            const ctx = dayContext(employee, viewY, viewM, day, leaves, customs, thursdayOff);
            const isToday = today.jy === viewY && today.jm === viewM && today.jd === day;
            return (
              <button
                key={day}
                type="button"
                title={`${formatJalaali(viewY, viewM, day)} — ${cellCaption(ctx) || "کاری"}`}
                onClick={() => onPick(employee.id, day)}
                className={cn("h-11 w-8 rounded-md", toneClass(ctx), isToday && "outline-2 outline-offset-2 outline-ink")}
                aria-label={`${formatJalaali(viewY, viewM, day)} ${cellCaption(ctx)}`}
              />
            );
          })}
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">نوار ماه: هر خانه یک روز، از راست به چپ.</p>

      <div className="mt-4">
        <Legend />
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {WEEKDAYS_SHORT.map((label, index) => (
          <div key={label} className={cn("py-1 text-center text-sm font-semibold", index === 6 ? "text-copper-deep" : "text-muted")}>
            {label}
          </div>
        ))}
        {Array.from({ length: lead }, (_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {Array.from({ length: len }, (_, index) => {
          const day = index + 1;
          const ctx = dayContext(employee, viewY, viewM, day, leaves, customs, thursdayOff);
          const isToday = today.jy === viewY && today.jm === viewM && today.jd === day;
          const caption = cellCaption(ctx);
          const dark = Boolean(ctx.workable && ctx.leave && (ctx.leave.portion === 0.5 || ctx.leave.kind !== "unpaid"));
          return (
            <button
              key={day}
              type="button"
              onClick={() => onPick(employee.id, day)}
              className={cn(
                "flex min-h-14 flex-col rounded-xl px-1 py-1 text-right",
                toneClass(ctx),
                isToday && "outline-2 outline-offset-2 outline-ink",
              )}
              aria-label={`${formatJalaali(viewY, viewM, day)} ${caption}`}
            >
              <span className={cn("self-start rounded-md px-1 text-sm font-extrabold", dark && "bg-card/90 text-ink")}>
                {fa(day)}
              </span>
              <span className="mt-auto truncate text-xs">{caption}</span>
            </button>
          );
        })}
      </div>

      <label className="mt-4 flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          className="size-5 accent-cypress"
          checked={thursdayOff}
          onChange={(event) => setThursdayOff(event.target.checked)}
        />
        پنجشنبه هم تعطیل است
      </label>

      <details className="mt-2 rounded-xl bg-paper px-3 py-2 text-sm text-muted">
        <summary className="min-h-11 cursor-pointer font-semibold text-ink">محاسبه مانده</summary>
        <p className="pb-2">
          تا پایان {MONTHS[viewM - 1]}، {fa(balance.months)} ماه × {faDays(MONTHLY_ALLOWANCE)} روز شده است؛ یعنی {faDays(balance.entitled)} روز استحقاق.
          از این مقدار {faDays(balance.used)} روز استحقاقی مصرف شده. استعلاجی و بدون حقوق مانده را کم نمی‌کنند.
          جمعه و تعطیل رسمی روز مرخصی حساب نمی‌شوند. ماه شروع همکاری کامل محاسبه می‌شود.
        </p>
      </details>

      <div className="mt-4 flex items-center justify-between gap-3">
        <h3 className="font-extrabold">مناسبت‌های ماه</h3>
        <button type="button" onClick={onAddOccasion} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-3 text-sm font-semibold">
          <Plus className="size-4" />
          مناسبت
        </button>
      </div>
      {!hasLunarYear(viewY) ? (
        <p className="mt-2 text-sm text-muted">
          تعطیلات قمری این سال در دفتر نیست. تعطیلات شمسی ثابت هست و می‌توانید مناسبت اضافه کنید.
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted">تعطیلات قمری ۱۴۰۴ تا ۱۴۰۶ ثبت شده و ممکن است با رؤیت هلال یک روز جابه‌جا شود.</p>
      )}
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted">مناسبتی برای این ماه ثبت نشده.</p>
      ) : (
        <ul className="mt-2 grid gap-2">
          {rows.map((row) => (
            <li key={row.d} className="flex items-start gap-3 rounded-xl bg-paper px-3 py-2">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-card font-extrabold">
                {fa(row.d)}
              </span>
              <span className="min-w-0 flex-1 py-1">
                {row.items.map((item) => (
                  <span key={`${row.d}-${item.title}`} className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-sm">
                      {item.title}
                      {item.official ? <span className="mr-2 rounded-full bg-copper-soft px-2 py-0.5 text-xs text-copper-deep">تعطیل</span> : null}
                    </span>
                    {item.customId ? (
                      <button type="button" className="inline-flex size-11 items-center justify-center text-copper-deep" aria-label={`حذف ${item.title}`} onClick={() => removeCustom(item.customId!)}>
                        <Trash2 className="size-4" />
                      </button>
                    ) : null}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
