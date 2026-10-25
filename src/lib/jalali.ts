import {
  isValidJalaaliDate,
  jalaaliMonthLength,
  toGregorian,
  toJalaali,
} from "jalaali-js";

export { isValidJalaaliDate, jalaaliMonthLength };

export const MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

export const WEEKDAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
] as const;

export const WEEKDAYS_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const;

const GREG_MONTHS = [
  "ژانویه",
  "فوریه",
  "مارس",
  "آوریل",
  "مه",
  "ژوئن",
  "ژوئیه",
  "اوت",
  "سپتامبر",
  "اکتبر",
  "نوامبر",
  "دسامبر",
];

const DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function fa(value: number | string): string {
  return String(value)
    .replace(/\d/g, (digit) => DIGITS[Number(digit)] ?? digit)
    .replace(/\./g, "٫");
}

export function faDays(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return fa(text);
}

export function todayJalaali() {
  const now = new Date();
  return toJalaali(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate());
}

/** 0 = شنبه … 6 = جمعه */
export function weekdayIndex(y: number, m: number, d: number) {
  const g = toGregorian(y, m, d);
  const js = new Date(g.gy, g.gm - 1, g.gd).getDay();
  return (js + 1) % 7;
}

export function formatJalaali(y: number, m: number, d: number) {
  return `${fa(d)} ${MONTHS[m - 1]} ${fa(y)}`;
}

export function gregorianRange(y: number, m: number) {
  const len = jalaaliMonthLength(y, m);
  const start = toGregorian(y, m, 1);
  const end = toGregorian(y, m, len);
  const startLabel = `${fa(start.gd)} ${GREG_MONTHS[start.gm - 1]}`;
  const endLabel = `${fa(end.gd)} ${GREG_MONTHS[end.gm - 1]} ${fa(end.gy)}`;
  if (start.gy === end.gy && start.gm === end.gm) {
    return `${fa(start.gd)} تا ${fa(end.gd)} ${GREG_MONTHS[start.gm - 1]} ${fa(start.gy)}`;
  }
  if (start.gy === end.gy) return `${startLabel} تا ${endLabel}`;
  return `${startLabel} ${fa(start.gy)} تا ${endLabel}`;
}

export function shiftMonth(y: number, m: number, delta: number) {
  let index = y * 12 + (m - 1) + delta;
  const min = 1380 * 12;
  const max = 1450 * 12 + 11;
  if (index < min) index = min;
  if (index > max) index = max;
  return { y: Math.floor(index / 12), m: (index % 12) + 1 };
}

export function isBeforeHire(
  hire: { y: number; m: number; d: number },
  y: number,
  m: number,
  d: number,
) {
  if (y !== hire.y) return y < hire.y;
  if (m !== hire.m) return m < hire.m;
  return d < hire.d;
}
