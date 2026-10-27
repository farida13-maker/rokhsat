import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { isValidJalaaliDate, jalaaliMonthLength, MONTHS, WEEKDAYS, fa, formatJalaali, weekdayIndex } from "@/lib/jalali";
import { dayContext, statusLabel } from "@/lib/leave-math";
import { useDesk } from "@/lib/store";
import { KIND_LABEL, ROLES, type Employee, type LeaveKind } from "@/lib/types";

const fieldClass =
  "min-h-11 w-full rounded-xl border border-line bg-card px-3 text-ink outline-none";

function Shell({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/40" />
        <Dialog.Content className="fixed inset-x-4 top-16 z-50 mx-auto max-h-dvh max-w-lg overflow-y-auto rounded-2xl border border-line bg-card p-5 shadow-card">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-xl font-extrabold">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-sm text-muted">
                  {description}
                </Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              )}
            </div>
            <Dialog.Close className="inline-flex size-11 items-center justify-center rounded-xl text-muted hover:bg-paper" aria-label="بستن">
              <X className="size-5" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function PersonDialog({
  mode,
  employee,
  yearHint,
  onClose,
}: {
  mode: "closed" | "create" | "edit";
  employee: Employee | null;
  yearHint: number;
  onClose: () => void;
}) {
  const open = mode !== "closed";
  const addEmployee = useDesk((state) => state.addEmployee);
  const updateEmployee = useDesk((state) => state.updateEmployee);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [year, setYear] = useState(yearHint);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(employee?.name ?? "");
    setRole(employee?.role ?? "");
    setYear(employee?.hire.y ?? yearHint);
    setMonth(employee?.hire.m ?? 1);
    setDay(employee?.hire.d ?? 1);
    setError("");
  }, [open, employee, yearHint]);

  const length = jalaaliMonthLength(year, month);
  const years = [];
  for (let y = 1385; y <= yearHint + 1; y += 1) years.push(y);

  function save(event: FormEvent) {
    event.preventDefault();
    const nextName = name.trim();
    const nextRole = role.trim();
    if (nextName.length < 2) {
      setError("نام را کامل‌تر بنویسید.");
      return;
    }
    if (nextRole.length < 2) {
      setError("سمت را مشخص کنید.");
      return;
    }
    const hireDay = Math.min(day, length);
    if (!isValidJalaaliDate(year, month, hireDay)) {
      setError("تاریخ شروع همکاری معتبر نیست.");
      return;
    }
    const input = { name: nextName, role: nextRole, hire: { y: year, m: month, d: hireDay } };
    if (employee) updateEmployee(employee.id, input);
    else addEmployee(input);
    onClose();
  }

  return (
    <Shell
      open={open}
      title={employee ? "ویرایش نیرو" : "افزودن نیرو"}
      description="نام، سمت و تاریخ شروع همکاری را وارد کنید."
      onClose={onClose}
    >
      <form onSubmit={save} className="grid gap-3">
        <label className="grid gap-1 text-sm font-semibold">
          نام و نام خانوادگی
          <input className={fieldClass} value={name} onChange={(event) => setName(event.target.value)} maxLength={40} autoComplete="name" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          سمت
          <input className={fieldClass} value={role} onChange={(event) => setRole(event.target.value)} list="role-list" maxLength={40} />
          <datalist id="role-list">
            {ROLES.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </label>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-semibold">شروع همکاری</legend>
          <div className="grid grid-cols-3 gap-2">
            <select className={fieldClass} value={day} onChange={(event) => setDay(Number(event.target.value))} aria-label="روز">
              {Array.from({ length }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>{fa(value)}</option>
              ))}
            </select>
            <select className={fieldClass} value={month} onChange={(event) => setMonth(Number(event.target.value))} aria-label="ماه">
              {MONTHS.map((label, index) => (
                <option key={label} value={index + 1}>{label}</option>
              ))}
            </select>
            <select className={fieldClass} value={year} onChange={(event) => setYear(Number(event.target.value))} aria-label="سال">
              {years.map((value) => (
                <option key={value} value={value}>{fa(value)}</option>
              ))}
            </select>
          </div>
        </fieldset>
        {error ? <p role="alert" className="text-sm text-copper-deep">{error}</p> : null}
        <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cypress font-semibold text-card hover:bg-cypress-deep">
          {employee ? "ذخیره تغییرات" : "افزودن به فهرست"}
        </button>
      </form>
    </Shell>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Shell open={open} title={title} description={body} onClose={onClose}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={onClose} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-line bg-card font-semibold">
          انصراف
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-copper font-semibold text-card hover:bg-copper-deep"
        >
          {confirmLabel}
        </button>
      </div>
    </Shell>
  );
}

const KINDS: LeaveKind[] = ["annual", "sick", "unpaid"];

