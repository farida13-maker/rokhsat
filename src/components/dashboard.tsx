import { CalendarDays, ChevronLeft, ChevronRight, Flag, Hourglass, Users } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { BrandMark } from "@/components/brand";
import { ConfirmDialog, DayDialog, OccasionDialog, PersonDialog } from "@/components/dialogs";
import { MonthBoard } from "@/components/month-board";
import { PeoplePanel } from "@/components/people-panel";
import { TeamGrid } from "@/components/team-grid";
import { cn } from "@/lib/cn";
import { officialDayCount, nextOfficial, isOfficialDay } from "@/lib/holidays";
import { fa, faDays, gregorianRange, MONTHS, todayJalaali, weekdayIndex } from "@/lib/jalali";
import { balanceOf, peopleOffToday } from "@/lib/leave-math";
import { useDesk } from "@/lib/store";
import type { Employee } from "@/lib/types";

function Kpi({
  icon,
  label,
  value,
  hint,
  alert,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  alert?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-line bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <span className={cn("inline-flex size-11 items-center justify-center rounded-xl", alert ? "bg-copper-soft text-copper-deep" : "bg-cypress-soft text-cypress-deep")}>
          {icon}
        </span>
      </div>
      <p className={cn("text-3xl font-extrabold", alert && "text-copper-deep")}>{value}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
    </article>
  );
}

