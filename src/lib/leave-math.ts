import { dayOccasions, type Occasion } from "@/lib/holidays";
import { isBeforeHire, faDays, jalaaliMonthLength, weekdayIndex } from "@/lib/jalali";
import {
  KIND_LABEL,
  MONTHLY_ALLOWANCE,
  type CustomOccasion,
  type Employee,
  type Leave,
  type LeaveKind,
} from "@/lib/types";

export type DayContext = {
  weekday: number;
  occasions: Occasion[];
  official: boolean;
  weekend: boolean;
  beforeHire: boolean;
  workable: boolean;
  leave?: Leave;
};

export type MonthStats = {
  len: number;
  present: number;
  annual: number;
  sick: number;
  unpaid: number;
  holiday: number;
  weekend: number;
  before: number;
};

export type Balance = {
  months: number;
  entitled: number;
  used: number;
  left: number;
};

export function findLeave(
  leaves: Leave[],
  employeeId: string,
  y: number,
  m: number,
  d: number,
) {
  return leaves.find(
    (leave) =>
      leave.employeeId === employeeId && leave.y === y && leave.m === m && leave.d === d,
  );
}

export function dayContext(
  employee: Employee,
  y: number,
  m: number,
  d: number,
  leaves: Leave[],
  customs: CustomOccasion[],
  thursdayOff: boolean,
): DayContext {
  const weekday = weekdayIndex(y, m, d);
  const occasions = dayOccasions(y, m, d, customs);
  const official = occasions.some((item) => item.official);
  const weekend = weekday === 6 || (thursdayOff && weekday === 5);
  const beforeHire = isBeforeHire(employee.hire, y, m, d);
  const leave = findLeave(leaves, employee.id, y, m, d);
  return {
    weekday,
    occasions,
    official,
    weekend,
    beforeHire,
    workable: !beforeHire && !official && !weekend,
    leave,
  };
}

export function countsAsAnnual(ctx: DayContext) {
  return Boolean(ctx.workable && ctx.leave?.kind === "annual");
}

export function accruedMonths(employee: Employee, year: number, throughMonth: number) {
  if (employee.hire.y > year) return 0;
  if (employee.hire.y < year) return throughMonth;
  if (employee.hire.m > throughMonth) return 0;
  return throughMonth - employee.hire.m + 1;
}

export function balanceOf(
  employee: Employee,
  year: number,
  throughMonth: number,
  leaves: Leave[],
  customs: CustomOccasion[],
  thursdayOff: boolean,
): Balance {
  const months = accruedMonths(employee, year, throughMonth);
  const entitled = months * MONTHLY_ALLOWANCE;
  const used = leaves.reduce((sum, leave) => {
    if (leave.employeeId !== employee.id || leave.kind !== "annual" || leave.y !== year) {
      return sum;
    }
    if (leave.m > throughMonth) return sum;
    const ctx = dayContext(employee, leave.y, leave.m, leave.d, leaves, customs, thursdayOff);
    if (!countsAsAnnual(ctx)) return sum;
    return sum + leave.portion;
  }, 0);
  return { months, entitled, used, left: entitled - used };
}

export function monthStats(
  employee: Employee,
  y: number,
  m: number,
  leaves: Leave[],
  customs: CustomOccasion[],
  thursdayOff: boolean,
): MonthStats {
  const len = jalaaliMonthLength(y, m);
  const stats: MonthStats = {
    len,
    present: 0,
    annual: 0,
    sick: 0,
    unpaid: 0,
    holiday: 0,
    weekend: 0,
    before: 0,
  };
  for (let d = 1; d <= len; d += 1) {
    const ctx = dayContext(employee, y, m, d, leaves, customs, thursdayOff);
    if (ctx.beforeHire) {
      stats.before += 1;
      continue;
    }
    if (ctx.official) {
      stats.holiday += 1;
      continue;
    }
    if (ctx.weekend) {
      stats.weekend += 1;
      continue;
    }
    if (ctx.leave) {
      const bucket: LeaveKind = ctx.leave.kind;
      stats[bucket] += ctx.leave.portion;
      stats.present += 1 - ctx.leave.portion;
    } else {
      stats.present += 1;
    }
  }
  return stats;
}

export function statusLabel(ctx: DayContext) {
  const names = ctx.occasions.map((item) => item.title).join("، ");
  if (ctx.beforeHire) return names ? `پیش از شروع همکاری، ${names}` : "پیش از شروع همکاری";
  if (!ctx.workable) {
    const base = ctx.official ? "تعطیل رسمی" : ctx.weekday === 6 ? "جمعه" : "پنجشنبه تعطیل";
    const dormant = ctx.leave ? "؛ مرخصی ثبت‌شده در تعطیل محاسبه نمی‌شود" : "";
    return names ? `${base}: ${names}${dormant}` : `${base}${dormant}`;
  }
  if (ctx.leave) {
    const portion = ctx.leave.portion === 1 ? "تمام‌روز" : "نیم‌روز";
    return `مرخصی ${KIND_LABEL[ctx.leave.kind]} ${portion}`;
  }
  return names ? `روز کاری، ${names}` : "روز کاری";
}

export function toneClass(ctx: DayContext) {
  if (ctx.beforeHire) return "bg-paper text-muted";
  if (ctx.workable && ctx.leave?.portion === 0.5) return "half-day";
  if (ctx.workable && ctx.leave?.kind === "annual") return "bg-copper text-card";
  if (ctx.workable && ctx.leave?.kind === "sick") return "bg-ink text-card";
  if (ctx.workable && ctx.leave?.kind === "unpaid") {
    return "bg-card text-ink ring-1 ring-inset ring-copper";
  }
  if (ctx.official) return "bg-sand text-copper-deep";
  if (ctx.weekend) return "bg-weekend text-muted";
  return "bg-cypress-soft text-cypress-deep";
}

export function balancePhrase(left: number) {
  if (left < -0.05) return `${faDays(Math.abs(left))} روز بدهکار`;
  if (Math.abs(left) < 0.05) return "مانده‌ای نیست";
  return `${faDays(left)} روز مانده`;
}

export function peopleOffToday(
  employees: Employee[],
  y: number,
  m: number,
  d: number,
  leaves: Leave[],
  customs: CustomOccasion[],
  thursdayOff: boolean,
) {
  return employees.filter((employee) => {
    const ctx = dayContext(employee, y, m, d, leaves, customs, thursdayOff);
    return Boolean(ctx.workable && ctx.leave);
  });
}