export function DayDialog({
  target,
  onClose,
}: {
  target: { employeeId: string; d: number } | null;
  onClose: () => void;
}) {
  const employees = useDesk((state) => state.employees);
  const leaves = useDesk((state) => state.leaves);
  const customs = useDesk((state) => state.customs);
  const thursdayOff = useDesk((state) => state.thursdayOff);
  const viewY = useDesk((state) => state.viewY);
  const viewM = useDesk((state) => state.viewM);
  const setLeave = useDesk((state) => state.setLeave);
  const clearLeave = useDesk((state) => state.clearLeave);
  const employee = employees.find((item) => item.id === target?.employeeId);
  const ctx = employee && target
    ? dayContext(employee, viewY, viewM, target.d, leaves, customs, thursdayOff)
    : null;
  const [kind, setKind] = useState<LeaveKind>("annual");
  const [portion, setPortion] = useState<0.5 | 1>(1);
  const signature = ctx?.leave && ctx.workable ? `${ctx.leave.kind}:${ctx.leave.portion}` : "empty";

  useEffect(() => {
    if (signature === "empty") {
      setKind("annual");
      setPortion(1);
      return;
    }
    const [nextKind, nextPortion] = signature.split(":");
    setKind(nextKind as LeaveKind);
    setPortion(nextPortion === "0.5" ? 0.5 : 1);
  }, [target, signature]);

  return (
    <Shell
      open={Boolean(target && employee && ctx)}
      title={target ? formatJalaali(viewY, viewM, target.d) : "روز"}
      description={target ? `${WEEKDAYS[weekdayIndex(viewY, viewM, target.d)]} · ${employee?.name ?? ""}` : undefined}
      onClose={onClose}
    >
      {ctx && employee && target ? (
        <div className="grid gap-3">
          <p className="rounded-xl bg-paper px-3 py-2 text-sm">{statusLabel(ctx)}</p>
          {ctx.occasions.length ? (
            <ul className="flex flex-wrap gap-2">
              {ctx.occasions.map((item) => (
                <li key={item.title} className={cn("rounded-full px-3 py-1 text-sm", item.official ? "bg-copper-soft text-copper-deep" : "bg-paper text-muted")}>
                  {item.title}
                </li>
              ))}
            </ul>
          ) : null}
          {ctx.workable ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                {KINDS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={kind === item}
                    onClick={() => setKind(item)}
                    className={cn(
                      "min-h-11 rounded-xl border text-sm font-semibold",
                      kind === item ? "border-cypress bg-cypress text-card" : "border-line bg-card",
                    )}
                  >
                    {KIND_LABEL[item]}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[1, 0.5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={portion === value}
                    onClick={() => setPortion(value as 0.5 | 1)}
                    className={cn(
                      "min-h-11 rounded-xl border text-sm font-semibold",
                      portion === value ? "border-copper bg-copper-soft text-copper-deep" : "border-line bg-card",
                    )}
                  >
                    {value === 1 ? "تمام‌روز" : "نیم‌روز"}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted">
                {kind === "annual"
                  ? "فقط مرخصی استحقاقی از سهم ماهانه ۲٫۵ روز کم می‌شود."
                  : "این نوع از مانده استحقاق کم نمی‌شود و فقط روی تقویم می‌ماند."}
              </p>
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cypress font-semibold text-card hover:bg-cypress-deep"
                onClick={() => {
                  setLeave({ employeeId: employee.id, y: viewY, m: viewM, d: target.d, kind, portion });
                  onClose();
                }}
              >
                ثبت مرخصی
              </button>
            </>
          ) : (
            <p className="text-sm text-muted">در روز تعطیل یا پیش از شروع همکاری، مرخصی جدید ثبت نمی‌شود.</p>
          )}
          {ctx.leave ? (
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line font-semibold"
              onClick={() => {
                clearLeave(employee.id, viewY, viewM, target.d);
                onClose();
              }}
            >
              حذف مرخصی این روز
            </button>
          ) : null}
        </div>
      ) : null}
    </Shell>
  );
}

export function OccasionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const viewY = useDesk((state) => state.viewY);
  const viewM = useDesk((state) => state.viewM);
  const addCustom = useDesk((state) => state.addCustom);
  const length = jalaaliMonthLength(viewY, viewM);
  const [day, setDay] = useState(1);
  const [title, setTitle] = useState("");
  const [official, setOfficial] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setDay(1);
    setTitle("");
    setOfficial(false);
    setError("");
  }, [open]);

  return (
    <Shell open={open} title="افزودن مناسبت" description={`${MONTHS[viewM - 1]} ${fa(viewY)}`} onClose={onClose}>
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (title.trim().length < 2) {
            setError("عنوان مناسبت را بنویسید.");
            return;
          }
          addCustom({ y: viewY, m: viewM, d: day, title, official });
          onClose();
        }}
      >
        <label className="grid gap-1 text-sm font-semibold">
          روز
          <select className={fieldClass} value={day} onChange={(event) => setDay(Number(event.target.value))}>
            {Array.from({ length }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value}>{fa(value)} {MONTHS[viewM - 1]}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          عنوان
          <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} maxLength={60} />
        </label>
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" className="size-5 accent-cypress" checked={official} onChange={(event) => setOfficial(event.target.checked)} />
          این روز تعطیل رسمی حساب شود
        </label>
        {error ? <p role="alert" className="text-sm text-copper-deep">{error}</p> : null}
        <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cypress font-semibold text-card hover:bg-cypress-deep">
          افزودن به تقویم
        </button>
      </form>
    </Shell>
  );
}