export function Dashboard() {
  const employees = useDesk((state) => state.employees);
  const leaves = useDesk((state) => state.leaves);
  const customs = useDesk((state) => state.customs);
  const thursdayOff = useDesk((state) => state.thursdayOff);
  const selectedId = useDesk((state) => state.selectedId);
  const viewY = useDesk((state) => state.viewY);
  const viewM = useDesk((state) => state.viewM);
  const select = useDesk((state) => state.select);
  const shiftMonth = useDesk((state) => state.shiftMonth);
  const goToday = useDesk((state) => state.goToday);
  const removeEmployee = useDesk((state) => state.removeEmployee);
  const resetSample = useDesk((state) => state.resetSample);

  const [query, setQuery] = useState("");
  const [personMode, setPersonMode] = useState<"closed" | "create" | "edit">("closed");
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [dayTarget, setDayTarget] = useState<{ employeeId: string; d: number } | null>(null);
  const [occasionOpen, setOccasionOpen] = useState(false);

  useEffect(() => {
    if (selectedId && employees.some((person) => person.id === selectedId)) return;
    if (employees[0]) select(employees[0].id);
  }, [employees, selectedId, select]);

  const today = todayJalaali();
  const selected = employees.find((person) => person.id === selectedId) ?? null;
  const offToday = peopleOffToday(employees, today.jy, today.jm, today.jd, leaves, customs, thursdayOff);
  const holidayCount = officialDayCount(viewY, viewM, customs);
  const upcoming = nextOfficial(today.jy, today.jm, today.jd, customs);
  const todayIsOff = isOfficialDay(today.jy, today.jm, today.jd, customs);
  const todayWeek = weekdayIndex(today.jy, today.jm, today.jd);
  const todayClosed = todayIsOff || todayWeek === 6 || (thursdayOff && todayWeek === 5);
  const monthLeaves = leaves.filter((leave) => leave.y === viewY && leave.m === viewM);
  const totalLeft = employees.reduce(
    (sum, person) => sum + balanceOf(person, viewY, viewM, leaves, customs, thursdayOff).left,
    0,
  );
  const viewingToday = today.jy === viewY && today.jm === viewM;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="bg-cypress text-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <BrandMark className="size-12" />
            <div>
              <h1 className="font-display text-4xl leading-none">رخصت</h1>
              <p className="text-sm text-mist">دفتر مرخصی نیروها</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => shiftMonth(-1)} className="inline-flex min-h-11 items-center gap-1 rounded-xl bg-cypress-deep px-3 font-semibold" aria-label="ماه قبل">
              <ChevronRight className="size-5" />
              ماه قبل
            </button>
            <div className="min-w-40 px-2 text-center">
              <p className="text-xl font-extrabold">{MONTHS[viewM - 1]} {fa(viewY)}</p>
              <p className="text-xs text-mist">{gregorianRange(viewY, viewM)}</p>
            </div>
            <button type="button" onClick={() => shiftMonth(1)} className="inline-flex min-h-11 items-center gap-1 rounded-xl bg-cypress-deep px-3 font-semibold" aria-label="ماه بعد">
              ماه بعد
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => goToday(today.jy, today.jm)}
              className={cn("inline-flex min-h-11 items-center rounded-xl px-4 font-semibold", viewingToday ? "bg-card text-cypress-deep" : "bg-cypress-deep text-card")}
            >
              امروز
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 px-4 py-4">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi icon={<Users className="size-5" />} label="نیروها" value={fa(employees.length)} hint="قابل افزودن و حذف" />
          <Kpi
            icon={<CalendarDays className="size-5" />}
            label={todayClosed ? "مرخصی این ماه" : "مرخصی امروز"}
            value={fa(todayClosed ? monthLeaves.length : offToday.length)}
            hint={
              todayClosed
                ? `امروز ${todayWeek === 6 ? "جمعه" : "تعطیل"} است. در ${MONTHS[viewM - 1]} ${fa(monthLeaves.length)} مرخصی ثبت شده.`
                : offToday.length
                  ? offToday.map((person) => person.name).join("، ")
                  : "کسی امروز مرخصی ندارد"
            }
            alert={(todayClosed ? monthLeaves.length : offToday.length) > 0}
          />
          <Kpi
            icon={<Hourglass className="size-5" />}
            label="مانده کل تا این ماه"
            value={faDays(totalLeft)}
            hint="جمع استحقاق باقی‌مانده نیروها"
            alert={totalLeft < 0}
          />
          <Kpi
            icon={<Flag className="size-5" />}
            label="تعطیل رسمی این ماه"
            value={fa(holidayCount)}
            hint={
              todayIsOff
                ? "امروز خودش تعطیل رسمی است"
                : upcoming
                  ? `بعدی: ${fa(upcoming.d)} ${MONTHS[upcoming.m - 1]}، ${upcoming.title}`
                  : "تعطیل رسمی نزدیک پیدا نشد"
            }
          />
        </section>

        <div className="grid items-start gap-4 xl:grid-cols-12">
          <div className="min-w-0 xl:col-span-4">
            <PeoplePanel
              query={query}
              onQuery={setQuery}
              onCreate={() => {
                setEditTarget(null);
                setPersonMode("create");
              }}
              onEdit={(employee) => {
                setEditTarget(employee);
                setPersonMode("edit");
              }}
              onDelete={setDeleteTarget}
              onReset={() => setResetOpen(true)}
            />
          </div>
          <div className="min-w-0 xl:col-span-8">
            <MonthBoard
              employee={selected}
              onEdit={(employee) => {
                setEditTarget(employee);
                setPersonMode("edit");
              }}
              onPick={(employeeId, day) => setDayTarget({ employeeId, d: day })}
              onAddOccasion={() => setOccasionOpen(true)}
            />
          </div>
        </div>

        <TeamGrid onPick={(employeeId, day) => setDayTarget({ employeeId, d: day })} />

        <p className="pb-6 text-center text-sm text-muted">
          هر نیرو ماهانه ۲٫۵ روز مرخصی استحقاقی دارد. فهرست و مرخصی‌ها روی همین دستگاه می‌ماند.
        </p>
      </main>

      <PersonDialog
        mode={personMode}
        employee={personMode === "edit" ? editTarget : null}
        yearHint={today.jy}
        onClose={() => setPersonMode("closed")}
      />
      <DayDialog target={dayTarget} onClose={() => setDayTarget(null)} />
      <OccasionDialog open={occasionOpen} onClose={() => setOccasionOpen(false)} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف نیرو"
        body={deleteTarget ? `${deleteTarget.name} از فهرست حذف شود؟ مرخصی‌های ثبت‌شده‌اش هم پاک می‌شود.` : ""}
        confirmLabel="حذف"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) removeEmployee(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
      <ConfirmDialog
        open={resetOpen}
        title="بازگشت به نمونه"
        body="فهرست نیروها، مرخصی‌ها و مناسبت‌های خودتان پاک و نمونه اولیه جایگزین می‌شود."
        confirmLabel="جایگزینی نمونه"
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          resetSample(today.jy, today.jm);
          setResetOpen(false);
        }}
      />
    </div>
  );
}
