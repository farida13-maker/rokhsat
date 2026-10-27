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
